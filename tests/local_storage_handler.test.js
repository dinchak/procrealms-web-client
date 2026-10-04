// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadRuntimeModule } from './support/runtime.js'

function storage (entries) {
  const values = new Map(Object.entries(entries))
  const state = { options: {}, inputMappings: [] }
  const defaults = [{ event: `moveNorth`, bindings: [{ keyCode: `ArrowUp`, modes: [`hotkey`] }] }]
  const { useLocalStorageHandler } = loadRuntimeModule(`../../src/composables/local_storage_handler.js`, {
    state, resetInputMappings: () => structuredClone(defaults), incrementPerformanceDiagnostic () {},
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
  }, [`useLocalStorageHandler`])
  return { api: useLocalStorageHandler(), state, defaults, values }
}

test(`saved tokens recover from valid JSON with the wrong shape`, () => {
  for (const value of [null, {}, `token`, 3]) {
    const view = storage({ tokens: JSON.stringify(value) })
    assert.deepEqual(view.api.getTokens(), [])
    assert.doesNotThrow(() => view.api.addToken(`Hero`, `saved-token`))
    assert.deepEqual(view.api.getTokens(), [{ name: `Hero`, token: `saved-token` }])
    assert.doesNotThrow(() => view.api.deleteToken(`Hero`))
    assert.deepEqual(view.api.getTokens(), [])
  }
})

test(`token lists discard malformed entries and retain usable characters`, () => {
  const valid = { name: `Hero`, token: `saved-token` }
  const view = storage({ tokens: JSON.stringify([null, {}, 4, { name: `Other`, token: null }, valid]) })
  assert.deepEqual(view.api.getTokens(), [valid])
  assert.doesNotThrow(() => view.api.addToken(`Hero`, `replacement`))
  assert.deepEqual(view.api.getTokens(), [{ name: `Hero`, token: `replacement` }])
})

test(`input mappings recover from malformed stored shapes and preserve an intentionally empty list`, () => {
  for (const value of [null, {}, `mapping`, 3]) {
    const view = storage({ inputMappings: JSON.stringify(value) })
    view.api.loadInputMappings()
    assert.deepEqual(view.state.inputMappings, view.defaults)
  }
  const view = storage({ inputMappings: `[]` })
  view.api.loadInputMappings()
  assert.deepEqual(view.state.inputMappings, [])
})

test(`mapping lists omit unusable entries before keyboard handlers mount`, () => {
  const valid = { event: `moveNorth`, bindings: [] }
  const view = storage({ inputMappings: JSON.stringify([null, {}, 4, valid]) })
  view.api.loadInputMappings()
  assert.deepEqual(view.state.inputMappings, [valid])
})
