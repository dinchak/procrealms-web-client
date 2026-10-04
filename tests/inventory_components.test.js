// @ts-check
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { setTimeout as delay } from 'node:timers/promises'
import { test } from 'node:test'
import { compileFunction } from 'node:vm'
import { EventEmitter } from 'node:events'
import { compileScript, parse } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import * as inventoryHelpers from '../src/composables/inventory_helpers.js'

const renderer = Vue.createRenderer({
  createElement: () => ({}),
  createText: () => ({}),
  createComment: () => ({}),
  insert () {},
  remove () {},
  setText () {},
  setElementText () {},
  parentNode: () => null,
  nextSibling: () => null,
  patchProp () {}
})

function mountInventory (path, props = {}, overrides = {}) {
  const state = Vue.reactive({
    playerModalAs: `merc`, inventorySortValue: `name`,
    gameState: {
      inventory: [{ iid: `apple`, name: `apple` }],
      player: { money: 100, numItems: 1, maxNumItems: 10, weight: 1, maxWeight: 50 },
      charmies: { merc: { items: [`sword`], stats: { money: 2, numItems: 1, maxNumItems: 20, weight: 3, maxWeight: 80 } } }
    }
  })
  const batches = []
  const details = []
  const dummy = {}
  const bindings = {
    computed: Vue.computed, ref: Vue.ref, watch: Vue.watch, nextTick: Vue.nextTick,
    onMounted: Vue.onMounted, onBeforeUnmount: Vue.onBeforeUnmount, toRefs: Vue.toRefs,
    window: { innerWidth: 900, addEventListener () {}, removeEventListener () {} },
    testEnvironment: {},
    ...inventoryHelpers,
    NGrid: dummy, NGi: dummy, NInput: dummy, NPopselect: dummy, NCollapseItem: dummy,
    NCard: dummy, NTooltip: dummy, NCollapse: dummy, NProgress: dummy,
    NButton: dummy, NIcon: dummy, AddFilled: dummy, AddBoxOutlined: dummy,
    EquipmentRow: dummy, ItemModal: dummy,
    EQUIPMENT_LABELS: [{ label: `Weapon`, slot: `weapon`, color: `white` }], PET_EQUIPMENT_LABELS: [],
    DAMAGE_TYPE_COLORS: {},
    CharacterCollapse: dummy, EffectsCollapse: dummy, EquipmentCollapse: dummy,
    InventoryCollapse: dummy, MiniStats: dummy, SkillsCollapse: dummy,
    ItemDetails: dummy, SelectPlayerModalAs: dummy, InventoryRow: dummy,
    state, updateCounter: Vue.ref(0), incrementUiDiagnostic () {}, setMode () {}, prevMode () {}, showError () {},
    useHelpers: () => ({ ansiToHtml: value => value, copperToMoneyString: value => value, getActions: () => [] }),
    useWebSocket: () => ({
      fetchItems: iids => new Promise(resolve => batches.push({ iids, resolve })),
      fetchItem: iid => new Promise(resolve => details.push({ iid, resolve }))
    }),
    ...overrides
  }
  const source = readFileSync(new URL(path, import.meta.url), `utf8`)
  const { descriptor } = parse(source)
  const compiled = compileScript(descriptor, { id: `inventory-test`, genDefaultAs: `component` })
  // Execute the actual component setup with network/UI imports replaced by test doubles.
  for (const match of compiled.content.matchAll(/^import ([\s\S]*?) from ['"]([^'"]+)['"]/gm)) {
    const imported = match[1].replace(/\/\/[^\n]*/g, ``).replace(/[{}]/g, ``).split(`,`)
    for (const name of imported) {
      const [original, alias] = name.trim().split(/\s+as\s+/)
      const local = alias || original
      if (/^[A-Za-z_$][\w$]*$/.test(local) && !Object.hasOwn(bindings, local)) {
        bindings[local] = match[2] === `vue` ? Vue[original] : dummy
      }
    }
  }
  const code = compiled.content.replace(/^import[\s\S]*?from ['"][^'"]+['"]\s*$/gm, ``).replaceAll(`import.meta.env`, `testEnvironment`)
  const component = compileFunction(`${code}\nreturn component`, Object.keys(bindings))(...Object.values(bindings))
  component.render = () => null
  const app = renderer.createApp({ render: () => Vue.h(component, { ...props }) })
  const instance = app.mount({})
  return { app, state, batches, details, setup: instance.$.subTree.component.setupState }
}

async function flush () {
  await Vue.nextTick()
  await delay(25)
  await Vue.nextTick()
}

test(`inventory pane fetches mercenary IDs and watches updates when reopened as the mercenary`, async () => {
  const view = mountInventory(`../src/components/game-modal/InventoryPane.vue`)
  try {
    assert.deepEqual(view.batches[0].iids, [`sword`])
    view.batches[0].resolve([{ iid: `sword`, name: `iron sword`, amount: 1 }])
    await flush()
    assert.equal(view.setup.items[0].fullName, `iron sword`)
    assert.equal(view.setup.getNumItems(), 1)
    assert.equal(view.setup.getMaxNumItems(), 20)
    assert.equal(view.setup.getWeight(), 3)
    assert.equal(view.setup.getMaxWeight(), 80)
    assert.equal(view.setup.inventoryStats.money, 2)

    view.state.gameState.charmies = { merc: { items: [`shield`], stats: { money: 4, weight: 5 } } }
    await flush()
    assert.deepEqual(view.batches[1].iids, [`shield`])
    view.batches[1].resolve([{ iid: `shield`, name: `wooden shield` }])
    await flush()
    assert.equal(view.setup.items[0].iid, `shield`)
    assert.equal(view.setup.inventoryStats.money, 4)
  } finally {
    view.app.unmount()
  }
})

test(`switching owner rejects the previous inventory response before the next fetch starts`, async () => {
  const view = mountInventory(`../src/components/game-modal/InventoryPane.vue`)
  try {
    view.state.playerModalAs = ``
    await Vue.nextTick()
    view.batches[0].resolve([{ iid: `sword`, name: `iron sword` }])
    await Vue.nextTick()
    await Vue.nextTick()
    assert.deepEqual(view.setup.items, [])
    await flush()
    assert.deepEqual(view.batches[1].iids, [`apple`])
    view.batches[1].resolve([{ iid: `apple`, name: `apple` }])
    await flush()
    assert.equal(view.setup.items[0].iid, `apple`)
    assert.equal(view.setup.inventoryStats.money, 100)
  } finally {
    view.app.unmount()
  }
})

test(`closing the pane during a fetch stops watchers and ignores late responses`, async () => {
  const view = mountInventory(`../src/components/game-modal/InventoryPane.vue`)
  view.app.unmount()
  view.batches[0].resolve([{ iid: `sword`, name: `iron sword` }])
  await flush()
  assert.deepEqual(view.setup.items, [])
  view.state.gameState.charmies.merc.items = [`shield`]
  await flush()
  assert.equal(view.batches.length, 1)
})

test(`switching owners clears item details and ignores an outstanding detail fetch`, async () => {
  const view = mountInventory(`../src/components/game-modal/InventoryPane.vue`)
  try {
    const pending = view.setup.selectItem({ iid: `sword` })
    view.state.playerModalAs = ``
    await Vue.nextTick()
    view.details[0].resolve({ iid: `sword`, name: `iron sword` })
    await pending
    assert.deepEqual(view.setup.selectedItem, {})
    assert.deepEqual(view.setup.selectedIid, {})
  } finally {
    view.app.unmount()
  }
})

test(`mobile inventory resolves mercenary IDs, detects replacement, and tolerates missing details`, async () => {
  const props = Vue.reactive({ inventory: [`potion`], isPlayer: false, character: { eid: `merc`, money: 2 } })
  const view = mountInventory(`../src/components/mobile-menu/collapse-items/InventoryCollapse.vue`, props)
  try {
    await flush()
    assert.deepEqual(view.batches[0].iids, [`potion`])
    view.batches[0].resolve([{ iid: `potion`, name: `healing potion`, amount: 4 }])
    await flush()
    assert.equal(view.setup.filteredItems[0].fullName, `4x healing potion`)
    // A timeout or missing item supplies no type/colorName; filtering must still work.
    props.inventory = [`missing`]
    await flush()
    assert.deepEqual(view.batches[1].iids, [`missing`])
    view.batches[1].resolve([])
    await flush()
    view.setup.searchTerm = `potion`
    await Vue.nextTick()
    assert.deepEqual(view.setup.filteredItems, [])
  } finally {
    view.app.unmount()
  }
})

test(`closing mobile inventory ignores outstanding requests`, async () => {
  const view = mountInventory(`../src/components/mobile-menu/collapse-items/InventoryCollapse.vue`, {
    inventory: [`sword`], character: {}
  })
  await flush()
  view.setup.clickHandler(`sword`)
  view.app.unmount()
  view.batches[0].resolve([{ iid: `sword`, name: `iron sword` }])
  view.details[0].resolve({ iid: `sword`, name: `iron sword` })
  await flush()
  assert.deepEqual(view.setup.items, [])
  assert.deepEqual(view.setup.selectedItem, {})
})

test(`mercenary sidebar follows immutable state patches and later nested item changes`, async () => {
  const merc = { traits: [`mercenary`], items: [`sword`], stats: { eid: `merc` }, skills: {}, effects: {}, equipment: {} }
  const state = Vue.reactive({ mercEid: -1, gameState: { party: [], charmies: { merc } } })
  const view = mountInventory(`../src/components/modals/MercModal.vue`, {}, {
    state,
    useHelpers: () => ({ getMerc: () => state.gameState.charmies.merc })
  })
  try {
    assert.deepEqual(view.setup.mercInventory, [`sword`])
    state.gameState.charmies = { merc: { ...merc, items: [`shield`] } }
    await Vue.nextTick()
    assert.deepEqual(view.setup.mercInventory, [`shield`])
    state.gameState.charmies.merc.items = [`potion`]
    await Vue.nextTick()
    assert.deepEqual(view.setup.mercInventory, [`potion`])
  } finally {
    view.app.unmount()
  }
})

test(`equipment sidebar uses its character's equipment and clears removed selections`, async () => {
  const props = Vue.reactive({ equipment: { weapon: `merc-sword` }, ownerEid: `merc` })
  const view = mountInventory(`../src/components/mobile-menu/collapse-items/EquipmentCollapse.vue`, props)
  try {
    assert.equal(view.setup.equipmentRows[0].iid, `merc-sword`)
    const pending = view.setup.clickHandler(`merc-sword`, `weapon`)
    props.equipment = { weapon: `merc-wand` }
    await Vue.nextTick()
    view.details[0].resolve({ iid: `merc-sword` })
    await pending
    assert.equal(view.setup.equipmentRows[0].iid, `merc-wand`)
    assert.equal(view.setup.selectedIid, ``)
    assert.deepEqual(view.setup.item, {})
  } finally {
    view.app.unmount()
  }
})

test(`sidebar item actions target their owner independently of the main inventory selector`, () => {
  for (const isPlayer of [true, false]) {
    const view = mountInventory(`../src/components/mobile-menu/collapse-items/InventoryCollapse.vue`, {
      inventory: [], isPlayer, character: { eid: `merc` }
    })
    assert.equal(view.setup.getInventoryOrderCmd(), isPlayer ? `` : `order eid:merc `)
    view.app.unmount()
  }
})

test(`equipment removal targets the modal's owner instead of the global selector`, () => {
  for (const ownerEid of [``, `merc`]) {
    const commands = []
    const view = mountInventory(`../src/components/modals/ItemModal.vue`, {
      item: { iid: `sword` }, mode: `equipment`, ownerEid
    }, { ANSI: {}, useWebSocket: () => ({ runCommand: command => commands.push(command) }) })
    view.setup.getItemActions()[0].onClick()
    assert.deepEqual(commands, [ownerEid ? `order eid:merc remove iid:sword` : `remove iid:sword`])
    view.app.unmount()
  }
})

test(`character weapon stats load immediately and reject outdated fetches after equipment changes`, async () => {
  const props = Vue.reactive({ equipment: { weapon: `wand` }, character: {}, isPlayer: false })
  const view = mountInventory(`../src/components/mobile-menu/collapse-items/CharacterCollapse.vue`, props)
  try {
    assert.equal(view.details[0].iid, `wand`)
    props.equipment = { weapon: `sword` }
    await Vue.nextTick()
    view.details[1].resolve({ iid: `sword`, damageType: `slashing` })
    await Vue.nextTick()
    view.details[0].resolve({ iid: `wand`, damageType: `fire` })
    await Vue.nextTick()
    assert.equal(view.setup.getDamageType(), `slashing`)
  } finally {
    view.app.unmount()
  }
})

test(`score pane follows selected character weapons and calculates level progress from the level baseline`, async () => {
  const state = Vue.reactive({ playerModalAs: `merc`, gameState: {
    player: {}, equipment: { weapon: `player-sword` },
    charmies: { merc: { stats: { xp: 500, xpForCurrentLevel: 400, xpForNextLevel: 600 }, equipment: { weapon: `merc-wand` } } }
  } })
  const view = mountInventory(`../src/components/game-modal/ScorePane.vue`, {}, { state })
  try {
    assert.equal(view.details[0].iid, `merc-wand`)
    assert.equal(view.setup.getExpPercentage(), 50)
    state.playerModalAs = ``
    await Vue.nextTick()
    assert.equal(view.details[1].iid, `player-sword`)
    view.details[1].resolve({ iid: `player-sword`, damageType: `slashing` })
    await Vue.nextTick()
    view.details[0].resolve({ iid: `merc-wand`, damageType: `fire` })
    await Vue.nextTick()
    assert.equal(view.setup.getDamageType(), `slashing`)
  } finally {
    view.app.unmount()
  }
})

test(`auction selling uses player inventory even while a mercenary is selected elsewhere`, async () => {
  const view = mountInventory(`../src/components/auction-modal/AuctionSell.vue`)
  assert.deepEqual(view.batches[0].iids, [`apple`])
  view.app.unmount()
  view.batches[0].resolve([{ iid: `apple`, name: `apple` }])
  await flush()
  assert.deepEqual(view.setup.items, [])
  view.state.gameState.inventory = [{ iid: `shield` }]
  await flush()
  assert.equal(view.batches.length, 1)
})

test(`app avoids duplicate connections and clears reconnect/cache timers on unmount`, () => {
  const state = { connected: false, websocketConnection: null, inputEmitter: new EventEmitter() }
  const timeouts = new Map()
  const intervals = new Map()
  let sequence = 0
  let connects = 0
  let closes = 0
  const view = mountInventory(`../src/App.vue`, {}, {
    state, resetMode () {}, stopPlaying () {},
    resetState: () => { state.websocketConnection = null },
    useLocalStorageHandler: () => ({ loadOptions () {}, loadInputMappings () {} }),
    useWebSocket: () => ({
      initConnection: () => { connects++; state.websocketConnection = { readyState: 0 } },
      closeConnection: () => { closes++ }
    }),
    CACHE_DELETE_TIME: 1000, CACHE_DELETE_INTERVAL: 1000,
    setTimeout: callback => { const id = sequence++; timeouts.set(id, callback); return id },
    clearTimeout: id => timeouts.delete(id),
    setInterval: callback => { const id = sequence++; intervals.set(id, callback); return id },
    clearInterval: id => intervals.delete(id)
  })
  assert.equal(connects, 1)
  view.setup.doConnect()
  assert.equal(connects, 1)
  view.setup.onClose()
  const reconnect = [...timeouts.values()][0]
  view.app.unmount()
  assert.equal(timeouts.size, 0)
  assert.equal(intervals.size, 0)
  assert.equal(closes, 1)
  reconnect()
  assert.equal(connects, 1)
})

test(`trigger menu retains selected settings after storage updates and ignores missing selections`, () => {
  const state = Vue.reactive({ name: `Hero`, inputEmitter: new EventEmitter(),
    modals: { triggersModal: true },
    triggers: new Map([[`1`, { name: `Test`, active: true, patterns: [`ready`], commands: `say hi`, shared: false }]]),
    variables: new Map([[`1`, { name: `Target`, values: `merc`, shared: false }]])
  })
  const view = mountInventory(`../src/components/modals/TriggersModal.vue`, {}, {
    state, getNextKey: () => 2, loadSettingsByNameAndType () {}, storeSettingsOfType () {}
  })
  try {
    assert.doesNotThrow(() => view.setup.updateCheckedTriggerKeys([`1`]))
    view.setup.updateSelectedTriggerKeys([`1`])
    view.setup.onStorage({ key: `triggers` })
    assert.equal(view.setup.triggerModel.key, `1`)
    view.setup.updateSelectedVariableKeys([`1`])
    view.setup.onStorage({ key: `variables` })
    assert.equal(view.setup.variableModel.key, `1`)
  } finally {
    view.app.unmount()
  }
})
