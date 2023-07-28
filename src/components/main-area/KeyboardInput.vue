<template>
  <div class="input-wrapper">
    <div :class="getMenuButtonClass()" v-if="!state.options.swapControls" @click="state.options.hideSidebar = !state.options.hideSidebar">
      <n-icon><MenuOutlined></MenuOutlined></n-icon>
    </div>

    <input v-model="text" ref="input" @blur="onBlur" @focus="onFocus" autofocus :placeholder="getPlaceholder()" :class="state.activeTab" />

    <div :class="getHistoryClass()">
      <n-button size="small" @click="prevCommand">Prev</n-button>
      <n-button size="small" @click="nextCommand">Next</n-button>
      <n-button size="small" @click="sendCommand">Send</n-button>
    </div>

    <div :class="getMenuButtonClass()" v-if="state.options.swapControls" @click="state.options.hideSidebar = !state.options.hideSidebar">
      <n-icon><MenuOutlined></MenuOutlined></n-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

import { NButton, NIcon } from 'naive-ui'

import MenuOutlined from '@vicons/material/MenuOutlined'

import { useKeyHandler } from '@/composables/key_handler'
import { useWebSocket } from '@/composables/web_socket'

import { state, addLine } from '@/composables/state'

let input = ref(null)
let text = ref('')
let commandBuffer = ''
let historyIndex = -1
let commandHistory = []

const { onKeydown, keyState } = useKeyHandler()

const { cmd } = useWebSocket()

function getMenuButtonClass () {
  let cls = 'menu-button'
  if (!state.options.hideSidebar) {
    cls += ' active'
  }
  if (state.options.swapControls) {
    cls += ' right'
  }
  return cls
}

function getHistoryClass () {
  if (state.options.commandHistoryButton) {
    return 'history show-history'
  }
  return 'history'
}

function onFocus () {
  state.mode = 'input'
}

function onBlur () {
  state.mode = 'hotkey'  
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

onKeydown((ev) => {
  if (keyState.alt || keyState.ctrl) {
    return false
  }

  if (ev.key == 'Enter' && state.mode == 'hotkey') {
    input.value.focus()
    return true
  }

  if (ev.code == 'Escape' && state.mode == 'input') {
    input.value.blur()
    return true
  }

  if (ev.code == 'ArrowUp') {
    prevCommand()
    return true
  }

  if (ev.code == 'ArrowDown') {
    nextCommand()
    return true
  }

  if (ev.key == 'Enter' && state.mode == 'input') {
    if (!input.value.value) {
      input.value.blur()
      return true
    }
    sendCommand()
    return true
  }

  if (ev.key == '?' && state.mode == 'hotkey') {
    state.showHelp = true
    return true
  }

  if (ev.code == 'PageUp') {
    let activeTabElement = document.getElementById(state.activeTab)
    activeTabElement.scrollTo(0, activeTabElement.scrollTop - activeTabElement.clientHeight * 9 / 10)
    return true
  }

  if (ev.code == 'PageDown') {
    let activeTabElement = document.getElementById(state.activeTab)
    activeTabElement.scrollTo(0, activeTabElement.scrollTop + activeTabElement.clientHeight * 9 / 10)
    return true
  }

  if (ev.code == 'End') {
    let activeTabElement = document.getElementById(state.activeTab)
    if (activeTabElement) {
      activeTabElement.scrollTo(0, activeTabElement.scrollHeight)
    }
    return true
  }

  if (state.mode == 'hotkey') {
    const { slots } = state.gameState
    let slot = slots.find(s => s.slot == ev.key)
    if (slot) {
      cmd(slot.slot)
      return true
    }
  }

  if (process.env.NODE_ENV != 'production') {
    if (ev.key == '`') {
      let json = JSON.stringify(state.gameState, null, 2)
      let lines = json.split('\n')
      for (let line of lines) {
        addLine(line, 'output')
      }
      return true
    }
  }

  return false
})

watch(state.options, () => localStorage.setItem('options', JSON.stringify(state.options)))

</script>

<style scoped lang="less">
.input-wrapper {
  display: flex;
  flex-direction: row;
  font-size: 14px;
  margin-top: 7px;
  // height: 40px;
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
    width: ~"calc(100% - 60px)";
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
