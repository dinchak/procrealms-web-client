import { state } from './state'

let ws

export function useWebSocket () {
  function initConnection ({ onConnect, onClose, onEvent, url }) {
    ws = new window.WebSocket(url)

    ws.onopen = onConnect
    ws.onclose = onClose
    ws.onmessage = ({ data }) => _onMessage(data, onEvent)

    const _onMessage = (json) => {
      try {
        let { cmd, msg } = JSON.parse(json)
        if (process.env.NODE_ENV != 'production') {
          console.log(`<- ${cmd} ${msg ? JSON.stringify(msg) : ''}`)
        }
        onEvent(cmd, msg)
      } catch (err) {
        console.log('error parsing message: %s', json)
        console.log(err.stack)
      }
    }
  }

  function send (cmd, msg) {
    if (process.env.NODE_ENV != 'production') {
      console.log(`-> ${cmd} ${msg ? JSON.stringify(msg) : ''}`)
    }
    ws.send(JSON.stringify({ cmd, msg }))
  }

  function cmd (command) {
    state.output.push('')
    state.output.push(`<span class="player-cmd-caret">></span> <span class="player-cmd">${command}</span>`)
    state.output.push('')
    send('cmd', command)
  }

  function fetchEntity (eid) {
    if (state.entityCache[eid]) {
      return new Promise((resolve) => resolve(state.entityCache[eid]))
    }

    const requestId = `entity-${eid}`
    const pendingRequest = state.pendingRequests[requestId]
    if (pendingRequest) {
      return pendingRequest.promise
    }

    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Request for entity-${eid} timed out after 5 seconds`)), 5000)
      state.pendingRequests[requestId] = { resolve, timeout }
    })

    state.pendingRequests[requestId].promise = promise

    send('entity', { eid })
    return promise
  }

  function fetchItem (iid)  {
    if (state.itemCache[iid]) {
      return new Promise((resolve) => resolve(state.itemCache[iid]))
    }

    const requestId = `item-${iid}`
    const pendingRequest = state.pendingRequests[requestId]
    if (pendingRequest) {
      return pendingRequest.promise
    }

    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Request for item-${iid} timed out after 5 seconds`)), 5000)
      state.pendingRequests[requestId] = { resolve, timeout }
    })

    state.pendingRequests[requestId].promise = promise

    send('item', { iid })
    return promise
  }

  return {
    initConnection, send, cmd, fetchEntity, fetchItem
  }
}