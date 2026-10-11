// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EventEmitter } from 'node:events'
import { nextTick, reactive, ref } from 'vue'
import { mountComponent } from './support/components.js'

test(`chat open/close cycles release watcher handles and input listeners`, async () => {
  const emitter = new EventEmitter()
  const state = reactive({ inputEmitter: emitter, messages: [], unseenMessageCount: {}, modals: { chatModal: false } })
  const view = mountComponent(`../../src/components/modals/ChatModal.vue`, {
    state, CHANNELS: [{ name: `chat`, label: `Chat` }], useHelpers: () => ({}),
    document: { querySelector: () => ({ scrollHeight: 10 }) }
  })
  try {
    for (let i = 0; i < 100; i++) {
      view.setup.onModalOpened()
      assert.equal(view.setup.watchers.length, 1)
      assert.equal(emitter.listenerCount(`prevChannel`), 1)
      await nextTick()
      view.setup.onModalClosed()
      assert.equal(view.setup.watchers.length, 0)
      assert.equal(emitter.listenerCount(`prevChannel`), 0)
    }
    view.setup.onModalOpened()
    await nextTick()
  } finally {
    view.app.unmount()
  }
  assert.equal(emitter.eventNames().length, 0)
})

test(`chat scrolling tolerates teardown before its deferred DOM lookup`, async () => {
  let removed = false
  const view = mountComponent(`../../src/components/modals/ChatModal.vue`, {
    state: reactive({ inputEmitter: new EventEmitter(), messages: [], unseenMessageCount: {}, modals: {} }),
    CHANNELS: [{ name: `chat`, label: `Chat` }], useHelpers: () => ({}),
    document: { querySelector: () => (removed ? null : { scrollHeight: 10 }) }
  })
  view.setup.onModalOpened()
  removed = true
  view.app.unmount()
  await nextTick()
})

test(`crafting-modal unmount removes an open modal's resize listener`, () => {
  const listeners = new Set()
  const view = mountComponent(`../../src/components/modals/CraftingModal.vue`, {
    state: reactive({ recipeSearch: { page: 1, limit: 30, mode: `all` }, recipeResults: { count: 1 } }),
    useHelpers: () => ({}), useWebSocket: () => ({ runCommand () {} }),
    window: { innerWidth: 1000, addEventListener: (event, fn) => listeners.add(fn), removeEventListener: (event, fn) => listeners.delete(fn) }
  })
  view.setup.onModalOpened()
  assert.equal(listeners.size, 1)
  view.app.unmount()
  assert.equal(listeners.size, 0)
})

test(`music controls tolerate missing audio, initialize later, and cancel their animation frame`, () => {
  const frames = new Map()
  const mounted = []
  let sequence = 0
  let samples = 0
  const element = { style: {}, width: 186, height: 36, getContext: () => ({ clearRect () {}, fillRect () {}, fill () {} }) }
  const state = reactive({ music: { audioAnalyzer: null, gainNode: null }, options: { volume: 50 } })
  const view = mountComponent(`../../src/components/common/MusicPlayer.vue`, {
    state, ref: value => ref(value ?? element), onMounted: fn => mounted.push(fn),
    requestAnimationFrame: fn => { const id = ++sequence; frames.set(id, fn); return id },
    cancelAnimationFrame: id => frames.delete(id)
  })
  try {
    mounted.forEach(fn => fn())
    assert.equal(frames.size, 1)
    assert.doesNotThrow(() => view.setup.updateVolume())
    state.music.audioAnalyzer = { frequencyBinCount: 16, getByteFrequencyData: array => { samples++; assert.equal(array.length, 16) } }
    state.music.gainNode = { gain: { value: 0 } }
    const [id, frame] = [...frames.entries()][0]
    frames.delete(id)
    frame()
    view.setup.updateVolume()
    assert.equal(samples, 1)
    assert.equal(state.music.gainNode.gain.value, 0.5)
    assert.equal(frames.size, 1)
  } finally {
    view.app.unmount()
  }
  assert.equal(frames.size, 0)
})

test(`battlefield labels and targeting tolerate a player missing during a state handoff`, () => {
  const state = reactive({ options: { battleRelativePositions: true }, gameState: { player: { eid: `hero` }, battle: { participants: {} } } })
  const view = mountComponent(`../../src/components/battle/BattleField.vue`, {
    state, useHelpers: () => ({}), useWebSocket: () => ({ runCommand () {} })
  })
  const enemy = { eid: `enemy`, tag: `Enemy` }
  try {
    assert.equal(view.setup.getPositionLabel(5), 5)
    assert.equal(view.setup.getTag(enemy), `Enemy`)
    assert.equal(view.setup.isMyTarget(enemy), false)
    state.gameState.battle.participants.hero = { eid: `hero`, position: 2, targetEid: `enemy` }
    assert.equal(view.setup.getPositionLabel(5), 3)
    assert.equal(view.setup.getTag(state.gameState.battle.participants.hero), `You`)
    assert.equal(view.setup.isMyTarget(enemy), true)
  } finally {
    view.app.unmount()
  }
})
