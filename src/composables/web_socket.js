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
        // console.log(`<- ${cmd} ${msg ? JSON.stringify(msg) : ''}`)
        onEvent(cmd, msg)
      } catch (err) {
        console.log('error parsing message: %s', json)
        console.log(err.stack)
      }
    }
  }

  function send (cmd, msg) {
    // console.log(`-> ${cmd} ${msg ? JSON.stringify(msg) : ''}`)
    ws.send(JSON.stringify({ cmd, msg }))
  }

  function cmd (command) {
    state.output.push('')
    state.output.push(`<span class="player-cmd-caret">></span> <span class="player-cmd">${command}</span>`)
    state.output.push('')
    send('cmd', command)
  }

  function fetchEntity (eid) {
    let requestId = `entity-${eid}`
    if (state.pendingRequests[requestId]) {
      return
    }
    state.pendingRequests[requestId] = true
    send('entity', { eid })
  }

  function fetchItem (iid)  {
    let requestId = `item-${iid}`
    if (state.pendingRequests[requestId]) {
      return
    }
    state.pendingRequests[requestId] = true
    send('item', { iid })
  }

  return {
    initConnection, send, cmd, fetchEntity, fetchItem
  }
}