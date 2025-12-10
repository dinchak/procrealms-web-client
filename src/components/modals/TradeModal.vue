<template>
  <NModal
    v-model:show="state.modals.tradeModal"
    title="Trade Menu"
    @after-enter="onOpenModal"
    @after-leave="onCloseModal"
    class="trade-modal"
    :auto-focus="false"
    :close-on-esc="false"
  >
    <div>
      <div class="modal-body">
        <p class="modal-close-button" @click="onCloseModal()">
          <NIcon size="24">
            <CloseOutlined />
          </NIcon>
        </p>
        <p :class="getModalKeyboardToggleClass()" @click="toggleMiniOutput()">
          <NIcon size="24">
            <KeyboardOutlined />
          </NIcon>
        </p>

        <div>Trade Modal!</div>

        <div v-if="miniOutputEnabled" class="mini-output" ref="mini-output" id="mini-output">
          <div v-for="(line, i) in getRecentOutput()" class="line" v-html-safe="line" :key="`line-${i}`"></div>
        </div>

        <KeyboardInput v-if="miniOutputEnabled" :focus-mode="'modal-input'" :active-modes="['modal', 'modal-input']"></KeyboardInput>
      </div>
    </div>
  </NModal>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { NModal, NIcon } from 'naive-ui'
import { state, prevMode } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWindowHandler } from '@/composables/window_handler'

import CloseOutlined from '@vicons/material/CloseOutlined'
import KeyboardOutlined from '@vicons/material/KeyboardOutlined'

const { setFontSize, setFontFamily } = useWindowHandler()
const { selectNearestElement } = useHelpers()

const miniOutputEnabled = ref(false)

let selectedElement = null

function selectModalAction (degree) {
  selectedElement = selectNearestElement(selectedElement, degree)
  if (selectedElement) {
    selectedElement.focus()
  }
}

function performModalAction () {
  if (selectedElement) {
    selectedElement.click()
  }
}

function onOpenModal () {
  setFontSize(state.options.fontSize)
  setFontFamily(state.options.fontFamily)
  scrollDown()
}

function onCloseModal () {
  if (!state.modals.tradeModal) {
    return
  }

  state.modals.tradeModal = false

  if (state.mode == 'modal-input') {
    prevMode()
  }

  prevMode()
}

function getModalKeyboardToggleClass () {
  return {
    'modal-keyboard-toggle': true,
    'active': miniOutputEnabled.value
  }
}

function toggleMiniOutput () {
  miniOutputEnabled.value = !miniOutputEnabled.value
  nextTick(() => {
    scrollDown()
  })
}

function getRecentOutput () {
  return state.output.slice(-100)
}

function scrollDown () {
  nextTick(() => {
    let output = document.getElementById('mini-output')
    if (output) {
      output.scrollTop = output.scrollHeight
    }
  })
}

function onOutputChanged () {
  let el = document.getElementById('mini-output')
  if (!el) {
    return
  }

  let { scrollTop, scrollHeight, offsetHeight } = el

  let scrollPosition = Math.round(scrollTop + offsetHeight + 5)
  let scrolledBack = scrollPosition <= scrollHeight

  if (scrolledBack) {
    return
  }

  scrollDown()
}

let watchers = []
onMounted(() => {
  state.inputEmitter.on('closeModal', onCloseModal)
  state.inputEmitter.on('selectModalAction', selectModalAction)
  state.inputEmitter.on('performModalAction', performModalAction)

  watchers.push(
    watch(state.output, () => onOutputChanged())
  )

  watchers.push(
    watch(state.gameState.charmies, () => {
      if (!state.gameState.charmies[state.playerModalAs]) {
        state.playerModalAs = ''
      }
    })
  )

  setFontSize(state.options.fontSize)
  setFontFamily(state.options.fontFamily)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', onCloseModal)
  state.inputEmitter.off('selectModalAction', selectModalAction)
  state.inputEmitter.off('performModalAction', performModalAction)

  watchers.forEach(w => w())
})

</script>
<style lang="less">
.trade-modal {
  min-height: 100vh;
  width: 100vw;
  background: #18181b;
  padding-bottom: 0px;

  .modal-body {
    position: relative;
    padding: 10px;

    .modal-turn-indicator {
      position: absolute;
      top: 14px;
      right: 95px;
      z-index: 10;
    }

    .mini-output {
      height: 200px;
      overflow-y: scroll;
      padding: 10px 10px 0 10px;
      margin: 0 8px 10px 8px;
      background-color: rgb(16, 16, 20);
      .line {
        font-size: 16px;
        line-height: 14px;
        color: #fff;
        margin-bottom: 5px;
        white-space: pre-wrap;
        font-weight: normal !important;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>