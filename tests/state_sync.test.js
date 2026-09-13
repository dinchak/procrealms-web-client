// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { applyStateUpdate } from '../src/static/state_sync.js'

test('full state bootstraps a versioned stream, including legacy root patches', () => {
  const state = { inventory: [], room: { items: [{ iid: 'apple' }] } }
  const patch = [{ op: 'replace', path: '', value: state }]
  assert.deepEqual(applyStateUpdate({}, null, { patch, full: true, version: 1 }), { gameState: state, version: 1 })
  assert.deepEqual(applyStateUpdate({}, null, { patch }), { gameState: state, version: null })
})

test('pickup patch applies once and duplicate versions are ignored', () => {
  const state = { inventory: [], room: { items: [{ iid: 'apple' }] } }
  const message = {
    patch: [{ op: 'remove', path: '/room/items/0' }, { op: 'add', path: '/inventory/0', value: { iid: 'apple' } }],
    baseVersion: 1,
    version: 2
  }
  const next = applyStateUpdate(state, 1, message)
  assert.deepEqual(next.gameState, { inventory: [{ iid: 'apple' }], room: { items: [] } })
  assert.equal(applyStateUpdate(next.gameState, next.version, message), null)
  assert.equal(state.room.items.length, 1)
})

test('missing patch is detected before mutation and a full state restores the stream', () => {
  const state = { room: { items: [{ iid: 'apple' }] } }
  assert.throws(() => applyStateUpdate(state, 1, {
    patch: [{ op: 'remove', path: '/room/items/0' }], baseVersion: 2, version: 3
  }), /baseline mismatch/)
  assert.equal(state.room.items.length, 1)
  const recovered = applyStateUpdate(state, 1, {
    patch: [{ op: 'replace', path: '', value: { room: { items: [] }, inventory: [{ iid: 'apple' }] } }],
    full: true, baseVersion: 3, version: 4
  })
  assert.equal(recovered.version, 4)
  assert.equal(recovered.gameState.room.items.length, 0)
})

test('invalid patch leaves the previous state intact', () => {
  const state = { room: { items: [{ iid: 'apple' }] } }
  assert.throws(() => applyStateUpdate(state, 1, {
    patch: [{ op: 'remove', path: '/room/items/0' }, { op: 'remove', path: '/room/items/0' }],
    baseVersion: 1, version: 2
  }))
  assert.deepEqual(state, { room: { items: [{ iid: 'apple' }] } })
})
