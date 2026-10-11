// @ts-check
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { test } from 'node:test'
import { nextTick, reactive, ref } from 'vue'
import { getInventorySignature, mergeInventorySourceWithFetchedItems, sortItemsByKey } from '../src/composables/inventory_helpers.js'
import { mountComponent } from './support/components.js'

const Slot = { inheritAttrs: false, render () { return this.$slots.default?.() } }

function trade (renderTemplate = false) {
  const requests = []
  const entities = []
  const actions = []
  const actionContexts = []
  const timers = new Map()
  let sequence = 0
  const state = reactive({
    shop: { items: [], shopkeeper: ``, prices: [] }, modals: { tradeModal: true },
    gameState: { inventory: [], player: { money: 100 }, charmies: { merc: { items: [] } } },
    inventorySortValue: `name`, playerModalAs: `merc`, inputEmitter: new EventEmitter()
  })
  const view = mountComponent(`../../src/components/modals/TradeModal.vue`, {
    state, updateCounter: ref(0), incrementUiDiagnostic () {},
    GameModal: Slot, NButton: Slot, NPopselect: Slot, ItemDetails: Slot,
    getInventorySignature, mergeInventorySourceWithFetchedItems, sortItemsByKey,
    useHelpers: () => ({
      ansiToHtml: text => text, copperToMoneyString: String,
      runItemAction: (...args) => actions.push(args),
      getActions: (item, context) => { actionContexts.push(context); return [{ label: `Examine` }] }
    }),
    useWebSocket: () => ({
      runCommand () {}, fetchItem: iid => Promise.resolve({ iid }),
      fetchItems: ids => new Promise(resolve => requests.push({ ids, resolve })),
      fetchEntity: eid => new Promise(resolve => entities.push({ eid, resolve }))
    }),
    setTimeout: callback => { const id = ++sequence; timers.set(id, callback); return id },
    clearTimeout: id => timers.delete(id)
  }, {}, renderTemplate)
  function flushTimers () {
    const pending = [...timers.values()]
    timers.clear()
    pending.forEach(callback => callback())
  }
  function close () {
    view.setup.onModalClosed()
    view.app.unmount()
  }
  return { ...view, state, requests, entities, actions, actionContexts, timers, flushTimers, close }
}

test(`trade actions always use the player even when another panel selects a mercenary`, async () => {
  const view = trade()
  try {
    view.setup.playerItems = [{ iid: `player-item`, name: `fleece`, amount: 2 }]
    view.setup.shopItems = [{ iid: `shop-item`, name: `fleece`, amount: 2 }]
    for (const action of view.setup.getSellActions(`player-item`)) {
      await action.onClick()
    }
    for (const action of view.setup.getBuyActions(`shop-item`)) {
      await action.onClick()
    }
    assert.equal(view.actions.length, 6)
    assert.ok(view.actions.every(args => args[2] === ``))
    assert.ok(view.actionContexts.every(context => context === ``))
  } finally {
    view.close()
  }
})

for (const source of [`shop`, `player`]) {
  test(`trade discards pending ${source} inventory details as soon as inventory changes`, async () => {
    const view = trade()
    try {
      view.setup.onModalOpened()
      if (source === `shop`) {
        view.state.shop.items = [{ iid: `old-item`, name: `old` }]
      } else {
        view.state.gameState.inventory = [{ iid: `old-item`, name: `old` }]
      }
      await nextTick()
      view.flushTimers()
      const pending = view.requests.find(request => request.ids.includes(`old-item`))
      assert.ok(pending)
      if (source === `shop`) {
        view.state.shop.items = [{ iid: `new-item`, name: `new` }]
      } else {
        view.state.gameState.inventory = [{ iid: `new-item`, name: `new` }]
      }
      await nextTick()
      pending.resolve([{ iid: `old-item`, name: `old` }])
      await nextTick()
      assert.equal(view.setup[source === `shop` ? `shopItems` : `playerItems`].length, 0)
      view.flushTimers()
      view.requests.find(request => request.ids.includes(`new-item`)).resolve([{ iid: `new-item`, name: `new` }])
      await nextTick()
      assert.equal(view.setup[source === `shop` ? `shopItems` : `playerItems`][0].iid, `new-item`)
    } finally {
      view.close()
    }
  })
}

test(`removing a shopkeeper invalidates pending entity details`, async () => {
  const view = trade()
  try {
    view.setup.onModalOpened()
    view.state.shop.shopkeeper = `old-shopkeeper`
    await nextTick()
    view.state.shop.shopkeeper = ``
    await nextTick()
    view.entities[0].resolve({ eid: `old-shopkeeper`, name: `Old Trader` })
    await nextTick()
    assert.equal(view.setup.shopkeeper.name, `Loading...`)
  } finally {
    view.close()
  }
})

function itemRows (node) {
  if (!node) {
    return []
  }
  if (node.props?.class === `item-row`) {
    return [node.key]
  }
  if (node.component) {
    return itemRows(node.component.subTree)
  }
  return Array.isArray(node.children) ? node.children.flatMap(itemRows) : []
}

test(`shop sorting changes the order of the rendered inventory rows`, async () => {
  const view = trade(true)
  try {
    view.state.shop.items = [{ iid: `high`, name: `Alpha` }, { iid: `low`, name: `Zulu` }]
    view.setup.shopItems = [{ iid: `high`, name: `Alpha`, level: 10 }, { iid: `low`, name: `Zulu`, level: 1 }]
    await nextTick()
    assert.deepEqual(itemRows(view.tree()), [`high`, `low`])
    view.setup.shopkeeperSortValue = `level`
    view.setup.onShopkeeperSortChange()
    await nextTick()
    assert.deepEqual(itemRows(view.tree()), [`low`, `high`])
  } finally {
    view.close()
  }
})
