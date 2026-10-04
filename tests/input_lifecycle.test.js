// @ts-check
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { test } from 'node:test'
import { nextTick, reactive } from 'vue'
import { mountComponent } from './support/components.js'

function keyboard () {
  const commands = []
  const timers = new Map()
  const frames = new Map()
  let sequence = 0
  const state = { mode: `modal-input`, playerModalAs: `merc`, gameState: { charmies: { merc: {} } }, inputEmitter: new EventEmitter(), options: {} }
  const view = mountComponent(`../../src/components/main-area/KeyboardInput.vue`, {
    state, setMode () {}, prevMode () {},
    useWebSocket: () => ({ runCommand: command => commands.push(command) }),
    document: { hidden: false, getElementById: () => null },
    window: { addEventListener () {}, removeEventListener () {} },
    setTimeout: callback => { const id = sequence++; timers.set(id, callback); return id },
    clearTimeout: id => timers.delete(id),
    requestAnimationFrame: callback => { const id = sequence++; frames.set(id, callback); return id },
    cancelAnimationFrame: id => frames.delete(id)
  }, { focusMode: `modal-input`, activeModes: [`modal-input`] })
  view.setup.input = { value: `look`, focus () {}, blur () {}, select () {} }
  return { ...view, state, commands, timers, frames }
}

test(`recalled commands gain only the current mercenary prefix`, () => {
  const view = keyboard()
  try {
    view.setup.sendCommand()
    view.setup.prevCommand()
    view.setup.input.value = view.setup.text
    view.state.playerModalAs = ``
    view.setup.sendCommand()
    assert.deepEqual(view.commands, [`order eid:merc look`, `look`])
  } finally {
    view.app.unmount()
  }
})

test(`input timers tolerate a missing output pane and are canceled when input unmounts`, () => {
  const view = keyboard()
  view.setup.sendCommand()
  const [id, callback] = [...view.timers.entries()][0]
  view.timers.delete(id)
  assert.doesNotThrow(() => callback())
  view.setup.onWindowFocus()
  view.app.unmount()
  assert.equal(view.timers.size, 0)
  assert.equal(view.frames.size, 0)
})

test(`long sessions keep command history and deferred scroll callbacks bounded`, () => {
  const view = keyboard()
  try {
    for (let index = 0; index < 1000; index++) {
      view.setup.input.value = `look ${index}`
      view.setup.sendCommand()
    }
    assert.equal(view.setup.commandHistory.length, 200)
    assert.equal(view.setup.commandHistory[0], `look 999`)
    assert.equal(view.timers.size, 1)
  } finally {
    view.app.unmount()
  }
})

function gamepad () {
  const frames = new Map()
  let sequence = 0
  let pads = [{ index: 0, id: `Controller`, buttons: [], axes: [0, 0, 0, 0] }]
  const state = reactive({ inputMappings: [], metaKeyState: { ctrl: true, shift: true, alt: true }, mode: `hotkey`,
    inputEmitter: new EventEmitter(), options: { gamepadEnabled: true }, gamepads: {}, gamepadPrevStates: {}, gameState: { battle: { active: false } }
  })
  const view = mountComponent(`../../src/components/InputHandler.vue`, {
    state, document: { hidden: false, addEventListener () {}, removeEventListener () {} },
    window: { addEventListener () {}, removeEventListener () {} }, navigator: { getGamepads: () => pads },
    requestAnimationFrame: callback => { const id = sequence++; frames.set(id, callback); return id },
    cancelAnimationFrame: id => frames.delete(id)
  })
  return { ...view, state, frames, removePad: () => { pads = [null] } }
}

test(`focus changes preserve a single gamepad loop and clear stuck modifier keys`, () => {
  const view = gamepad()
  try {
    assert.equal(view.frames.size, 1)
    view.setup.onBlur()
    assert.deepEqual(view.state.metaKeyState, { ctrl: false, shift: false, alt: false })
    view.setup.onFocus()
    assert.equal(view.frames.size, 1)
  } finally {
    view.app.unmount()
  }
  assert.equal(view.frames.size, 0)
})

test(`an unplugged controller does not crash the animation loop`, () => {
  const view = gamepad()
  try {
    view.removePad()
    assert.doesNotThrow(() => view.setup.gamepadStateLoop())
  } finally {
    view.app.unmount()
  }
})

test(`disabling and re-enabling gamepad support stops and resumes polling`, async () => {
  const view = gamepad()
  try {
    view.state.options.gamepadEnabled = false
    await nextTick()
    assert.equal(view.frames.size, 0)
    view.state.options.gamepadEnabled = true
    await nextTick()
    assert.equal(view.frames.size, 1)
  } finally {
    view.app.unmount()
  }
})
