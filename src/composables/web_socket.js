import { nanoid } from 'nanoid'

import { addLine, state } from '@/static/state'
import { onWebSocketEvent } from '@/static/web_socket_handlers'

export function useWebSocket () {
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
        }

        if (import.meta.env.MODE == 'development') {
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

    if (import.meta.env.MODE == 'development') {
      console.log(`%c>%c ${cmd}`, 'background-color: #662222; color: #fff', 'color: #ff3333', msg)
    }

    state.websocketConnection.send(JSON.stringify(out))
  }

  function sendWithResponse (cmd, msg, reqId = false) {
    if (reqId && state.pendingRequests[reqId]) {
      return state.pendingRequests[reqId].promise
    }

    reqId = reqId || nanoid()

    if (import.meta.env.MODE == 'development') {
      console.log(`%c>%c ${cmd} %c${msg ? JSON.stringify(msg) : ''} reqId=${reqId}`, 'background-color: #662222; color: #fff', 'color: #ff3333', 'color: #ffcccc')
    }

    let responsePromise = new Promise((resolve, reject) => {
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

    state.websocketConnection.send(JSON.stringify({ cmd, msg, reqId }))

    return responsePromise
  }

  function runCommand (command, id, fromTrigger) {
    if (!id) {
      // Crude filter to avoid shouting the ugly 'look iid:123456' in the output
      const lcCmd = command.toLowerCase()
      const excludeIIDCommand = (lcCmd.includes('iid:') || lcCmd.includes('eid:')) && !lcCmd.includes('chat ') && !lcCmd.includes('say ')
          && !lcCmd.includes('trade ') && !lcCmd.includes('newbie ')
      if (!excludeIIDCommand) {
        if (fromTrigger) {
          addLine(`<span class="player-cmd-caret">> ${command}</span>`, 'output')
        } else {
          addLine('', 'output')
          addLine(`<span class="player-cmd-caret">></span> <span class="player-cmd">${command}</span>`, 'output')
          addLine('', 'output')
        }
      }
    }

    send('cmd', command, id)
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
    if (state.cache.entityCache[eid] && !skipCache) {
      return state.cache.entityCache[eid].entity
    }

    const reqId = `entity-${eid}`
    let { msg } = await sendWithResponse('entity', { eid }, reqId)
    state.cache.entityCache[eid] = { entity: msg, date: Date.now() }
    return msg
  }

  async function fetchEntities (eids) {
    let fetchEids = eids.filter(eid => !state.cache.entityCache[eid])
    if (!fetchEids.length) {
      return eids.map(eid => state.cache.entityCache[eid].entity)
    }

    let { msg } = await sendWithResponse('entities', { eids: fetchEids })
    for (let entity of msg) {
      state.cache.entityCache[entity.eid] = { entity, date: Date.now() }
    }
    return eids
      .map(eid => {
        return state.cache.entityCache[eid] ?
          state.cache.entityCache[eid].entity :
          false
      })
      .filter(entity => entity)
  }

  async function fetchItem (iid)  {
    if (state.cache.itemCache[iid]) {
      return state.cache.itemCache[iid].item
    }

    const reqId = `item-${iid}`
    let { msg } = await sendWithResponse('item', { iid }, reqId)
    state.cache.itemCache[iid] = { item: msg, date: Date.now() }
    return msg
  }

  async function fetchItems (iids) {
    let fetchIids = iids.filter(iid => !state.cache.itemCache[iid])
    if (!fetchIids.length) {
      return iids.map(iid => state.cache.itemCache[iid].item)
    }

    let { msg } = await sendWithResponse('items', { iids: fetchIids })

    for (let item of msg) {
      state.cache.itemCache[item.iid] = { item, date: Date.now() }
    }

    return iids
      .map(iid => {
        return state.cache.itemCache[iid] ?
          state.cache.itemCache[iid].item :
          false
      })
      .filter(item => item)
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
  }
}
