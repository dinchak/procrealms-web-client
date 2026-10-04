// @ts-check
import { state } from '@/static/state'
import { useWebSocket } from '@/composables/web_socket'

const { runCommand } = useWebSocket()

const assignmentPattern = '^([a-zA-Z][a-zA-Z0-9]{0,50}) = (.+)$'
const listValuePattern = '^{(.*)}$'
const triggerBatch = {
  queue: [],
  scheduled: false,
  timeout: null,
}
const TRIGGER_BATCH_MS_BUDGET = 8

export function loadSettingsByNameAndType (settings, name, settingsType) {
  let privateSettings = loadSettingsByStorageKey(settingsType + '-' + name.toLowerCase())
  let sharedSettings = loadSettingsByStorageKey(settingsType)

  let privateKeys = [...privateSettings.keys()]
  let sharedKeys = [...sharedSettings.keys()]
  let clashingKeys = privateKeys.filter(key => sharedKeys.includes(key))
  clashingKeys.forEach(key => {
    let triggerToGiveNewKey = privateSettings.get(key)
    let newKey = String(Math.max(getNextKey(privateSettings), getNextKey(sharedSettings)))
    privateSettings.delete(key)
    privateSettings.set(newKey, triggerToGiveNewKey)
  })

  settings.clear()
  for (const [key, value] of new Map([...privateSettings, ...sharedSettings])) {
    settings.set(key, value)
  }

  if (clashingKeys.length) {
    storeSettingsOfType(settings, settingsType)
  }
}

function loadSettingsByStorageKey (key) {
  try {
    const entries = JSON.parse(localStorage.getItem(key)) || []
    return new Map(entries.map(([id, value]) => [String(id), value]))
  } catch {
    localStorage.setItem(key, '[]')
    return new Map()
  }
}

export function getNextKey (settings) {
  let idsAsNumbers = [...settings.keys()].map(k => Number(k))
  return 1 + (settings.size ? Math.max(...idsAsNumbers) : 0)
}

export function storeSettingsOfType (settings, settingsType) {
  let settingsEntries = Array.from(settings.entries())
  let privateSettings = settingsEntries.filter(entry => !entry[1].shared)
  let sharedSettings = settingsEntries.filter(entry => entry[1].shared)
  localStorage.setItem(settingsType + '-' + state.name.toLowerCase(), JSON.stringify(privateSettings))
  localStorage.setItem(settingsType, JSON.stringify(sharedSettings))
}

export function processTriggers (line) {
  let triggers = [...state.triggers.values()]
  if (line) {
    triggers
      .filter(trigger => trigger && trigger.active && trigger.patterns?.[0] && typeof trigger.commands === 'string')
      .forEach(trigger => {
        try {
          processTrigger(trigger, stripHtml(line))
        } catch (err) {
          console.warn(`Failed to run trigger ${trigger.name}:`, err)
        }
      })
  }
}

function flushTriggerBatch () {
  triggerBatch.scheduled = false
  triggerBatch.timeout = null
  const start = performance.now()

  while (triggerBatch.queue.length) {
    const line = triggerBatch.queue.shift()
    processTriggers(line)

    if (performance.now() - start >= TRIGGER_BATCH_MS_BUDGET) {
      break
    }
  }

  if (triggerBatch.queue.length) {
    triggerBatch.scheduled = true
    triggerBatch.timeout = setTimeout(flushTriggerBatch, 0)
  }
}

export function processTriggersBatch (lines = []) {
  if (!Array.isArray(lines) || lines.length == 0) {
    return
  }

  triggerBatch.queue.push(...lines.filter(line => !!line))

  if (!triggerBatch.scheduled) {
    triggerBatch.scheduled = true
    triggerBatch.timeout = setTimeout(flushTriggerBatch, 0)
  }
}

export function resetTriggerBatch () {
  clearTimeout(triggerBatch.timeout)
  triggerBatch.timeout = null
  triggerBatch.queue = []
  triggerBatch.scheduled = false
}

function processTrigger (trigger, line) {
  let matches = line.match(trigger.patterns[0])
  if (matches) {
    trigger.commands
      .split('\n')
      .filter(command => command)
      .map(command => substitutePatternMatches(matches, command))
      .forEach(commandWithMatches => processCommand(commandWithMatches, trigger.shared))
  }
}

function processCommand (commandWithMatches, isTriggerShared) {
  let assignmentParts = commandWithMatches.match(assignmentPattern)
  if (assignmentParts) {
    assignValueToVariable(assignmentParts, isTriggerShared)
  } else {
    executeCommand(commandWithMatches)
  }
}

function assignValueToVariable (assignmentParts, isTriggerShared) {

  let valueParts = assignmentParts[2].match(listValuePattern)
  let values = valueParts ? valueParts[1].split(',').join('\n') : assignmentParts[2]

  let existingVariableKey = [...state.variables.entries()]
    .filter(variableEntry => variableEntry[1].name === assignmentParts[1])
    .map(variableEntry => variableEntry[0])
    .find(() => true)

  if (existingVariableKey) {
    state.variables.get(existingVariableKey).values = values
  } else {
    let key = getNextKey(state.variables) + ''
    state.variables.set(key, { name: assignmentParts[1], values, shared: isTriggerShared })
  }

  storeSettingsOfType(state.variables, 'variables')
  window.dispatchEvent(new StorageEvent('storage', { key: 'variables' }))
}

function executeCommand (commandWithMatches) {
  let commandWithMatchesAndVariables = substituteVariables(commandWithMatches)
  runCommand(commandWithMatchesAndVariables)
}

function substitutePatternMatches (matches, command) {
  return command.replace(/\$(\d+)/g, (placeholder, index) => matches[Number(index)] ?? placeholder)
}

function substituteVariables (command) {
  return [...state.variables.values()]
    .sort((a, b) => b.name.length - a.name.length)
    .reduce((accu, variable) => {
      return substituteValuesByIndex(variable, accu)
        .replaceAll('$' + variable.name, () => getVariableValues(variable)[0])
    }, command)
}

function substituteValuesByIndex (variable, command) {
  return getVariableValues(variable)
    .reduce((accu, value, index) => accu.replaceAll(`$${variable.name}[${index}]`, () => value), command)
}

function getVariableValues (variable) {
  if (Array.isArray(variable.values)) {
    return variable.values.map(value => String(value))
  }
  return String(variable.values ?? '').split('\n')
}

function stripHtml (line) {
  let tempDivElement = document.createElement("div")
  tempDivElement.innerHTML = line
  return tempDivElement.textContent || tempDivElement.innerText
}
