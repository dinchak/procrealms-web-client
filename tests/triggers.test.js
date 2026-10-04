// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { reactive } from 'vue'
import { loadRuntimeModule } from './support/runtime.js'

function createTriggers () {
  const saved = new Map()
  const commands = []
  const storageEvents = []
  const warnings = []
  const state = reactive({ name: `Hero`, triggers: new Map(), variables: new Map() })
  const localStorage = { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) }
  const api = loadRuntimeModule(`../../src/static/triggers.js`, {
    state, localStorage,
    useWebSocket: () => ({ runCommand: command => commands.push(command) }),
    document: { createElement: () => ({ set innerHTML (value) { this.textContent = value }, textContent: `` }) },
    window: { dispatchEvent: event => storageEvents.push(event.key) },
    StorageEvent: class { constructor (type, options) { this.key = options.key } },
    console: { warn: (...args) => warnings.push(args) }
  }, [`loadSettingsByNameAndType`, `storeSettingsOfType`, `processTriggers`])
  return { api, state, saved, commands, storageEvents, warnings }
}

test(`trigger settings recover malformed storage and preserve colliding private/shared IDs`, () => {
  const view = createTriggers()
  view.saved.set(`variables-hero`, `{bad json`)
  view.api.loadSettingsByNameAndType(view.state.variables, `Hero`, `variables`)
  assert.equal(view.state.variables.size, 0)
  view.saved.set(`triggers-hero`, JSON.stringify([[1, { name: `Private`, shared: false }]]))
  view.saved.set(`triggers`, JSON.stringify([[`1`, { name: `Shared`, shared: true }]]))
  view.api.loadSettingsByNameAndType(view.state.triggers, `Hero`, `triggers`)
  assert.deepEqual([...view.state.triggers.keys()].sort(), [`1`, `2`])
  assert.deepEqual(JSON.parse(view.saved.get(`triggers-hero`)), [[`2`, { name: `Private`, shared: false }]])
  view.api.loadSettingsByNameAndType(view.state.triggers, `Hero`, `triggers`)
  assert.equal(view.state.triggers.size, 2)
})

test(`trigger assignments preserve shared status, support lists, and notify without window.onstorage`, () => {
  const view = createTriggers()
  view.state.triggers.set(`1`, { name: `List`, active: true, shared: true, patterns: [`^ready$`], commands: `a = {red,blue}\nsay $a[1] $a` })
  view.api.processTriggers(`ready`)
  assert.deepEqual(view.commands, [`say blue red`])
  assert.deepEqual([...view.state.variables.values()], [{ name: `a`, values: `red\nblue`, shared: true }])
  assert.deepEqual(view.storageEvents, [`variables`])
  assert.equal(view.warnings.length, 0)
})

test(`capture substitution handles $10 and literal replacement characters`, () => {
  const view = createTriggers()
  view.state.triggers.set(`1`, { name: `Captures`, active: true, patterns: [`^(a)(b)(c)(d)(e)(f)(g)(h)(i)(j)$`], commands: `say $10 $1` })
  view.api.processTriggers(`abcdefghij`)
  assert.deepEqual(view.commands, [`say j a`])
  view.state.triggers.clear()
  view.state.triggers.set(`1`, { name: `Dollars`, active: true, patterns: [`^(.*)$`], commands: `say $1` })
  view.api.processTriggers(`$&`)
  assert.equal(view.commands[1], `say $&`)
})

test(`invalid patterns do not prevent other triggers or future batches from running`, () => {
  const view = createTriggers()
  view.state.triggers.set(`1`, { name: `Invalid`, active: true, patterns: [`[`], commands: `say broken` })
  view.state.triggers.set(`2`, { name: `Valid`, active: true, patterns: [`ready`], commands: `say ready` })
  view.api.processTriggers(`ready`)
  view.api.processTriggers(`ready`)
  assert.deepEqual(view.commands, [`say ready`, `say ready`])
  assert.equal(view.warnings.length, 2)
})

test(`variables accept stored arrays and empty values, preserving longer names and dollar signs`, () => {
  const view = createTriggers()
  view.state.variables.set(`1`, { name: `a`, values: `short` })
  view.state.variables.set(`2`, { name: `apple`, values: [`$&`, `second`] })
  view.state.variables.set(`3`, { name: `empty`, values: null })
  view.state.triggers.set(`1`, { name: `Variables`, active: true, patterns: [`ready`], commands: `say $apple[1] $apple $a $empty` })
  view.api.processTriggers(`ready`)
  assert.deepEqual(view.commands, [`say second $& short `])
  assert.equal(view.warnings.length, 0)
})
