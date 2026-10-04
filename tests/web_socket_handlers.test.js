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
    useHelpers: () => ({ ansiToHtml: value => value, getTellMessageFrom: message => (message.from === `You` ? message.to : message.from) }),
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
