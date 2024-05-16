import { nanoid } from 'nanoid'

import { addLine, state } from '@/static/state'
import { onWebSocketEvent } from '@/static/web_socket_handlers'

export function useWebSocket () {
  function initConnection ({ onConnect, onClose, url }) {
    console.log(`mode=${import.meta.env.MODE}`)
    try {
      state.websocketConnection = new window.WebSocket(url)

      state.websocketConnection.onopen = onConnect
      state.websocketConnection.onclose = onClose
      state.websocketConnection.onmessage = ({ data }) => _onMessage(data)
    } catch (err) {
      console.log(err.stack)
    }

    const _onMessage = (json) => {
      try {
        let { cmd, msg, reqId } = JSON.parse(json)
        if (reqId) {
          state.cache.commandCache[reqId] = msg
        }
        if (import.meta.env.MODE == 'development') {
          console.log(`%c<%c ${cmd} %c${msg ? JSON.stringify(msg) : ''} ${reqId ? ` (reqId=${reqId})` : ''}`, 'background-color: #226622; color: #fff', 'color: #33ff33', 'color: #ccffcc')
        }

        reqId ? onWebSocketEvent(cmd, msg, reqId) : onWebSocketEvent(cmd, msg)
      } catch (err) {
        console.log('error parsing message: %s', json)
        console.log(err.stack)
      }
    }
  }

  function send (cmd, msg) {
    let out = { cmd, msg }

    if (import.meta.env.MODE == 'development') {
      console.log(`%c>%c ${cmd} %c${msg ? JSON.stringify(msg) : ''}`, 'background-color: #662222; color: #fff', 'color: #ff3333', 'color: #ffcccc')
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

  function cmd (command, id, fromTrigger) {
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
  
    cmd(dir)
  
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
    cmd('enter')
  
    state.moveTimeout = setTimeout(() => {
      state.moveTimeout = null
    }, 100)
  }  

  async function fetchEntity (eid, skipCache) {
    if (state.cache.entityCache[eid] && !skipCache) {
      return new Promise((resolve) => resolve(state.cache.entityCache[eid].entity))
    }

    const reqId = `entity-${eid}`
    let entity = await sendWithResponse('entity', { eid }, reqId)
    state.cache.entityCache[eid] = { entity, date: Date.now() }
    return entity
  }

  async function fetchEntities (eids) {
    let fetchEids = eids.filter(eid => !state.cache.entityCache[eid])
    if (!fetchEids.length) {
      return new Promise((resolve) => {
        let entities = []
        for (let eid of eids) {
          entities.push(state.cache.entityCache[eid].entity)
        }
        resolve(entities)
      })
    }

    let { msg } = await sendWithResponse('entities', { eids: fetchEids })
    for (let entity of msg) {
      state.cache.entityCache[entity.eid] = { entity, date: Date.now() }
    }
    return msg
  }

  async function fetchItem (iid)  {
    if (state.cache.itemCache[iid]) {
      return new Promise((resolve) => resolve(state.cache.itemCache[iid].item))
    }

    const reqId = `item-${iid}`
    let item = await sendWithResponse('item', { iid }, reqId)
    state.cache.itemCache[iid] = { item, date: Date.now() }
    return item
  }

  async function fetchItems (iids) {
    let fetchIids = iids.filter(iid => !state.cache.itemCache[iid])
    if (!fetchIids.length) {
      return new Promise((resolve) => {
        let items = []
        for (let iid of iids) {
          items.push(state.cache.itemCache[iid].item)
        }
        resolve(items)
      })
    }

    let { msg } = await sendWithResponse('items', { iids: fetchIids })
    for (let item of msg) {
      state.cache.itemCache[item.iid] = { item, date: Date.now() }
    }
    return msg
  }

  return {
    initConnection,
    send, sendWithResponse, cmd,
    move, enter,
    fetchEntity, fetchEntities,
    fetchItem, fetchItems,
  }
}
