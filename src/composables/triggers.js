import {state} from '@/composables/state'
import {useWebSocket} from '@/composables/web_socket'

const { cmd } = useWebSocket()

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
  let commandWithMatches = matches.reduce((accu, match, index) => accu.replace('$' + index, match), command);
  cmd(commandWithMatches, null, true)
}

function stripHtml(line) {
  let tempDivElement = document.createElement("div");
  tempDivElement.innerHTML = line;
  return tempDivElement.textContent || tempDivElement.innerText
}
