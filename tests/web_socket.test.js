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
    cache: freshCache()
  }
  const api = loadRuntimeModule(`../../src/composables/web_socket.js`, {
    state, updateCounter: { value: 0 }, addLine () {}, nanoid: () => `req-${sequence++}`,
    window: { WebSocket: Socket }, testEnvironment: { MODE: `production` },
    CACHE_MAX_COMMAND_ENTRIES: 100, CACHE_MAX_ENTITY_ENTRIES: 100, CACHE_MAX_ITEM_ENTRIES: 100,
    CACHE_MAX_AUCTION_ENTRIES: 3, CACHE_DELETE_TIME: 1200000,
    onWebSocketEvent: (...args) => events.push(args),
    setTimeout: callback => { const id = sequence++; timers.set(id, callback); return id },
    clearTimeout: id => timers.delete(id)
  }, [`useWebSocket`, `cancelPendingRequests`])
  const client = api.useWebSocket()
  client.initConnection({ onConnect () {}, onClose () {}, url: `ws://test` })
  return { state, client, api, sockets, events, timers }
}

function freshCache () {
  return { commandCache: {}, itemCache: {}, entityCache: {}, auctionCache: {}, inflightItemRequests: {}, inflightEntityRequests: {} }
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

test(`resolved detail requests cannot repopulate a replacement session's cache`, async () => {
  for (const [method, cmd, id, payload, empty] of [
    [`fetchItem`, `item`, `sword`, { iid: `sword` }, {}],
    [`fetchEntity`, `entity`, `hero`, { eid: `hero` }, null],
    [`fetchAuction`, `auction`, 1, { id: 1, item: { iid: `sword` } }, null]
  ]) {
    const view = createSocket()
    const pending = view.client[method](id)
    const request = view.sockets[0].sent.at(-1)
    view.state.pendingRequests[request.reqId].resolve(cmd, payload)
    view.client.initConnection({ onConnect () {}, onClose () {}, url: `ws://replacement` })
    view.state.cache = freshCache()
    assert.deepEqual(await pending, empty)
    assert.deepEqual(view.state.cache, freshCache())
  }
})

test(`old batch completion cannot overwrite cache or erase the new session's inflight request`, async () => {
  for (const [method, cmd, id, payload, inflight] of [
    [`fetchItems`, `items`, `sword`, [{ iid: `sword` }], `inflightItemRequests`],
    [`fetchEntities`, `entities`, `hero`, [{ eid: `hero` }], `inflightEntityRequests`]
  ]) {
    const view = createSocket()
    const old = view.client[method]([id])
    const oldRequest = view.sockets[0].sent.at(-1)
    view.state.pendingRequests[oldRequest.reqId].resolve(cmd, payload)
    view.client.initConnection({ onConnect () {}, onClose () {}, url: `ws://replacement` })
    view.state.cache = freshCache()
    const current = view.client[method]([id])
    const currentRequest = view.sockets[1].sent.at(-1)
    const inflightRequest = Object.values(view.state.cache[inflight])[0]
    assert.deepEqual(await old, [])
    assert.equal(Object.values(view.state.cache[inflight])[0], inflightRequest)
    view.state.pendingRequests[currentRequest.reqId].resolve(cmd, payload)
    assert.deepEqual(await current, payload)
  }
})

test(`an auction error response cannot be cached as auction details`, async () => {
  const view = createSocket()
  const pending = view.client.fetchAuction(1)
  const request = view.sockets[0].sent.at(-1)
  view.state.pendingRequests[request.reqId].resolve(`out`, `Invalid auction ID.`)
  assert.equal(await pending, null)
  assert.deepEqual(view.state.cache.auctionCache, {})
})

test(`a resolved request is ignored if its socket closes before the fetch continuation`, async () => {
  const view = createSocket()
  const pending = view.client.fetchItem(`sword`)
  const request = view.sockets[0].sent.at(-1)
  view.state.pendingRequests[request.reqId].resolve(`item`, { iid: `sword` })
  view.sockets[0].readyState = 3
  view.sockets[0].onclose({})
  assert.deepEqual(await pending, {})
  assert.deepEqual(view.state.cache.itemCache, {})
})

test(`overlapping item commands send separately and resolve their own responses`, async () => {
  const view = createSocket()
  const first = view.client.runCommand(`wear iid:sword`, `inventory-output-sword`)
  const second = view.client.runCommand(`drop iid:sword`, `inventory-output-sword`)
  assert.equal(view.sockets[0].sent.length, 2)
  const [one, two] = view.sockets[0].sent
  assert.notEqual(one.reqId, two.reqId)
  view.state.pendingRequests[two.reqId].resolve(`out`, `dropped`)
  view.state.pendingRequests[one.reqId].resolve(`out`, `worn`)
  assert.equal((await first).msg, `worn`)
  assert.equal((await second).msg, `dropped`)
  assert.equal(view.timers.size, 0)
})

test(`auction cache is bounded and expired details are refreshed`, async () => {
  const view = createSocket()
  for (let id = 1; id <= 5; id++) {
    const pending = view.client.fetchAuction(id)
    const request = view.sockets[0].sent.at(-1)
    view.state.pendingRequests[request.reqId].resolve(`auction`, { id, item: { iid: `item-${id}` } })
    await pending
  }
  assert.deepEqual(Object.keys(view.state.cache.auctionCache), [`3`, `4`, `5`])
  view.state.cache.auctionCache[5].date = Date.now() - 1200001
  const pending = view.client.fetchAuction(5)
  assert.equal(view.sockets[0].sent.length, 6)
  const request = view.sockets[0].sent.at(-1)
  view.state.pendingRequests[request.reqId].resolve(`auction`, { id: 5, item: { iid: `updated` } })
  assert.equal((await pending).item.iid, `updated`)
})

test(`auction timeouts settle safely and allow a later retry`, async () => {
  const view = createSocket()
  const pending = view.client.fetchAuction(1)
  for (const callback of [...view.timers.values()]) {
    callback()
  }
  assert.equal(await pending, null)
  assert.deepEqual(view.state.pendingRequests, {})
  const retry = view.client.fetchAuction(1)
  const request = view.sockets[0].sent.at(-1)
  view.state.pendingRequests[request.reqId].resolve(`auction`, { id: 1, item: { iid: `sword` } })
  assert.equal((await retry).id, 1)
})

test(`removed entities and items clear cached details and allow immediate retry`, async () => {
  for (const [method, cmd, id, cacheKey, empty, payload] of [
    [`fetchEntity`, `entity`, `hero`, `entityCache`, null, { eid: `hero`, name: `Hero` }],
    [`fetchItem`, `item`, `sword`, `itemCache`, {}, { iid: `sword`, name: `Sword` }]
  ]) {
    const view = createSocket()
    view.state.cache[cacheKey][id] = { [cmd]: payload, date: Date.now() }
    const pending = view.client[method](id, true)
    const request = view.sockets[0].sent.at(-1)
    view.state.pendingRequests[request.reqId].resolve(cmd, { [cmd === `entity` ? `eid` : `iid`]: id, removed: true })
    assert.deepEqual(await pending, empty)
    assert.equal(view.state.cache[cacheKey][id], undefined)
    const retry = view.client[method](id)
    const next = view.sockets[0].sent.at(-1)
    assert.notEqual(next.reqId, undefined)
    assert.equal(view.sockets[0].sent.length, 2)
    view.state.pendingRequests[next.reqId].resolve(cmd, payload)
    assert.deepEqual(await retry, payload)
  }
})

test(`unexpected or malformed detail responses are not cached`, async () => {
  for (const [method, cmd, id, empty] of [[`fetchEntity`, `entity`, `hero`, null], [`fetchItem`, `item`, `sword`, {}]]) {
    for (const [replyCmd, msg] of [[`out`, `Could not retrieve details`], [cmd, null], [cmd, { error: `Not found` }]]) {
      const view = createSocket()
      const pending = view.client[method](id)
      const request = view.sockets[0].sent.at(-1)
      view.state.pendingRequests[request.reqId].resolve(replyCmd, msg)
      assert.deepEqual(await pending, empty)
      assert.deepEqual(view.state.cache.itemCache, {})
      assert.deepEqual(view.state.cache.entityCache, {})
    }
  }
})
