import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'

const { cmd } = useWebSocket()

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
        .map(command => substitutePatternMatches(matches, command))
        .map(command => substituteVariables(command))
        .forEach(command => executeCommand(matches, command))
  }
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

function executeCommand(matches, command) {
  cmd(command, null, true)
}

function stripHtml(line) {
  let tempDivElement = document.createElement("div")
  tempDivElement.innerHTML = line
  return tempDivElement.textContent || tempDivElement.innerText
}
