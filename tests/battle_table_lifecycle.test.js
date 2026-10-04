// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nextTick, reactive } from 'vue'
import { mountComponent } from './support/components.js'

function battleTable () {
  let sequence = 0
  const timers = new Map()
  const state = reactive({
    animations: [], options: {},
    gameState: { player: { eid: `player` }, party: {}, charmies: {}, battle: { participants: {}, myTurn: false } }
  })
  const view = mountComponent(`../../src/components/battle/BattleTable.vue`, {
    state, useWebSocket: () => ({ runCommand () {} }),
    useHelpers: () => ({
      ansiToHtml: text => text, renderNumber: String,
      getHpColorByPercent: percent => percent,
      getEnergyColorByPercent: percent => percent,
      getStaminaColorByPercent: percent => percent
    }),
    setTimeout: callback => { const id = ++sequence; timers.set(id, callback); return id },
    clearTimeout: id => timers.delete(id)
  })
  async function animate (key, type = `damage`) {
    state.animations.push({ key, eid: `target`, type, amount: 1 })
    await nextTick()
  }
  function fireTimer (id) {
    const callback = timers.get(id)
    timers.delete(id)
    callback()
  }
  return { ...view, state, timers, animate, fireTimer }
}

test(`battle rows tolerate a missing player participant`, () => {
  const view = battleTable()
  try {
    const participant = { eid: `target`, side: `evil`, position: 8 }
    assert.deepEqual(view.setup.getParticipantClass(participant), [`participant`, `evil`])
    assert.equal(view.setup.getDistance(participant), ``)
    view.state.gameState.battle.participants.player = { eid: `player`, position: 2, targetEid: `target` }
    assert.ok(view.setup.getParticipantClass(participant).includes(`my-target`))
    assert.equal(view.setup.getDistance(participant), 6)
  } finally {
    view.app.unmount()
  }
})

test(`allied battle rows use participant percentages when party details are unavailable`, () => {
  const view = battleTable()
  try {
    const participant = { eid: `ally`, side: `good`, hpPercent: 50, energyPercent: 25, staminaPercent: 75 }
    assert.equal(view.setup.getHp(participant), `50%`)
    assert.equal(view.setup.getEnergy(participant), `25%`)
    assert.equal(view.setup.getStamina(participant), `75%`)
    assert.equal(view.setup.getHpColor(participant), 0.5)
    assert.equal(view.setup.getEnergyColor(participant), 0.25)
    assert.equal(view.setup.getStaminaColor(participant), 0.75)
    view.state.gameState.party.ally = { hp: 10, maxHp: 20, energy: 5, maxEnergy: 20, stamina: 15, maxStamina: 20 }
    assert.equal(view.setup.getHp(participant), 10)
    assert.equal(view.setup.getEnergy(participant), 5)
    assert.equal(view.setup.getStamina(participant), 15)
    assert.equal(view.setup.getHpColor(participant), 0.5)
  } finally {
    view.app.unmount()
  }
})

test(`repeated battle animations keep one timer per entity and preserve the newest flash`, async () => {
  const view = battleTable()
  try {
    await view.animate(`first`)
    const oldId = [...view.timers.keys()][0]
    const oldCallback = view.timers.get(oldId)
    await view.animate(`second`)
    assert.equal(view.timers.size, 1)
    assert.equal(view.timers.has(oldId), false)
    oldCallback()
    assert.equal(view.setup.flashing.target, `damage`)
    view.fireTimer([...view.timers.keys()][0])
    assert.equal(view.setup.flashing.target, undefined)
  } finally {
    view.app.unmount()
  }
})

test(`battle flash cleanup cancels pending callbacks and stops watchers on unmount`, async () => {
  const view = battleTable()
  await view.animate(`first`, `healing`)
  const oldCallback = [...view.timers.values()][0]
  view.app.unmount()
  assert.equal(view.timers.size, 0)
  oldCallback()
  assert.equal(view.timers.size, 0)
  await view.animate(`late`)
  assert.equal(view.timers.size, 0)
})
