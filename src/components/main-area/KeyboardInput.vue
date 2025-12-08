<template>
  <div class="input-wrapper">
    <form @submit.prevent="onSubmit">
      <input v-model="text" ref="input" @blur="onBlur" @focus="onFocus" :placeholder="getPlaceholder()" class="output" />
    </form>
    <MobileInputControls v-if="state.options.textInputMobileButtons" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps, toRefs } from 'vue'
import { useWebSocket } from '@/composables/web_socket'
import { state, setMode, prevMode } from '@/static/state'

import MobileInputControls from '@/components/hud/MobileInputControls.vue'

let input = ref(null)
let text = ref('')
let commandBuffer = ''
let historyIndex = -1
let commandHistory = []

const props = defineProps({
  focusMode: {
    type: String,
    default: 'input'
  },
  activeModes: {
    type: Array,
    default: () => []
  }
})

const { focusMode, activeModes } = toRefs(props)

const { runCommand } = useWebSocket()

function focusTextInput () {
  if (activeModes.value.includes(state.mode)) {
    input.value.focus()
  }
}

function blurTextInput () {
  if (state.options.textInputAlwaysFocused) {
    return
  }

  if (activeModes.value.includes(state.mode)) {
    input.value.blur()
  }
}

function onFocus () {
  setMode(focusMode.value)
}

function onBlur () {
  if (state.options.textInputAlwaysFocused) {
    if (activeModes.value.includes(state.mode)) {
      input.value.focus()
    }
    return
  }

  if (state.mode != focusMode.value) {
    state.prevModes = state.prevModes.filter(m => m != focusMode.value)
    return
  }
  prevMode()
}

function prevCommand () {
  if (!activeModes.value.includes(state.mode)) {
    return
  }

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
  if (!activeModes.value.includes(state.mode)) {
    return
  }

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

function onSubmit () {
  sendCommand()
}

function sendCommand () {
  if (!activeModes.value.includes(state.mode)) {
    return
  }

  let command = input.value.value

  if (!command) {
    blurTextInput()
    return
  }

  if (focusMode.value == 'modal-input') {
    if (state.gameModalAs) {
      command = `order eid:${state.gameModalAs} ${command}`
    }
  }

  commandHistory.unshift(command)
  command.split(';').forEach(c => runCommand(c))

  if (state.options.keepSentCommands) {
    commandBuffer = ''
    input.value.select()
    historyIndex = 0
  } else {
    text.value = ''
    input.value.value = ''
    historyIndex = -1
  }

  if (state.options.unfocusInputOnCommand) {
    blurTextInput()
  }

  setTimeout(() => {
    // TODO replace with scroll down event
    let output = document.getElementById('output')
    output.scrollTo(0, output.scrollHeight)
  })
}

function getPlaceholder () {
  return 'Enter command or help'
}

onMounted(() => {
  state.inputEmitter.on('focusTextInput', focusTextInput)
  state.inputEmitter.on('blurTextInput', blurTextInput)
  state.inputEmitter.on('sendCommand', sendCommand)
  state.inputEmitter.on('prevCommand', prevCommand)
  state.inputEmitter.on('nextCommand', nextCommand)

  if (state.options.textInputAlwaysFocused) {
    if (activeModes.value.includes(state.mode)) {
      state.inputEmitter.emit('focusTextInput')
    }
  }
})

onBeforeUnmount(() => {
  onBlur()
  state.inputEmitter.off('focusTextInput', focusTextInput)
  state.inputEmitter.off('blurTextInput', blurTextInput)
  state.inputEmitter.off('sendCommand', sendCommand)
  state.inputEmitter.off('prevCommand', prevCommand)
  state.inputEmitter.off('nextCommand', nextCommand)
})
</script>

<style scoped lang="less">
.input-wrapper {
  display: flex;
  flex-direction: row;
  font-size: 0.9rem;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background-color: #18181b;
  min-height: 28px;

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

  form {
    display: flex;
    flex-grow: 1;
    input {
      background-color: #222;
      border: 0;
      flex-basis: 0;
      border-radius: 4px;
      padding: 1px 10px 0 10px;
      height: 27px;
      flex-grow: 1;
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
