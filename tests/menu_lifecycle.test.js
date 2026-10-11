// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nextTick, reactive } from 'vue'
import { getInventorySignature, normalizeInventorySource } from '../src/composables/inventory_helpers.js'
import { mountComponent } from './support/components.js'

function auction () {
  const requests = []
  const commands = []
  const timers = new Map()
  const state = reactive({
    auction: {
      auctions: [{ id: `first` }, { id: `second` }], page: 1, numPages: 1,
      selectedAuctionId: null, item: {}, search: {}
    }, gameState: { player: {} }
  })
  const view = mountComponent(`../../src/components/auction-modal/AuctionBrowse.vue`, {
    state, ITEM_SUBTYPES: {}, useHelpers: () => ({}),
    useWebSocket: () => ({
      runCommand: command => commands.push(command),
      fetchAuction: id => new Promise(resolve => requests.push({ id, resolve }))
    }),
    window: { innerWidth: 1000, addEventListener () {}, removeEventListener () {} },
    setTimeout: callback => { timers.set(1, callback); return 1 }, clearTimeout: id => timers.delete(id)
  })
  return { ...view, requests, commands, timers, state }
}

test(`auction details follow the most recent selection when responses arrive out of order`, async () => {
  const view = auction()
  try {
    const first = view.setup.selectAuction({ id: `first` })
    const second = view.setup.selectAuction({ id: `second` })
    view.requests[1].resolve({ item: { iid: `second-item` } })
    await second
    view.requests[0].resolve({ item: { iid: `first-item` } })
    await first
    assert.deepEqual(view.state.auction.item, { iid: `second-item` })
  } finally {
    view.app.unmount()
  }
})

test(`collapsing or closing auctions invalidates pending details and cancels delayed refreshes`, async () => {
  for (const close of [false, true]) {
    const view = auction()
    const pending = view.setup.selectAuction({ id: `first` })
    if (close) {
      view.setup.updateAuctionSearch()
      view.app.unmount()
      assert.equal(view.timers.size, 0)
      const before = view.commands.length
      view.setup.updateAuctionList()
      assert.equal(view.commands.length, before)
    } else {
      await view.setup.selectAuction({ id: `first` })
      view.setup.updateAuctionSearch()
    }
    view.requests[0].resolve({ item: { iid: `late` } })
    await pending
    assert.deepEqual(view.state.auction.item, {})
    if (!close) {
      view.app.unmount()
    }
  }
})

test(`auction searches use numeric defaults for cleared bounds and allow one exact level`, () => {
  const view = auction()
  try {
    for (const [minLevel, maxLevel, range] of [[null, 20, `1-20`], [20, null, `20-100`], [10, 10, `10-10`]]) {
      view.state.auction.search = { minLevel, maxLevel }
      view.setup.updateAuctionSearch()
      assert.equal(view.commands.at(-1), `auction search ${range}`)
    }
  } finally {
    view.app.unmount()
  }
})

function mercenaryOrders () {
  const timers = new Map()
  const requests = []
  let sequence = 0
  const props = reactive({ merc: { stats: { eid: `first` }, items: [`potion`], skills: {} } })
  const view = mountComponent(`../../src/components/battle/MercOrders.vue`, {
    state: { gameState: { party: {} } }, incrementUiDiagnostic () {}, getInventorySignature, normalizeInventorySource,
    useWebSocket: () => ({ fetchItems: ids => new Promise(resolve => requests.push({ ids, resolve })), runCommand () {} }),
    setTimeout: callback => { const id = ++sequence; timers.set(id, callback); return id },
    clearTimeout: id => timers.delete(id)
  }, props)
  function flushTimer () {
    const [id, callback] = [...timers.entries()][0]
    timers.delete(id)
    callback()
  }
  return { ...view, props, requests, timers, flushTimer }
}

test(`changing recipe page size updates the search, resets the page, and enforces valid limits`, () => {
  const commands = []
  const state = reactive({ recipeSearch: { page: 5, limit: 30, mode: `all` }, recipeResults: { count: 100, recipes: [] } })
  const view = mountComponent(`../../src/components/modals/CraftingModal.vue`, {
    state, useHelpers: () => ({}), useWebSocket: () => ({ runCommand: command => commands.push(command) }),
    window: { removeEventListener () {} }
  })
  try {
    view.setup.updateLimit(20)
    assert.equal(state.recipeSearch.limit, 20)
    assert.equal(state.recipeSearch.page, 1)
    assert.match(commands.at(-1), /limit=20 page=1$/)
    for (const value of [null, 0, -1, 1.5, Infinity]) {
      const previousCommands = commands.length
      view.setup.updateLimit(value)
      assert.equal(state.recipeSearch.limit, 20)
      assert.equal(commands.length, previousCommands)
    }
    view.setup.updateLimit(10000)
    assert.equal(state.recipeSearch.limit, 1000)
  } finally {
    view.app.unmount()
  }
})

test(`mercenary orders discard old inventory responses as soon as the selected owner changes`, async () => {
  const view = mercenaryOrders()
  try {
    view.flushTimer()
    view.props.merc = { stats: { eid: `second` }, items: [{ iid: `new-potion` }], skills: {} }
    await nextTick()
    view.requests[0].resolve([{ name: `large healing potion` }])
    await nextTick()
    assert.equal(view.setup.options.length, 0)
    view.flushTimer()
    assert.deepEqual(view.requests[1].ids, [`new-potion`])
    view.requests[1].resolve([{ name: `healing potion` }])
    await nextTick()
    assert.equal(view.setup.options.at(-1).key, `eid:second drink healing`)
  } finally {
    view.app.unmount()
  }
})

test(`mercenary orders refresh when skills change and ignore responses after unmount`, async () => {
  const view = mercenaryOrders()
  view.flushTimer()
  view.requests[0].resolve([])
  await nextTick()
  view.props.merc.skills = { fireball: { name: `fireball`, type: `active`, spell: true } }
  await nextTick()
  assert.equal(view.timers.size, 1)
  view.flushTimer()
  view.app.unmount()
  view.requests[1].resolve([{ name: `large energy potion` }])
  await nextTick()
  assert.equal(view.setup.options.length, 0)
  assert.equal(view.timers.size, 0)
})
