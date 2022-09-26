<template>
  <QuickSlots class="show-mobile"></QuickSlots>
  <div class="input-wrapper">
    <div :class="getCaretClass()" v-if="!state.options.swapControls" @click="state.options.hideSidebar = !state.options.hideSidebar">
      <n-icon><MenuOutlined></MenuOutlined></n-icon>
    </div>
    <input v-model="text" ref="input" @blur="onBlur" @focus="onFocus" autofocus />
    <div :class="getHistoryClass()">
      <n-button size="small" @click="prevCommand">Prev</n-button>
      <n-button size="small" @click="nextCommand">Next</n-button>
      <n-button size="small" @click="sendCommand">Send</n-button>
    </div>
    <QuickSlots class="show-desktop"></QuickSlots>
    <div :class="getCaretClass()" v-if="state.options.swapControls" @click="state.options.hideSidebar = !state.options.hideSidebar">
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

import QuickSlots from '@/components/QuickSlots.vue'

import { state } from '@/composables/state'

let input = ref(null)
let text = ref('')
let commandBuffer = ''
let historyIndex = -1
let commandHistory = []

const { onKeydown, keyState } = useKeyHandler()

const { cmd } = useWebSocket()

function getCaretClass () {
  let cls = 'caret'
  if (state.mode == 'input') {
    cls += ' active'
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
  if (!text.value) {
    return
  }

  let command = text.value
  if (state.activeTab != 'output') {
    let firstWord = command.split(' ')[0]
    if (state.activeTab.indexOf(firstWord.toLowerCase()) != 0) {
      command = `${state.activeTab} ${command}`
    }
  }

  commandHistory.unshift(command)
  cmd(command)
  text.value = ''
  historyIndex = -1

  setTimeout(() => {
    let output = document.getElementById(state.activeTab)
    output.scrollTo(0, output.scrollHeight)
  })
}

onKeydown((ev) => {
  if (keyState.alt || keyState.ctrl) {
    return false
  }

  if (ev.key == 'Enter' && state.mode == 'hotkey') {
    input.value.focus()
    return true
  }

  if (ev.key == 'Escape' && state.mode == 'input') {
    input.value.blur()
    return true
  }

  if (ev.key == 'ArrowUp' && state.mode == 'input' && !state.options.movementDuringInput) {
    prevCommand()
    return true
  }

  if (ev.key == 'ArrowDown' && state.mode == 'input' && !state.options.movementDuringInput) {
    nextCommand()
    return true
  }

  if (ev.key == 'Enter' && state.mode == 'input') {
    sendCommand()
    return true
  }

  if (ev.key == '?' && state.mode == 'hotkey') {
    state.showHelp = true
    return true
  }

  if (process.env.NODE_ENV != 'production') {
    if (ev.key == '`') {
      let json = JSON.stringify(state.gameState, null, 2)
      let lines = json.split('\n')
      for (let line of lines) {
        state.output.push(line)
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
  font-size: 20px;
  height: 40px;
  padding-bottom: 5px;
  align-items: center;
  justify-content: space-between;

  .caret {
    color: #fff;
    width: 35px;
    text-align: center;
    background-color: #063603;
    border: 1px solid #16c60c;
    display: flex;
    height: 25px;
    justify-content: center;
    align-items: center;
    margin: 0 5px;
    border-radius: 4px;
    flex-shrink: 0;

    &:hover {
      cursor: pointer;
      background-color: darken(#16c60c, 33%);
    }

    &.active {
      color: #f8ff25
    }
  }

  input {
    background-color: #222;
    border: 0;
    width: ~"calc(100% - 45px)";
    border-radius: 2px;
    padding: 0px 5px;
    margin: 0 5px;
    height: 25px;

    &:focus-visible {
      border: 0;
      box-shadow: 0 0 5px #f8ff25;
      background-color: #222;
      outline: 1px solid #f8ff25;
    }
  }

  .history {
    display: none;
    flex-direction: row;
    margin: 0 5px;
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
