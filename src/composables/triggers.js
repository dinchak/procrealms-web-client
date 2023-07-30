import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'

const { cmd } = useWebSocket()

export function loadTriggers(name) {
  let privateTriggers = loadTriggersByStorageKey('triggers-' + name.toLowerCase())
  let sharedTriggers = loadTriggersByStorageKey('triggers')

  let privateKeys = [...privateTriggers.keys()]
  let sharedKeys = [...sharedTriggers.keys()]
  let clashingKeys = privateKeys.filter(key => sharedKeys.includes(key))
  clashingKeys.forEach(key => {
    let triggerToGiveNewKey = privateTriggers.get(key)
    let newKey = Math.max(getNextKey(privateTriggers), getNextKey(sharedTriggers))
    privateTriggers.set(newKey, triggerToGiveNewKey)
  })

  if (clashingKeys.length) {
    storeTriggers()
  }

  state.triggers.value = new Map([...privateTriggers, ...sharedTriggers])
}

export function getNextKey(triggers = state.triggers.value) {
  let idsAsNumbers = [...triggers.keys()].map(k => Number(k))
  return 1 + (triggers.size ? Math.max(...idsAsNumbers) : 0) + ''
}

function loadTriggersByStorageKey(key) {
  try {
    return new Map(JSON.parse(localStorage.getItem(key)))
  } catch (err) {
    localStorage.setItem(key, '[]')
  }
}

export function storeTriggers() {
  let triggerEntries = Array.from(state.triggers.value.entries())
  let privateTriggers = triggerEntries.filter(entry => !entry[1].shared)
  let sharedTriggers = triggerEntries.filter(entry => entry[1].shared)
  localStorage.setItem('triggers-' + state.name.toLowerCase(), JSON.stringify(privateTriggers))
  localStorage.setItem('triggers', JSON.stringify(sharedTriggers))
}

export function processTriggers(line) {
  if (line) {
    state.triggers.value
        .forEach(trigger => processTrigger(trigger, stripHtml(line)))
  }
}

function processTrigger(trigger, line) {
  if (trigger.active && trigger.pattern && trigger.commands) {
    let matches = line.match(trigger.pattern)
    if (matches) {
      trigger.commands
          .split('\n')
          .filter(command => command)
          .forEach(command => processCommand(matches, command))
    }
  }
}

function processCommand(matches, command) {
  let commandWithMatches = matches.reduce((accu, match, index) => accu.replace('$' + index, match), command)
  cmd(commandWithMatches, null, true)
}

function stripHtml(line) {
  let tempDivElement = document.createElement("div")
  tempDivElement.innerHTML = line
  return tempDivElement.textContent || tempDivElement.innerText
}
