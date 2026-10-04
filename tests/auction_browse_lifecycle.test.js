// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nextTick, reactive } from 'vue'
import { mountComponent } from './support/components.js'

function browse () {
  const commands = [], details = [], errors = []
  const timers = new Map()
  let sequence = 0
  const state = reactive({
    gameState: { player: { name: `Bidder`, money: 1000 } },
    auction: {
      search: { type: ``, subtype: ``, slot: ``, name: ``, minLevel: 1, maxLevel: 100 },
      page: 1, numPages: 5, sort: `name`, sortDir: `asc`,
      auctions: [{ id: `first` }, { id: `second` }], selectedAuctionId: null, item: {}
    }, inventoryOutput: {}
  })
  const view = mountComponent(`../../src/components/auction-modal/AuctionBrowse.vue`, {
    state, showError: error => errors.push(error),
    ITEM_TYPES: [`armor`, `weapon`], ITEM_SUBTYPES: {}, ARMOR_SLOTS: [],
    useHelpers: () => ({ ansiToHtml: String, copperToMoneyString: String, getRelativeTime: String }),
    useWebSocket: () => ({
      runCommand: async command => { commands.push(command) },
      fetchAuction: id => new Promise((resolve, reject) => details.push({ id, resolve, reject }))
    }),
    window: { innerWidth: 1000, addEventListener () {}, removeEventListener () {} },
    setTimeout: callback => { const id = ++sequence; timers.set(id, callback); return id },
    clearTimeout: id => timers.delete(id)
  })
  function flushTimers () {
    const pending = [...timers.values()]
    timers.clear()
    pending.forEach(callback => callback())
  }
  return { ...view, state, commands, details, errors, timers, flushTimers }
}

test(`auction search returns to page one instead of requesting a previous result page`, () => {
  const view = browse()
  try {
    view.setup.page = 5
    view.state.auction.search.name = `rare sword`
    view.setup.updateAuctionSearch()
    view.flushTimers()
    assert.equal(view.setup.page, 1)
    assert.equal(view.commands.at(-1), `auction list 1`)
  } finally {
    view.app.unmount()
  }
})

test(`auction pagination follows pages reported by the server`, async () => {
  const view = browse()
  try {
    view.state.auction.page = 3
    await nextTick()
    assert.equal(view.setup.page, 3)
    view.setup.updateAuctionList()
    assert.equal(view.commands.at(-1), `auction list 3`)
  } finally {
    view.app.unmount()
  }
})

test(`a delayed search refresh still requests page one after an older page response arrives`, () => {
  const view = browse()
  try {
    view.setup.updateAuctionSearch()
    view.state.auction.page = 4
    view.flushTimers()
    assert.equal(view.setup.page, 1)
    assert.equal(view.commands.at(-1), `auction list 1`)
  } finally {
    view.app.unmount()
  }
})

test(`auction sort controls reflect the server's order and translate endTime to Ends`, async () => {
  const view = browse()
  try {
    view.state.auction.sort = `price`
    view.state.auction.sortDir = `desc`
    assert.equal(view.setup.getSortLabel(), `Price`)
    assert.equal(view.setup.getSortDirLabel(), `Descending`)
    await view.setup.doSetSort()
    assert.ok(view.commands.includes(`auction sort price desc`))
    view.state.auction.sort = `endTime`
    assert.equal(view.setup.getSortLabel(), `Ends`)
    await view.setup.doSetSort()
    assert.ok(view.commands.includes(`auction sort ends desc`))
  } finally {
    view.app.unmount()
  }
})

test(`auction pagination recovers when the last page disappears`, async () => {
  const view = browse()
  try {
    view.setup.page = 5
    view.state.auction.numPages = 4
    await nextTick()
    assert.equal(view.setup.page, 4)
    assert.equal(view.commands.at(-1), `auction list 4`)
  } finally {
    view.app.unmount()
  }
})

test(`changing auction selection clears the previous bid amount`, async () => {
  const view = browse()
  try {
    view.setup.bidAmount = `1000`
    const pending = view.setup.selectAuction(view.state.auction.auctions[1])
    view.details[0].resolve({ item: { name: `Second Item` } })
    await pending
    assert.equal(view.setup.bidAmount, ``)
  } finally {
    view.app.unmount()
  }
})

test(`removing an auction invalidates its pending details and selection`, async () => {
  const view = browse()
  try {
    const pending = view.setup.selectAuction(view.state.auction.auctions[0])
    view.state.auction.auctions = [{ id: `second` }]
    await nextTick()
    view.details[0].resolve({ item: { name: `Removed Item` } })
    await pending
    assert.equal(view.state.auction.selectedAuctionId, null)
    assert.deepEqual(view.state.auction.item, {})
  } finally {
    view.app.unmount()
  }
})

test(`a new auction search invalidates pending details immediately`, async () => {
  const view = browse()
  try {
    const pending = view.setup.selectAuction(view.state.auction.auctions[0])
    view.state.auction.search.name = `different`
    view.setup.updateAuctionSearch()
    view.details[0].resolve({ item: { name: `Previous Search Item` } })
    await pending
    assert.equal(view.state.auction.selectedAuctionId, null)
    assert.deepEqual(view.state.auction.item, {})
  } finally {
    view.app.unmount()
  }
})

test(`auction detail failures settle and report an error`, async () => {
  const view = browse()
  try {
    const pending = view.setup.selectAuction(view.state.auction.auctions[0])
    view.details[0].reject(new Error(`Disconnected`))
    await pending
    assert.deepEqual(view.errors, [`Disconnected`])
    assert.deepEqual(view.state.auction.item, {})
  } finally {
    view.app.unmount()
  }
})

test(`auction unmount cancels search refreshes and stops pagination watchers`, async () => {
  const view = browse()
  view.setup.updateAuctionSearch()
  view.app.unmount()
  const sent = view.commands.length
  view.state.auction.page = 5
  view.state.auction.numPages = 1
  await nextTick()
  view.flushTimers()
  assert.equal(view.timers.size, 0)
  assert.equal(view.commands.length, sent)
  assert.equal(view.state.auction.page, 5)
})
