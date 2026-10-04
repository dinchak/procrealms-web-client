// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { invalidateStateCaches } from '../src/static/cache_invalidation.js'
import { applyStateUpdate } from '../src/static/state_sync.js'

test(`scalar item/entity edits evict details while preserving unrelated cached items`, () => {
  const previous = { inventory: [{ iid: `potion`, amount: 2 }], player: { eid: `hero`, money: 10 } }
  const patch = [{ op: `replace`, path: `/inventory/0/amount`, value: 3 }, { op: `replace`, path: `/player/money`, value: 20 }]
  const cache = { itemCache: { potion: {}, sword: {} }, entityCache: { hero: {}, merc: {} } }
  const { gameState } = applyStateUpdate(previous, null, { patch })
  invalidateStateCaches(cache, previous, gameState, patch)
  assert.deepEqual(cache.itemCache, { sword: {} })
  assert.deepEqual(cache.entityCache, { merc: {} })
})

test(`removing an inventory entry evicts its old details and does not leave a stale cache`, () => {
  const previous = { inventory: [{ iid: `sword` }, { iid: `shield` }] }
  const patch = [{ op: `remove`, path: `/inventory/0` }]
  const next = { inventory: [{ iid: `shield` }] }
  const cache = { itemCache: { sword: {}, shield: {}, apple: {} }, entityCache: {} }
  invalidateStateCaches(cache, previous, next, patch)
  assert.deepEqual(cache.itemCache, { apple: {} })
})

test(`mercenary inventories and equipment containing bare IDs invalidate correctly`, () => {
  const previous = { charmies: { merc: { items: [`potion`], equipment: { weapon: `sword` } } } }
  const next = { charmies: { merc: { items: [`apple`], equipment: { weapon: `shield` } } } }
  const cache = { itemCache: { potion: {}, apple: {}, sword: {}, shield: {}, gem: {} }, entityCache: {} }
  invalidateStateCaches(cache, previous, next, [
    { op: `replace`, path: `/charmies/merc/items/0`, value: `apple` },
    { op: `replace`, path: `/charmies/merc/equipment/weapon`, value: `shield` }
  ])
  assert.deepEqual(cache.itemCache, { gem: {} })
})

test(`whole objects, moved items, and JSON pointer escapes are supported`, () => {
  const previous = { boxes: { 'a/b~c': { iid: `gem`, name: `gem` } }, inventory: [{ iid: `sword` }], room: { items: [] } }
  const cache = { itemCache: { gem: {}, sword: {}, apple: {} }, entityCache: {} }
  const patch = [
    { op: `replace`, path: `/boxes/a~1b~0c/name`, value: `shiny gem` },
    { op: `move`, from: `/inventory/0`, path: `/room/items/0` }
  ]
  const { gameState } = applyStateUpdate(previous, null, { patch })
  invalidateStateCaches(cache, previous, gameState, patch)
  assert.deepEqual(cache.itemCache, { apple: {} })
})
