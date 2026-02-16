<template>
  <NModal
    v-model:show="showModal"
    :title="title"
    @after-enter="onOpenModal"
    @after-leave="onCloseModal"
    :class="['game-modal', modalClass]"
    :auto-focus="false"
    :close-on-esc="false"
  >
    <div>
      <div class="modal-body">
        <div class="modal-turn-indicator">
          <MyTurnIndicator v-if="state.gameState.battle.myTurn" />
        </div>

        <p class="modal-close-button" @click="onCloseModal()">
          <NIcon size="24">
            <CloseOutlined />
          </NIcon>
        </p>
        <p v-if="props.showMiniOutput" :class="getModalKeyboardToggleClass()" @click="toggleMiniOutput()">
          <NIcon size="24">
            <KeyboardOutlined />
          </NIcon>
        </p>

        <div v-if="miniOutputEnabled" class="mini-output" ref="mini-output" id="mini-output">
          <div v-for="(line, i) in getRecentOutput()" class="line" v-html-safe="line" :key="`line-${i}`"></div>
        </div>

        <KeyboardInput v-if="miniOutputEnabled" :focus-mode="'modal-input'" :active-modes="['modal', 'modal-input']" :style="{ marginBottom: '10px' }"></KeyboardInput>

        <slot :mini-output-enabled="miniOutputEnabled"></slot>

      </div>
    </div>
  </NModal>
</template>

<script setup>
import { ref, nextTick, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { NModal, NIcon } from 'naive-ui'
import { state, prevMode } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWindowHandler } from '@/composables/window_handler'

import CloseOutlined from '@vicons/material/CloseOutlined'
import KeyboardOutlined from '@vicons/material/KeyboardOutlined'
import MyTurnIndicator from '@/components/battle/MyTurnIndicator.vue'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  modalClass: {
    type: String,
    default: ''
  },
  modalKey: {
    type: String,
    required: true
  },
  hasTabNavigation: {
    type: Boolean,
    default: false
  },
  showMiniOutput: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'opened', 'closed', 'prevTab', 'nextTab'])

const { setFontSize, setFontFamily } = useWindowHandler()
const { selectNearestElement } = useHelpers()

const miniOutputEnabled = ref(false)

let selectedElement = null
let watchers = []
let modalHandlersBound = false

const showModal = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

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

function prevModalTab () {
  emit('prevTab')
}

function nextModalTab () {
  emit('nextTab')
}

function onOpenModal () {
  if (modalHandlersBound) {
    return
  }
  modalHandlersBound = true

  state.inputEmitter.on('closeModal', onCloseModal)
  state.inputEmitter.on('selectModalAction', selectModalAction)
  state.inputEmitter.on('performModalAction', performModalAction)

  if (props.hasTabNavigation) {
    state.inputEmitter.on('prevModalTab', prevModalTab)
    state.inputEmitter.on('nextModalTab', nextModalTab)
  }

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

  // setFontSize(state.options.fontSize)
  // setFontFamily(state.options.fontFamily)
  setFontSize(state.options.fontSize)
  setFontFamily(state.options.fontFamily)
  scrollDown()
  emit('opened')
}

function onCloseModal () {
  if (!showModal.value) {
    return
  }

  showModal.value = false

  if (state.mode == 'modal-input') {
    prevMode()
  }

  prevMode()

  state.inputEmitter.off('closeModal', onCloseModal)
  state.inputEmitter.off('selectModalAction', selectModalAction)
  state.inputEmitter.off('performModalAction', performModalAction)

  if (props.hasTabNavigation) {
    state.inputEmitter.off('prevModalTab', prevModalTab)
    state.inputEmitter.off('nextModalTab', nextModalTab)
  }

  modalHandlersBound = false

  watchers.forEach(w => w())
  watchers = []

  emit('closed')
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

onMounted(() => {
  if (showModal.value) {
    onOpenModal()
  }
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', onCloseModal)
  state.inputEmitter.off('selectModalAction', selectModalAction)
  state.inputEmitter.off('performModalAction', performModalAction)

  if (props.hasTabNavigation) {
    state.inputEmitter.off('prevModalTab', prevModalTab)
    state.inputEmitter.off('nextModalTab', nextModalTab)
  }

  modalHandlersBound = false
  watchers.forEach(w => w())
  watchers = []
})
</script>

<style lang="less">
.game-modal {
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
      right: 85px;
      z-index: 10;
    }

    .mini-output {
      height: 200px;
      overflow-y: scroll;
      padding: 10px 10px 0 10px;
      margin: 40px 8px 10px 8px;
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
