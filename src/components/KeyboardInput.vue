<template>
  <QuickSlots class="show-mobile"></QuickSlots>
  <div class="input-wrapper">
    <div :class="getCaretClass()">></div>
    <input v-model="text" ref="input" @blur="state.mode = 'hotkey'" @focus="state.mode = 'input'" autofocus />
    <QuickSlots class="show-desktop"></QuickSlots>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import { useKeyHandler } from '@/composables/key_handler'
import { useWebSocket } from '@/composables/web_socket'

import QuickSlots from '@/components/QuickSlots.vue'

import { state } from '@/composables/state'

let input = ref(null)
let text = ref('')
let commandBuffer = ''
let historyIndex = -1
let commandHistory = []

const { onKeydown } = useKeyHandler()

const { cmd } = useWebSocket()

function getCaretClass () {
  let cls = 'caret'
  if (state.mode == 'input') {
    cls += ' active'
  }
  return cls
}

onKeydown((ev) => {
  if (ev.key == 'Enter' && state.mode == 'hotkey') {
    input.value.focus()
    return
  }

  if (ev.key == 'Escape' && state.mode == 'input') {
    input.value.blur()
    return
  }

  if (ev.key == 'ArrowUp' && state.mode == 'input' && !state.options.movementDuringInput) {
    if (!commandHistory.length || historyIndex == commandHistory.length - 1) {
      return
    }

    if (historyIndex == -1) {
      commandBuffer = text.value
    }

    historyIndex++
    text.value = commandHistory[historyIndex]
  }

  if (ev.key == 'ArrowDown' && state.mode == 'input' && !state.options.movementDuringInput) {
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

  if (ev.key == 'Enter' && state.mode == 'input') {
    if (!text.value) {
      return
    }

    commandHistory.unshift(text.value)
    cmd(text.value)
    text.value = ''
    return
  }
})

</script>

<style scoped lang="less">
.input-wrapper {
  display: flex;
  flex-direction: row;
  font-size: 20px;
  height: 40px;
  padding-left: 15px;
  padding-bottom: 5px;
  align-items: center;

  .caret {
    color: #444;
    margin-right: 15px;
    &.active {
      color: #f8ff25
    }
  }

  input {
    background-color: #222;
    border: 0;
    width: 100%;
    border-radius: 2px;
    padding: 0px 5px;
    height: 25px;

    &:focus-visible {
      border: 0;
      box-shadow: 0 0 5px #f8ff25;
      background-color: #222;
      outline: 1px solid #f8ff25;
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
  .input-wrapper {
    input {
      width: ~"calc(100% - 45px)";
    }
  }
}
</style>
