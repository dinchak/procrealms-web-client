// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { setImmediate as nextTurn } from 'node:timers/promises'
import { EventEmitter } from 'node:events'
import { reactive, ref } from 'vue'
import { loadRuntimeModule } from './support/runtime.js'

function createState () {
  const timers = new Map()
  const requests = []
  let sequence = 0
  const api = loadRuntimeModule(`../../src/static/state.js`, {
    reactive, ref, EventEmitter, testEnvironment: { MODE: `production` },
    loadSettingsByNameAndType () {}, resetTriggerBatch () {}, cancelPendingRequests () {}, playRandomTrack () {},
    DEFAULT_TERMINAL_SIZE: { width: 80, height: 24 },
    useLocalStorageHandler: () => ({ addToken () {} }), useHelpers: () => ({ ansiToHtml: value => value }),
    useWebSocket: () => ({
      fetchEntities: eids => {
        requests.push(eids)
        return Promise.resolve(eids.map(eid => ({ eid, name: `Mercenary` })))
      },
      fetchItems: iids => {
        requests.push(iids)
        return Promise.resolve(iids.map(iid => ({ iid, name: `Sword` })))
      }
    }),
    setTimeout: callback => { const id = sequence++; timers.set(id, callback); return id },
    clearTimeout: id => timers.delete(id)
  }, [`state`, `addLine`, `resetState`])
  async function flush () {
    for (let step = 0; step < 5 && timers.size; step++) {
      const callbacks = [...timers.values()]
      timers.clear()
      callbacks.forEach(callback => callback())
      await nextTurn()
    }
  }
  return { api, timers, requests, flush }
}

test(`command output resolves full nanoid IDs containing hyphens and underscores`, async () => {
  const view = createState()
  const pending = view.api.addLine(`order eid:merc-A_B wield iid:item-C_D`, `output`)
  await view.flush()
  await pending
  assert.deepEqual(view.requests, [[`merc-A_B`], [`item-C_D`]])
  assert.deepEqual(view.api.state.output, [`order Mercenary wield Sword`])
})

test(`disconnect clears queued output and settles lines without leaking old text into the new session`, async () => {
  const view = createState()
  const pending = view.api.addLine(`old output`, `output`)
  view.api.resetState()
  await pending
  await view.flush()
  assert.deepEqual(view.api.state.output, [])
  assert.equal(view.timers.size, 0)
  const current = view.api.addLine(`current output`, `output`)
  await view.flush()
  await current
  assert.deepEqual(view.api.state.output, [`current output`])
})
