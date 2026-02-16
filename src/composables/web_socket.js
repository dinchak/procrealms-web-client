import { nanoid } from 'nanoid'

import { addLine, state } from '@/static/state'
import { onWebSocketEvent } from '@/static/web_socket_handlers'
import {
  CACHE_MAX_COMMAND_ENTRIES,
  CACHE_MAX_ENTITY_ENTRIES,
  CACHE_MAX_ITEM_ENTRIES
} from '@/static/constants'

const IS_DEVELOPMENT = import.meta.env.MODE == 'development'

export function useWebSocket () {
  function isTimeoutError (err) {
    return err instanceof Error && err.message.includes('timed out')
  }

  function handleFetchError (metricKey, err, context = '') {
    if (isTimeoutError(err)) {
      incrementDiagnostic('cache', metricKey)
      if (IS_DEVELOPMENT) {
        console.warn(`[cache] request timed out${context ? ` (${context})` : ''}:`, err.message)
      }
      return
    }

    throw err
  }

  function incrementDiagnostic (group, key, amount = 1) {
    if (!IS_DEVELOPMENT || !state.diagnostics[group]) {
      return
    }

    state.diagnostics[group][key] = (state.diagnostics[group][key] || 0) + amount
  }

  function pruneCacheByDate (cacheObject, maxEntries, evictionMetric) {
    const entries = Object.entries(cacheObject)
    if (entries.length <= maxEntries) {
      return
    }

    entries
      .sort(([, a], [, b]) => {
        const aDate = a && a.date ? a.date : 0
        const bDate = b && b.date ? b.date : 0
        return aDate - bDate
      })
      .slice(0, entries.length - maxEntries)
      .forEach(([key]) => {
        delete cacheObject[key]
        incrementDiagnostic('cache', evictionMetric)
      })
  }

  function pruneCommandCache () {
    const keys = Object.keys(state.cache.commandCache)
    if (keys.length <= CACHE_MAX_COMMAND_ENTRIES) {
      return
    }

    keys.slice(0, keys.length - CACHE_MAX_COMMAND_ENTRIES).forEach(key => {
      delete state.cache.commandCache[key]
      incrementDiagnostic('cache', 'commandCacheEvictions')
    })
  }

  function getBatchKey (prefix, ids) {
    const normalized = [...new Set(ids)]
      .filter(id => id !== undefined && id !== null)
      .map(id => String(id))
      .sort()

    return `${prefix}:${normalized.join(',')}`
  }

  function initConnection ({ onConnect, onClose, url }) {
    try {
      state.websocketConnection = new window.WebSocket(url)

      state.websocketConnection.onopen = onConnect
      state.websocketConnection.onclose = onClose
      state.websocketConnection.onmessage = ({ data }) => _onMessage(data)
    } catch (err) {
      console.log(err.stack)
    }

    const _onMessage = json => {
      try {
        let { cmd, msg, reqId } = JSON.parse(json)

        if (reqId) {
          state.cache.commandCache[reqId] = msg
          pruneCommandCache()
        }

        if (IS_DEVELOPMENT) {
          console.log(`%c<%c ${cmd}${reqId ? ` (reqId=${reqId})` : ''}`, 'background-color: #226622; color: #fff', 'color: #33ff33', msg)
        }

        if (reqId) {
          onWebSocketEvent(cmd, msg, reqId)
        } else {
          onWebSocketEvent(cmd, msg)
        }
      } catch (err) {
        console.log('error parsing message: %s', json)
        console.log(err.stack)
      }
    }
  }

  function send (cmd, msg) {
    let out = { cmd, msg }

    if (IS_DEVELOPMENT) {
      console.log(`%c>%c ${cmd}`, 'background-color: #662222; color: #fff', 'color: #ff3333', msg)
    }

    state.websocketConnection.send(JSON.stringify(out))
  }

  function sendWithResponse (cmd, msg, reqId = false) {
    if (reqId && state.pendingRequests[reqId] && reqId != 'the_void') {
      return state.pendingRequests[reqId].promise
    }

    reqId = reqId || nanoid()

    if (IS_DEVELOPMENT) {
      console.log(`%c>%c ${cmd} %c${msg ? JSON.stringify(msg) : ''} reqId=${reqId}`, 'background-color: #662222; color: #fff', 'color: #ff3333', 'color: #ffcccc')
    }

    let responsePromise = null
    if (reqId != 'the_void') {
      responsePromise = new Promise((resolve, reject) => {
        let timeout = setTimeout(() => {
          delete state.pendingRequests[reqId]
          reject(new Error(`Request for ${cmd} timed out after 5 seconds (reqId=${reqId})`))
        }, 5000)

        state.pendingRequests[reqId] = {
          resolve: (responseCmd, responseMsg) => {
            clearTimeout(timeout)
            resolve({ cmd: responseCmd, msg: responseMsg })
          }
        }
      })

      state.pendingRequests[reqId].promise = responsePromise
    }

    state.websocketConnection.send(JSON.stringify({ cmd, msg, reqId }))

    return responsePromise
  }

  function runCommand (command, reqId = null) {
    addLine(`<span class="black">></span> <span class="bold-yellow">${command}</span>`, 'output')
    if (reqId) {
      return sendWithResponse('cmd', command, reqId)
    } else {
      send('cmd', command)
    }
  }

  function move (dir) {
    if (state.moveTimeout) {
      return
    }

    let { room } = state.gameState
    if (!room || !room.exits.includes(dir)) {
      return
    }

    runCommand(dir)

    state.moveTimeout = setTimeout(() => {
      state.moveTimeout = null
    }, 100)
  }

  function enter () {
    if (state.moveTimeout) {
      return
    }

    let { room } = state.gameState
    if (!room || !room.canEnter) {
      return
    }

    runCommand('enter')

    state.moveTimeout = setTimeout(() => {
      state.moveTimeout = null
    }, 100)
  }

  async function fetchEntity (eid, skipCache) {
    incrementDiagnostic('cache', 'fetchEntityCalls')

    if (state.cache.entityCache[eid] && !skipCache) {
      state.cache.entityCache[eid].date = Date.now()
      incrementDiagnostic('cache', 'fetchEntityCacheHits')
      return state.cache.entityCache[eid].entity
    }

    incrementDiagnostic('cache', 'fetchEntityCacheMisses')

    const reqId = `entity-${eid}`
    let msg = null
    try {
      ({ msg } = await sendWithResponse('entity', { eid }, reqId))
    } catch (err) {
      handleFetchError('fetchEntityTimeouts', err, `entity:${eid}`)
      return state.cache.entityCache[eid] ? state.cache.entityCache[eid].entity : null
    }

    state.cache.entityCache[eid] = { entity: msg, date: Date.now() }
    pruneCacheByDate(state.cache.entityCache, CACHE_MAX_ENTITY_ENTRIES, 'entityCacheEvictions')
    return msg
  }

  async function fetchEntities (eids) {
    incrementDiagnostic('cache', 'fetchEntitiesCalls')

    const orderedEids = (eids || []).filter(eid => eid !== undefined && eid !== null)
    const uniqueEids = [...new Set(orderedEids)]
    incrementDiagnostic('cache', 'fetchEntitiesRequestedIds', uniqueEids.length)

    for (let eid of uniqueEids) {
      if (state.cache.entityCache[eid]) {
        state.cache.entityCache[eid].date = Date.now()
      }
    }

    let fetchEids = uniqueEids.filter(eid => !state.cache.entityCache[eid])
    incrementDiagnostic('cache', 'fetchEntitiesCacheMissIds', fetchEids.length)

    if (!fetchEids.length) {
      return orderedEids
        .map(eid => state.cache.entityCache[eid] ? state.cache.entityCache[eid].entity : false)
        .filter(entity => entity)
    }

    const batchKey = getBatchKey('entities', fetchEids)
    if (!state.cache.inflightEntityRequests[batchKey]) {
      incrementDiagnostic('cache', 'fetchEntitiesBatchRequests')
      state.cache.inflightEntityRequests[batchKey] = sendWithResponse('entities', { eids: fetchEids })
        .then(({ msg }) => {
          const entities = Array.isArray(msg) ? msg : []
          const now = Date.now()

          for (let entity of entities) {
            if (!entity || entity.eid === undefined || entity.eid === null) {
              continue
            }

            if (entity.removed) {
              delete state.cache.entityCache[entity.eid]
              continue
            }

            state.cache.entityCache[entity.eid] = { entity, date: now }
          }

          pruneCacheByDate(state.cache.entityCache, CACHE_MAX_ENTITY_ENTRIES, 'entityCacheEvictions')
        })
        .finally(() => {
          delete state.cache.inflightEntityRequests[batchKey]
        })
    } else {
      incrementDiagnostic('cache', 'fetchEntitiesBatchDeduped')
    }

    const fetchStart = Date.now()
    try {
      await state.cache.inflightEntityRequests[batchKey]
    } catch (err) {
      handleFetchError('fetchEntitiesTimeouts', err, `entities:${fetchEids.length}`)
      return orderedEids
        .map(eid => {
          return state.cache.entityCache[eid] ?
            state.cache.entityCache[eid].entity :
            false
        })
        .filter(entity => entity)
    }

    incrementDiagnostic('cache', 'fetchEntitiesTotalMs', Date.now() - fetchStart)

    return orderedEids
      .map(eid => {
        return state.cache.entityCache[eid] ?
          state.cache.entityCache[eid].entity :
          false
      })
      .filter(entity => entity)
  }

  async function fetchItem (iid, skipCache = false)  {
    incrementDiagnostic('cache', 'fetchItemCalls')

    if (state.cache.itemCache[iid] && !skipCache) {
      state.cache.itemCache[iid].date = Date.now()
      incrementDiagnostic('cache', 'fetchItemCacheHits')
      return state.cache.itemCache[iid].item
    }

    incrementDiagnostic('cache', 'fetchItemCacheMisses')

    const reqId = `item-${iid}`
    let msg = null
    try {
      ({ msg } = await sendWithResponse('item', { iid }, reqId))
    } catch (err) {
      handleFetchError('fetchItemTimeouts', err, `item:${iid}`)
      return state.cache.itemCache[iid] ? state.cache.itemCache[iid].item : {}
    }

    if (msg.removed) {
      delete state.cache.itemCache[iid]
    } else {
      state.cache.itemCache[iid] = { item: msg, date: Date.now() }
      pruneCacheByDate(state.cache.itemCache, CACHE_MAX_ITEM_ENTRIES, 'itemCacheEvictions')
    }
    return msg
  }

  async function fetchItems (iids) {
    incrementDiagnostic('cache', 'fetchItemsCalls')

    const orderedIids = (iids || []).filter(iid => iid !== undefined && iid !== null)
    const uniqueIids = [...new Set(orderedIids)]
    incrementDiagnostic('cache', 'fetchItemsRequestedIds', uniqueIids.length)

    for (let iid of uniqueIids) {
      if (state.cache.itemCache[iid]) {
        state.cache.itemCache[iid].date = Date.now()
      }
    }

    let fetchIids = uniqueIids.filter(iid => !state.cache.itemCache[iid])
    incrementDiagnostic('cache', 'fetchItemsCacheMissIds', fetchIids.length)

    if (!fetchIids.length) {
      return orderedIids
        .map(iid => state.cache.itemCache[iid] ? state.cache.itemCache[iid].item : false)
        .filter(item => item)
    }

    const batchKey = getBatchKey('items', fetchIids)
    if (!state.cache.inflightItemRequests[batchKey]) {
      incrementDiagnostic('cache', 'fetchItemsBatchRequests')
      state.cache.inflightItemRequests[batchKey] = sendWithResponse('items', { iids: fetchIids })
        .then(({ msg }) => {
          const fetchedItems = Array.isArray(msg) ? msg : []
          const now = Date.now()

          for (let item of fetchedItems) {
            if (!item || item.iid === undefined || item.iid === null) {
              continue
            }

            if (item.removed) {
              delete state.cache.itemCache[item.iid]
              continue
            }

            state.cache.itemCache[item.iid] = { item, date: now }
          }

          pruneCacheByDate(state.cache.itemCache, CACHE_MAX_ITEM_ENTRIES, 'itemCacheEvictions')
        })
        .finally(() => {
          delete state.cache.inflightItemRequests[batchKey]
        })
    } else {
      incrementDiagnostic('cache', 'fetchItemsBatchDeduped')
    }

    const fetchStart = Date.now()
    try {
      await state.cache.inflightItemRequests[batchKey]
    } catch (err) {
      handleFetchError('fetchItemsTimeouts', err, `items:${fetchIids.length}`)
      return orderedIids
        .map(iid => {
          return state.cache.itemCache[iid] ?
            state.cache.itemCache[iid].item :
            false
        })
        .filter(item => item)
    }

    incrementDiagnostic('cache', 'fetchItemsTotalMs', Date.now() - fetchStart)

    return orderedIids
      .map(iid => {
        return state.cache.itemCache[iid] ?
          state.cache.itemCache[iid].item :
          false
      })
      .filter(item => item)
  }

  async function fetchAuction (id)  {
    if (state.cache.auctionCache[id]) {
      return state.cache.auctionCache[id].auction
    }

    let { msg } = await sendWithResponse('auction', { id })
    state.cache.auctionCache[id] = { auction: msg, date: Date.now() }
    return msg
  }

  async function refreshEntity (eid) {
    delete state.cache.entityCache[eid]
    await fetchEntity(eid, true)
    state.updateCounter++
  }

  async function refreshItem (iid) {
    delete state.cache.itemCache[iid]
    await fetchItem(iid, true)
    state.updateCounter++
  }

  return {
    initConnection,
    send, sendWithResponse, runCommand,
    move, enter,
    fetchEntity, fetchEntities, refreshEntity,
    fetchItem, fetchItems, refreshItem,
    fetchAuction
  }
}
