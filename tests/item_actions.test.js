// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadRuntimeModule } from './support/runtime.js'

test(`item actions retain their inventory owner and support an explicit player context`, async () => {
  const commands = []
  const refreshed = []
  let selected = `merc`
  const api = loadRuntimeModule(`../../src/composables/helpers.js`, {
    dayjs: { extend () {} }, relativeTime: {},
    AnsiUp: class { ansi_to_html (value) { return value } },
    state: { gameState: { room: { flags: [] }, tools: {}, skills: {} } },
    getOrderCmd: () => (selected ? `order eid:${selected} ` : ``),
    ANSI: {}, ANSI_REPLACEMENTS: {}, CHANNELS: {}, DIRECTION_MAP: {},
    useWebSocket: () => ({
      runCommand: command => {
        commands.push(command)
        return Promise.resolve()
      },
      refreshItem: iid => {
        refreshed.push(iid)
        return Promise.resolve()
      }
    })
  }, [`useHelpers`])
  const helper = api.useHelpers()
  const item = { iid: `potion`, type: `consumable`, subtype: `potion`, amount: 1 }
  await helper.getActions(item, ``).find(action => action.label === `Drink`).onClick()
  const mercAction = helper.getActions(item).find(action => action.label === `Drink`)
  selected = ``
  await mercAction.onClick()
  assert.deepEqual(commands, [`drink iid:potion`, `order eid:merc drink iid:potion`])
  assert.deepEqual(refreshed, [`potion`, `potion`])
})
