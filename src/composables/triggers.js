import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'

const { cmd } = useWebSocket()

const assignmentPattern = '^([a-zA-Z][a-zA-Z0-9]{1,50}) = (.+)$';
const listValuePattern = '^{(.*)}$';

export function loadSettingsByNameAndType(settings, name, settingsType) {
  let privateSettings = loadSettingsByStorageKey(settingsType + '-' + name.toLowerCase())
  let sharedSettings = loadSettingsByStorageKey(settingsType)

  let privateKeys = [...privateSettings.keys()]
  let sharedKeys = [...sharedSettings.keys()]
  let clashingKeys = privateKeys.filter(key => sharedKeys.includes(key))
  clashingKeys.forEach(key => {
    let triggerToGiveNewKey = privateSettings.get(key)
    let newKey = Math.max(getNextKey(privateSettings), getNextKey(sharedSettings))
    privateSettings.set(newKey, triggerToGiveNewKey)
  })

  if (clashingKeys.length) {
    storeSettingsOfType(settings.value, settingsType)
  }

  settings.value = new Map([...privateSettings, ...sharedSettings])
}

function loadSettingsByStorageKey(key) {
  try {
    return new Map(JSON.parse(localStorage.getItem(key)))
  } catch (err) {
    localStorage.setItem(key, '[]')
  }
}

export function getNextKey(settings) {
  let idsAsNumbers = [...settings.keys()].map(k => Number(k))
  return 1 + (settings.size ? Math.max(...idsAsNumbers) : 0)
}

export function storeSettingsOfType(settings, settingsType) {
  let settingsEntries = Array.from(settings.value.entries())
  let privateSettings = settingsEntries.filter(entry => !entry[1].shared)
  let sharedSettings = settingsEntries.filter(entry => entry[1].shared)
  localStorage.setItem(settingsType + '-' + state.name.toLowerCase(), JSON.stringify(privateSettings))
  localStorage.setItem(settingsType, JSON.stringify(sharedSettings))
}

export function processTriggers(line) {
  if (line) {
    [...state.triggers.value.values()]
        .filter(trigger => trigger.active && trigger.pattern && trigger.commands)
        .forEach(trigger => processTrigger(trigger, stripHtml(line)))
  }
}

function processTrigger(trigger, line) {
  let matches = line.match(trigger.pattern)
  if (matches) {
    trigger.commands
        .split('\n')
        .filter(command => command)
        .forEach(command => processCommand(command, matches, trigger.shared))
  }
}

function processCommand(command, matches, isTriggerShared) {
  let assignmentParts = command.match(assignmentPattern)
  if (assignmentParts) {
    assignValueToVariable(assignmentParts, isTriggerShared)
  } else {
    executeCommand(matches, command);
  }
}

function assignValueToVariable(assignmentParts, isTriggerShared) {

  let valueParts = assignmentParts[2].match(listValuePattern)
  let values = valueParts ? valueParts[1].split(',') : assignmentParts[2]

  let existingVariableKey = [...state.variables.value.entries()]
      .filter(variableEntry => variableEntry[1].name === assignmentParts[1])
      .map(variableEntry => variableEntry[0])
      .find(() => true)

  if (existingVariableKey) {
    state.variables.value.get(existingVariableKey).values = values
  } else {
    let key = getNextKey(state.variables.value) + ''
    state.variables.value.set(key, { name: assignmentParts[1], values, shared: isTriggerShared })
  }

  storeSettingsOfType(state.variables, 'variables')
  window.onstorage({ key: 'variables' })
}

function executeCommand(matches, command) {
  let commandWithMatches = substitutePatternMatches(matches, command)
  let commandWithMatchesAndVariables = substituteVariables(commandWithMatches)
  cmd(commandWithMatchesAndVariables, null, true)
}

function substitutePatternMatches(matches, command) {
  return matches.reduce((accu, match, index) => accu.replaceAll('$' + index, match), command)
}

function substituteVariables(command) {
  return [...state.variables.value.values()]
      .reduce((accu, variable) => {
        return substituteValuesByIndex(variable, accu)
            .replaceAll('$' + variable.name, variable.values.split('\n')[0])
      }, command)
}

function substituteValuesByIndex(variable, command) {
  return variable.values
      .split('\n')
      .reduce((accu, value, index) => accu.replaceAll(`$${variable.name}[${index}]`, value), command)
}

function stripHtml(line) {
  let tempDivElement = document.createElement("div")
  tempDivElement.innerHTML = line
  return tempDivElement.textContent || tempDivElement.innerText
}
