// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { setImmediate as nextTurn } from 'node:timers/promises'
import { loadRuntimeModule } from './support/runtime.js'

function createSocket () {
  const timers = new Map()
  const events = []
  const sockets = []
  let sequence = 0
  class Socket {
    constructor () { this.readyState = 1; this.sent = []; sockets.push(this) }
    send (data) { this.sent.push(JSON.parse(data)) }
    close () { this.readyState = 3 }
  }
  const state = {
    websocketConnection: null, pendingRequests: {},
    cache: { commandCache: {}, itemCache: {}, entityCache: {}, inflightItemRequests: {}, inflightEntityRequests: {} }
  }
  const api = loadRuntimeModule(`../../src/composables/web_socket.js`, {
    state, updateCounter: { value: 0 }, addLine () {}, nanoid: () => `req-${sequence++}`,
    window: { WebSocket: Socket }, testEnvironment: { MODE: `production` },
    CACHE_MAX_COMMAND_ENTRIES: 100, CACHE_MAX_ENTITY_ENTRIES: 100, CACHE_MAX_ITEM_ENTRIES: 100,
    onWebSocketEvent: (...args) => events.push(args),
    setTimeout: callback => { const id = sequence++; timers.set(id, callback); return id },
    clearTimeout: id => timers.delete(id)
  }, [`useWebSocket`, `cancelPendingRequests`])
  const client = api.useWebSocket()
  client.initConnection({ onConnect () {}, onClose () {}, url: `ws://test` })
  return { state, client, api, sockets, events, timers }
}

test(`requests sharing an ID send once and settle without retaining timeouts`, async () => {
  const view = createSocket()
  const first = view.client.sendWithResponse(`item`, { iid: `sword` }, `shared`)
  const second = view.client.sendWithResponse(`item`, { iid: `sword` }, `shared`)
  assert.equal(first, second)
  assert.equal(view.sockets[0].sent.length, 1)
  view.state.pendingRequests.shared.resolve(`item`, { iid: `sword` })
  assert.deepEqual(await first, { cmd: `item`, msg: { iid: `sword` } })
  assert.equal(view.timers.size, 0)
  assert.deepEqual(view.state.pendingRequests, {})
})

test(`disconnect rejects pending requests immediately and removes timers`, async () => {
  const view = createSocket()
  const pending = view.client.sendWithResponse(`item`, { iid: `sword` })
  const rejected = assert.rejects(pending, { name: `ConnectionError` })
  view.sockets[0].readyState = 3
  view.sockets[0].onclose({})
  await rejected
  assert.equal(view.timers.size, 0)
  assert.deepEqual(view.state.pendingRequests, {})
})

test(`send failures reject the response promise without leaking a request`, async () => {
  const view = createSocket()
  view.sockets[0].send = () => { throw new Error(`socket failed`) }
  await assert.rejects(view.client.sendWithResponse(`item`, { iid: `sword` }), { name: `ConnectionError` })
  assert.equal(view.timers.size, 0)
  assert.deepEqual(view.state.pendingRequests, {})
})

test(`closed connections reject without creating timers, while item fetches return safely`, async () => {
  const view = createSocket()
  view.state.connected = true
  view.client.closeConnection()
  assert.equal(view.state.connected, false)
  await assert.rejects(view.client.sendWithResponse(`item`, { iid: `sword` }), { name: `ConnectionError` })
  assert.deepEqual(await view.client.fetchItem(`sword`), {})
  assert.deepEqual(await view.client.fetchItems([`sword`]), [])
  assert.equal(view.timers.size, 0)
})

test(`queued messages from an old connection cannot update the new session`, async () => {
  const view = createSocket()
  view.sockets[0].onmessage({ data: JSON.stringify({ cmd: `out`, msg: `stale` }) })
  view.client.initConnection({ onConnect () {}, onClose () {}, url: `ws://replacement` })
  await nextTurn()
  assert.deepEqual(view.events, [])
  assert.equal(view.sockets[0].readyState, 3)
  view.sockets[1].onmessage({ data: JSON.stringify({ cmd: `out`, msg: `current` }) })
  await nextTurn()
  assert.deepEqual(view.events, [[`out`, `current`]])
})
