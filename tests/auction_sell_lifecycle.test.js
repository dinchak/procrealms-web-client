// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nextTick, reactive, ref } from 'vue'
import { normalizeInventorySource, getInventorySignature, mergeInventorySourceWithFetchedItems, sortItemsByKey } from '../src/composables/inventory_helpers.js'
import { mountComponent } from './support/components.js'

function deferred () {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

function auction () {
  const first = { iid: `first`, name: `First`, amount: 3, value: 100 }
  const second = { iid: `second`, name: `Second`, amount: 2, value: 200 }
  const state = reactive({ gameState: { inventory: [first, second] }, inventorySortValue: `name` })
  const details = []
  const commands = []
  const refreshes = []
  const errors = []
  const timers = new Map()
  let sequence = 0
  const view = mountComponent(`../../src/components/auction-modal/AuctionSell.vue`, {
    state, updateCounter: ref(0), incrementUiDiagnostic () {}, showError: message => errors.push(message),
    normalizeInventorySource, getInventorySignature, mergeInventorySourceWithFetchedItems, sortItemsByKey,
    window: { innerWidth: 1000, addEventListener () {}, removeEventListener () {} },
    useHelpers: () => ({ ansiToHtml: String, copperToMoneyString: String }),
    useWebSocket: () => ({
      fetchItems: () => Promise.resolve([]),
      fetchItem: iid => { const request = { iid, ...deferred() }; details.push(request); return request.promise },
      runCommand: cmd => { const request = { cmd, ...deferred() }; commands.push(request); return request.promise },
      refreshItem: iid => { const request = { iid, ...deferred() }; refreshes.push(request); return request.promise }
    }),
    setTimeout: callback => { const id = ++sequence; timers.set(id, callback); return id },
    clearTimeout: id => timers.delete(id)
  })
  function select (item) {
    const pending = view.setup.selectItem(item)
    details.at(-1).resolve(item)
    return pending
  }
  return { ...view, first, second, state, details, commands, refreshes, errors, timers, select }
}

test(`auction selection clears old details and prices immediately and preserves edits during fetch`, async () => {
  const view = auction()
  try {
    await view.select(view.first)
    const pending = view.setup.selectItem(view.second)
    assert.deepEqual(view.setup.selectedItem, {})
    assert.equal(view.setup.minimumBid, `100`)
    assert.equal(view.setup.buyPrice, `200`)
    assert.equal(view.setup.sellAmount, `2`)
    view.setup.minimumBid = `150`
    view.details.at(-1).resolve(view.second)
    await pending
    assert.equal(view.setup.minimumBid, `150`)
  } finally {
    view.app.unmount()
  }
})

test(`an earlier auction submission cannot clear a newer selection`, async () => {
  const view = auction()
  try {
    await view.select(view.first)
    const pending = view.setup.doSell(view.first)
    await view.select(view.second)
    view.setup.minimumBid = `125`
    view.commands[0].resolve()
    await nextTick()
    view.refreshes[0].resolve()
    await pending
    assert.equal(view.setup.selectedIid, view.second.iid)
    assert.equal(view.setup.minimumBid, `125`)
    assert.equal(view.setup.sellAmount, `2`)
  } finally {
    view.app.unmount()
  }
})

for (const phase of [`command`, `refresh`]) {
  test(`auction ${phase} completion after unmount does not start further requests or timers`, async () => {
    const view = auction()
    await view.select(view.first)
    const pending = view.setup.doSell(view.first)
    if (phase === `refresh`) {
      view.commands[0].resolve()
      await nextTick()
    }
    view.app.unmount()
    if (phase === `command`) {
      view.commands[0].resolve()
      await nextTick()
      // Settle unexpected requests too, so a failing check cannot hang the runner.
      view.refreshes.forEach(request => request.resolve())
    } else {
      view.refreshes[0].resolve()
    }
    await pending
    assert.equal(view.timers.size, 0)
    assert.equal(view.refreshes.length, phase === `command` ? 0 : 1)
  })
}

test(`auction blocks repeated submission while a request is pending`, async () => {
  const view = auction()
  try {
    await view.select(view.first)
    const pending = view.setup.doSell(view.first)
    const duplicate = view.setup.doSell(view.first)
    assert.equal(view.commands.length, 1)
    view.commands.forEach(request => request.resolve())
    await nextTick()
    view.refreshes.forEach(request => request.resolve())
    await Promise.all([pending, duplicate])
  } finally {
    view.app.unmount()
  }
})

test(`auction transport failure reports an error and preserves the form for retry`, async () => {
  const view = auction()
  try {
    await view.select(view.first)
    const pending = view.setup.doSell(view.first)
    view.commands[0].reject(new Error(`Disconnected`))
    await pending
    assert.deepEqual(view.errors, [`Disconnected`])
    assert.equal(view.setup.selectedIid, view.first.iid)
    assert.equal(view.setup.minimumBid, `50`)
    assert.equal(view.setup.sellingIid, ``)
  } finally {
    view.app.unmount()
  }
})

test(`removing a selected auction item invalidates its pending details`, async () => {
  const view = auction()
  try {
    const pending = view.setup.selectItem(view.first)
    view.state.gameState.inventory = [view.second]
    await nextTick()
    view.details[0].resolve(view.first)
    await pending
    assert.notEqual(view.setup.selectedIid, view.first.iid)
    assert.deepEqual(view.setup.selectedItem, {})
    assert.equal(view.setup.minimumBid, ``)
  } finally {
    view.app.unmount()
  }
})

test(`stale auction rows cannot select or submit an item after it leaves inventory`, async () => {
  const view = auction()
  try {
    await view.select(view.first)
    view.state.gameState.inventory = [view.second]
    // Exercise the click handlers before the queued inventory watcher runs.
    await view.setup.doSell(view.first)
    await view.setup.selectItem(view.first)
    assert.equal(view.commands.length, 0)
    assert.equal(view.details.length, 1)
    assert.equal(view.setup.selectedIid, ``)
    assert.equal(view.errors.length, 1)
  } finally {
    view.app.unmount()
  }
})

test(`auction detail fetch failure reports an error without discarding the form`, async () => {
  const view = auction()
  try {
    const pending = view.setup.selectItem(view.first)
    view.details[0].reject(new Error(`Details unavailable`))
    await pending
    assert.deepEqual(view.errors, [`Details unavailable`])
    assert.equal(view.setup.selectedIid, view.first.iid)
    assert.equal(view.setup.minimumBid, `50`)
  } finally {
    view.app.unmount()
  }
})

for (const amount of [`0`, `-1`, `1.5`, `2fish`]) {
  test(`auction rejects invalid quantity ${amount}`, async () => {
    const view = auction()
    try {
      await view.select(view.first)
      view.setup.sellAmount = amount
      const pending = view.setup.doSell(view.first)
      assert.equal(view.commands.length, 0)
      await pending
      assert.equal(view.errors.length, 1)
    } finally {
      view.app.unmount()
    }
  })
}
