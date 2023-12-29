<template>
  <div class="input-wrapper">
    <input v-model="text" ref="input" @blur="onBlur" @focus="onFocus" :placeholder="getPlaceholder()" :class="state.activeTab" />
    <MobileInputControls v-if="state.options.hudCommandControls"></MobileInputControls>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useWebSocket } from '@/composables/web_socket'
import { state, addLine, setMode, prevMode } from '@/composables/state'

import MobileInputControls from '@/components/main-area/MobileInputControls.vue'

let input = ref(null)
let text = ref('')
let commandBuffer = ''
let historyIndex = -1
let commandHistory = []

const { cmd } = useWebSocket()

function focusTextInput () {
  input.value.focus()
}

function blurTextInput () {
  input.value.blur()
}

function onFocus () {
  setMode('input')
}

function onBlur () {
  if (state.mode != 'input') {
    state.prevModes = state.prevModes.filter(m => m != 'input')
    return
  }
  prevMode()
}

function prevCommand () {
  if (!commandHistory.length || historyIndex == commandHistory.length - 1) {
    return
  }

  if (historyIndex == -1) {
    commandBuffer = text.value
  }

  historyIndex++
  text.value = commandHistory[historyIndex]
}

function nextCommand () {
  if (historyIndex == -1) {
    return
  }

  historyIndex--

  if (historyIndex == -1) {
    text.value = commandBuffer
  } else {
    text.value = commandHistory[historyIndex]
  }
}

function sendCommand () {
  let command = input.value.value
  if (!command) {
    blurTextInput()
    return
  }

  if (state.activeTab != 'output') {
    let firstWord = command.split(' ')[0]
    if (state.activeTab.indexOf(firstWord.toLowerCase()) != 0) {
      command = `${state.activeTab} ${command}`
    }
  }

  commandHistory.unshift(command)
  command.split(';').forEach(c => cmd(c))

  if (state.options.keepSentCommands) {
    commandBuffer = ''
    input.value.select()
    historyIndex = 0
  } else {
    text.value = ''
    input.value.value = ''
    historyIndex = -1
  }

  setTimeout(() => {
    // TODO replace with scroll down event
    let output = document.getElementById(state.activeTab)
    output.scrollTo(0, output.scrollHeight)
  })
}

function getPlaceholder () {
  if (state.activeTab == 'output') {
    return 'Enter command or help'
  } else {
    return `Send ${state.activeTab} message`
  }
}

function pageUp () {
  let activeTabElement = document.getElementById(state.activeTab)
  activeTabElement.scrollTo(0, activeTabElement.scrollTop - activeTabElement.clientHeight * 9 / 10)
}

function pageDown () {
  let activeTabElement = document.getElementById(state.activeTab)
  activeTabElement.scrollTo(0, activeTabElement.scrollTop + activeTabElement.clientHeight * 9 / 10)
}

function scrollDown () {
  let activeTabElement = document.getElementById(state.activeTab)
  if (activeTabElement) {
    activeTabElement.scrollTo(0, activeTabElement.scrollHeight)
  }
}

function quickSlot1 () {
  let slot = state.gameState.slots.find(s => s.slot == '1')
  if (slot) {
    cmd('1')
  }
}

function quickSlot2 () {
  let slot = state.gameState.slots.find(s => s.slot == '2')
  if (slot) {
    cmd('2')
  }
}

function quickSlot3 () {
  let slot = state.gameState.slots.find(s => s.slot == '3')
  if (slot) {
    cmd('3')
  }
}

function quickSlot4 () {
  let slot = state.gameState.slots.find(s => s.slot == '4')
  if (slot) {
    cmd('4')
  }
}

function quickSlot5 () {
  let slot = state.gameState.slots.find(s => s.slot == '5')
  if (slot) {
    cmd('5')
  }
}

function quickSlot6 () {
  let slot = state.gameState.slots.find(s => s.slot == '6')
  if (slot) {
    cmd('6')
  }
}

function quickSlot7 () {
  let slot = state.gameState.slots.find(s => s.slot == '7')
  if (slot) {
    cmd('7')
  }
}

function quickSlot8 () {
  let slot = state.gameState.slots.find(s => s.slot == '8')
  if (slot) {
    cmd('8')
  }
}

function quickSlot9 () {
  let slot = state.gameState.slots.find(s => s.slot == '9')
  if (slot) {
    cmd('9')
  }
}

function quickSlot0 () {
  let slot = state.gameState.slots.find(s => s.slot == '0')
  if (slot) {
    cmd('0')
  }
}

function quickSlotMinus () {
  let slot = state.gameState.slots.find(s => s.slot == '-')
  if (slot) {
    cmd('-')
  }
}

function quickSlotEquals () {
  let slot = state.gameState.slots.find(s => s.slot == '=')
  if (slot) {
    cmd('=')
  }
}

function showDebug () {
  let json = JSON.stringify(state.gameState.player, null, 2)
  let lines = json.split('\n')
  for (let line of lines) {
    addLine(line, 'output')
  }
}

onMounted(() => {
  state.inputEmitter.on('focusTextInput', focusTextInput)
  state.inputEmitter.on('blurTextInput', blurTextInput)
  state.inputEmitter.on('sendCommand', sendCommand)
  state.inputEmitter.on('prevCommand', prevCommand)
  state.inputEmitter.on('nextCommand', nextCommand)
  state.inputEmitter.on('pageUp', pageUp)
  state.inputEmitter.on('pageDown', pageDown)
  state.inputEmitter.on('scrollDown', scrollDown)
  state.inputEmitter.on('quickSlot1', quickSlot1)
  state.inputEmitter.on('quickSlot2', quickSlot2)
  state.inputEmitter.on('quickSlot3', quickSlot3)
  state.inputEmitter.on('quickSlot4', quickSlot4)
  state.inputEmitter.on('quickSlot5', quickSlot5)
  state.inputEmitter.on('quickSlot6', quickSlot6)
  state.inputEmitter.on('quickSlot7', quickSlot7)
  state.inputEmitter.on('quickSlot8', quickSlot8)
  state.inputEmitter.on('quickSlot9', quickSlot9)
  state.inputEmitter.on('quickSlot0', quickSlot0)
  state.inputEmitter.on('quickSlotMinus', quickSlotMinus)
  state.inputEmitter.on('quickSlotEqual', quickSlotEquals)
  state.inputEmitter.on('showDebug', showDebug)
})

onBeforeUnmount(() => {
  onBlur()
  state.inputEmitter.off('focusTextInput', focusTextInput)
  state.inputEmitter.off('blurTextInput', blurTextInput)
  state.inputEmitter.off('sendCommand', sendCommand)
  state.inputEmitter.off('prevCommand', prevCommand)
  state.inputEmitter.off('nextCommand', nextCommand)
  state.inputEmitter.off('pageUp', pageUp)
  state.inputEmitter.off('pageDown', pageDown)
  state.inputEmitter.off('scrollDown', scrollDown)
  state.inputEmitter.off('quickSlot1', quickSlot1)
  state.inputEmitter.off('quickSlot2', quickSlot2)
  state.inputEmitter.off('quickSlot3', quickSlot3)
  state.inputEmitter.off('quickSlot4', quickSlot4)
  state.inputEmitter.off('quickSlot5', quickSlot5)
  state.inputEmitter.off('quickSlot6', quickSlot6)
  state.inputEmitter.off('quickSlot7', quickSlot7)
  state.inputEmitter.off('quickSlot8', quickSlot8)
  state.inputEmitter.off('quickSlot9', quickSlot9)
  state.inputEmitter.off('quickSlot0', quickSlot0)
  state.inputEmitter.off('quickSlotMinus', quickSlotMinus)
  state.inputEmitter.off('quickSlotEqual', quickSlotEquals)
  state.inputEmitter.off('showDebug', showDebug)
})
</script>

<style scoped lang="less">
.input-wrapper {
  display: flex;
  flex-direction: row;
  font-size: 0.9rem;
  align-items: center;
  justify-content: space-between;

  .menu-button {
    color: #fff;
    background-color: #222;
    border: 1px solid #333;
    width: 35px;
    text-align: center;
    display: flex;
    height: 25px;
    justify-content: center;
    align-items: center;
    margin: 0 0 0 8px;
    border-radius: 4px;
    flex-shrink: 0;
    transition: all 0.3s;

    @media (hover: hover) {
      &:hover {
        cursor: pointer;
        background-color: #063603;
        border: 1px solid #16c60c;
      }
    }

    &.active {
      background-color: #063603;
      border: 1px solid #16c60c;
      color: #f8ff25
    }

    &.right {
      margin: 0 8px 0 0;
    }
  }

  input {
    background-color: #222;
    border: 0;
    width: ~"calc(100% - 20px)";
    border-radius: 4px;
    padding: 1px 10px 0 10px;
    margin: 0 8px 0 8px;
    height: 27px;
    &.output {
      &:focus-visible {
        border: 0;
        box-shadow: 0 0 5px #57edff;
        background-color: #222;
        outline: 1px solid #57edff;
      }
    }
    &.chat {
      &:focus-visible {
        border: 0;
        box-shadow: 0 0 5px #f8ff25;
        background-color: #222;
        outline: 1px solid #f8ff25;
      }
    }
    &.trade {
      &:focus-visible {
        border: 0;
        box-shadow: 0 0 5px #2eff00;
        background-color: #222;
        outline: 1px solid #2eff00;
      }
    }
    &.newbie {
      &:focus-visible {
        border: 0;
        box-shadow: 0 0 5px #ad00ff;
        background-color: #222;
        outline: 1px solid #ad00ff;
      }
    }
  }

  .history {
    display: none;
    flex-direction: row;
    margin-right: 7px;
    .n-button {
      margin-right: 5px;
      &:last-child {
        margin-right: 0px;
      }
    }
    &.show-history {
      display: flex;
    }
  }
}

.show-mobile {
  display: none;
}

@media screen and (max-width: 1000px) {
  .show-desktop {
    display: none;
  }
  .show-mobile {
    display: flex;
  }
}
</style>
