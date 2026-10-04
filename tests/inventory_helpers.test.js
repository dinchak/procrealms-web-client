// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getActiveInventorySource, getActiveInventoryStats, getInventorySignature,
  mergeInventorySourceWithFetchedItems, normalizeInventorySource
} from '../src/composables/inventory_helpers.js'

test(`mercenary item IDs resolve to inventory rows with fetched stack amounts`, () => {
  const source = [`sword`, `potion`]
  const fetched = [
    { iid: `potion`, name: `healing potion`, amount: 4 },
    { iid: `sword`, name: `iron sword`, amount: 1 }
  ]
  const rows = mergeInventorySourceWithFetchedItems(source, fetched)
  assert.deepEqual(rows.map(item => item.iid), source)
  assert.deepEqual(rows.map(item => item.fullName), [`iron sword`, `4x healing potion`])
  assert.deepEqual(source, [`sword`, `potion`])
})

test(`player inventory metadata overrides cached stack amounts`, () => {
  const rows = mergeInventorySourceWithFetchedItems([
    { iid: `potion`, name: `healing potion`, amount: 2 }
  ], [{ iid: `potion`, name: `old name`, amount: 9, type: `consumable` }])
  assert.equal(rows[0].fullName, `2x healing potion`)
  assert.equal(rows[0].type, `consumable`)
})

test(`normalization accepts both protocols and skips missing entries`, () => {
  assert.deepEqual(normalizeInventorySource([null, undefined, ``, {}, `sword`, { iid: `potion`, amount: 2 }]), [
    { iid: `sword` }, { iid: `potion`, amount: 2 }
  ])
  assert.deepEqual(normalizeInventorySource(null), [])
})

test(`inventory signatures detect ID replacements of the same length and stack changes`, () => {
  assert.notEqual(getInventorySignature([`sword`]), getInventorySignature([`shield`]))
  assert.notEqual(getInventorySignature([{ iid: `potion`, amount: 2 }]), getInventorySignature([{ iid: `potion`, amount: 3 }]))
  assert.equal(getInventorySignature([`sword`]), getInventorySignature([{ iid: `sword` }]))
  assert.notEqual(getInventorySignature([{ iid: `potion`, name: `2x potion` }]), getInventorySignature([{ iid: `potion`, name: `3x potion` }]))
})

test(`selected character supplies both inventory and capacity, falling back after dismissal`, () => {
  const player = { money: 100, weight: 5, maxWeight: 50, numItems: 1, maxNumItems: 10 }
  const merc = { items: [`sword`], stats: { money: 2, weight: 3, maxWeight: 80, numItems: 1, maxNumItems: 20 } }
  const state = { playerModalAs: `merc`, gameState: { player, inventory: [{ iid: `potion` }], charmies: { merc } } }
  assert.deepEqual(getActiveInventorySource(state), [{ iid: `sword` }])
  assert.equal(getActiveInventoryStats(state), merc.stats)
  state.gameState.charmies = {}
  assert.deepEqual(getActiveInventorySource(state), [{ iid: `potion` }])
  assert.equal(getActiveInventoryStats(state), player)
})
