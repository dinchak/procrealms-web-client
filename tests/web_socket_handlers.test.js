// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { applyStateUpdate } from '../src/static/state_sync.js'
import { invalidateStateCaches } from '../src/static/cache_invalidation.js'
import { loadRuntimeModule } from './support/runtime.js'

function createHandlers () {
  let now = 0
  let sequence = 0
  const timers = new Map()
  const state = {
    websocketConnection: { readyState: 1 }, pendingRequests: {}, inventoryOutput: {},
    nextAnimationDelay: 0, animations: [], messages: [], unseenMessageCount: {},
    options: {}, gameState: { player: { name: `Hero` }, inventory: [{ iid: `potion`, amount: 2 }] }, gameStateVersion: 1,
    cache: { itemCache: { potion: {} }, entityCache: {} }
  }
  const api = loadRuntimeModule(`../../src/static/web_socket_handlers.js`, {
    state, applyStateUpdate, invalidateStateCaches,
    incrementPerformanceDiagnostic () {}, addLine () {}, setMode () {}, processTriggersBatch () {},
    playMessageSound () {}, playTrackByName () {},
    useHelpers: () => ({ ansiToHtml: value => value, strToLines: value => [value], getTellMessageFrom: message => (message.from === `You` ? message.to : message.from) }),
    setTimeout: (callback, delay) => { const id = sequence++; timers.set(id, { callback, at: now + delay }); return id },
    clearTimeout: id => timers.delete(id)
  }, [`onWebSocketEvent`])
  function advance (ms) {
    const end = now + ms
    while (timers.size) {
      const [id, timer] = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0]
      if (timer.at > end) {
        break
      }
      now = timer.at
      timers.delete(id)
      timer.callback()
    }
    now = end
  }
  return { state, api, timers, advance }
}

test(`queued damage and healing animations expire after they become visible`, () => {
  const view = createHandlers()
  for (let i = 0; i < 11; i++) {
    view.api.onWebSocketEvent(`entity.attack`, { target: `merc`, amount: 1 })
  }
  view.advance(0)
  for (let i = 0; i < 10; i++) {
    view.api.onWebSocketEvent(`effect.cure`, { target: `hero`, amount: 1 })
  }
  view.advance(10000)
  assert.deepEqual(view.state.animations, [])
  assert.equal(view.state.nextAnimationDelay, 0)
  assert.equal(view.timers.size, 0)
})

test(`old animation callbacks cannot mutate a reconnected session`, () => {
  const view = createHandlers()
  view.api.onWebSocketEvent(`entity.attack`, { target: `merc`, amount: 1 })
  view.state.websocketConnection = { readyState: 1 }
  view.state.nextAnimationDelay = 0
  view.advance(5000)
  assert.deepEqual(view.state.animations, [])
  assert.equal(view.state.nextAnimationDelay, 0)
})

test(`received tells label the recipient correctly and remain in the sender's conversation`, () => {
  const view = createHandlers()
  view.api.onWebSocketEvent(`channel.msg`, { from: `Friend`, to: `Hero`, channel: `tell`, message: `hello` })
  assert.equal(view.state.messages[0].to, `You`)
  assert.equal(view.state.unseenMessageCount[`tell-Friend`], 1)
  view.api.onWebSocketEvent(`channel.msg`, { from: `Hero`, to: `Friend`, channel: `tell`, message: `hi` })
  assert.equal(view.state.messages[1].from, `You`)
  assert.equal(view.state.messages[1].to, `Friend`)
})

test(`state patches invalidate item details even when the patch only contains a scalar`, () => {
  const view = createHandlers()
  view.api.onWebSocketEvent(`state.patch`, {
    patch: [{ op: `replace`, path: `/inventory/0/amount`, value: 3 }], baseVersion: 1, version: 2
  })
  assert.equal(view.state.gameState.inventory[0].amount, 3)
  assert.deepEqual(view.state.cache.itemCache, {})
})

test(`inherited object properties are not treated as protocol handlers`, () => {
  const view = createHandlers()
  assert.doesNotThrow(() => view.api.onWebSocketEvent(`__defineGetter__`, {}))
})

test(`unique item command responses keep the shared item output destination`, () => {
  const view = createHandlers()
  const responses = []
  for (const request of [`first`, `second`]) {
    view.state.pendingRequests[`inventory-output-sword:${request}`] = {
      resolve: (cmd, msg) => responses.push(msg)
    }
  }
  view.api.onWebSocketEvent(`out`, `worn`, `inventory-output-sword:first`)
  view.api.onWebSocketEvent(`out`, `dropped`, `inventory-output-sword:second`)
  assert.deepEqual(view.state.inventoryOutput, { [`inventory-output-sword`]: `worndropped` })
  assert.deepEqual(responses, [`worn`, `dropped`])
})

test(`combat bursts keep animation callbacks bounded and release every completed timer`, () => {
  const view = createHandlers()
  for (let i = 0; i < 10000; i++) {
    view.api.onWebSocketEvent(`entity.attack`, { target: `hero`, amount: 1 })
  }
  assert.equal(view.timers.size, 50)
  assert.equal(view.state.animationTimeouts.size, 50)
  assert.equal(view.state.nextAnimationDelay, 10000)
  view.advance(15000)
  assert.equal(view.timers.size, 0)
  assert.equal(view.state.animationTimeouts.size, 0)
  assert.equal(view.state.nextAnimationDelay, 0)
  assert.deepEqual(view.state.animations, [])
})

test(`item output evicts old destinations, keeps recently updated items, and bounds retained text`, () => {
  const view = createHandlers()
  for (let i = 0; i < 100; i++) {
    view.api.onWebSocketEvent(`out`, `initial`, `inventory-output-${i}:request`)
  }
  view.api.onWebSocketEvent(`out`, `latest`, `inventory-output-0:request`)
  view.api.onWebSocketEvent(`out`, `new`, `inventory-output-100:request`)
  assert.equal(Object.keys(view.state.inventoryOutput).length, 100)
  assert.equal(view.state.inventoryOutput[`inventory-output-0`], `initiallatest`)
  assert.equal(view.state.inventoryOutput[`inventory-output-1`], undefined)
  view.api.onWebSocketEvent(`out`, `x`.repeat(65536) + `tail`, `inventory-output-0:request`)
  assert.equal(view.state.inventoryOutput[`inventory-output-0`].length, 32768)
  assert.ok(view.state.inventoryOutput[`inventory-output-0`].endsWith(`tail`))
  view.api.onWebSocketEvent(`item`, { iid: `0` }, `inventory-output-0:request`)
  assert.ok(view.state.inventoryOutput[`inventory-output-0`].endsWith(`tail`))
})

test(`resync retries stop when the socket closes and can restart on a new connection`, () => {
  const view = createHandlers()
  const messages = []
  view.state.websocketConnection.send = message => messages.push(JSON.parse(message))
  const badPatch = { patch: [], baseVersion: 99, version: 100 }
  view.api.onWebSocketEvent(`state.patch`, badPatch)
  assert.equal(messages.length, 1)
  assert.equal(view.timers.size, 1)
  view.state.websocketConnection.readyState = 3
  view.advance(2000)
  assert.equal(view.timers.size, 0)
  assert.equal(view.state.stateResyncPending, false)
  view.state.websocketConnection = { readyState: 1, send: message => messages.push(JSON.parse(message)) }
  view.api.onWebSocketEvent(`state.patch`, badPatch)
  assert.equal(messages.length, 2)
  view.api.onWebSocketEvent(`state.patch`, { full: true, version: 101, patch: [{ op: `replace`, path: ``, value: {} }] })
  assert.equal(view.timers.size, 0)
  assert.equal(view.state.stateResyncPending, false)
})

test(`a failed resync send releases pending state so a future update can retry`, () => {
  const view = createHandlers()
  view.state.websocketConnection.send = () => { throw new Error(`closed during send`) }
  view.api.onWebSocketEvent(`state.patch`, { patch: [], baseVersion: 99, version: 100 })
  assert.equal(view.state.stateResyncPending, false)
  assert.equal(view.timers.size, 0)
})
