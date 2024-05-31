<template>
  <NModal
    v-model:show="state.modals.debugModal"
    title="Debug"
    @after-enter="onOpenModal"
    @after-leave="onCloseModal"
    class="debug-modal"
    :auto-focus="false"
    :close-on-esc="false"
  >
    <div>
      <div class="modal-body">
        <p class="close" @click="onCloseModal()">
          <NIcon size="24">
            <CloseOutlined />
          </NIcon>
        </p>

        <NCollapse>
          <NCollapseItem v-for="key in Object.keys(state.gameState)" :key="key" :title="key">
            <pre>{{ state.gameState[key] }}</pre>
          </NCollapseItem>
        </NCollapse>
      </div>
    </div>
  </NModal>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { NModal, NIcon, NCollapse, NCollapseItem } from 'naive-ui'
import { state, prevMode } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWindowHandler } from '@/composables/window_handler'

import CloseOutlined from '@vicons/material/CloseOutlined'

const { selectNearestElement } = useHelpers()
const { setFontSize, setFontFamily } = useWindowHandler()

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
}

function onCloseModal () {
  if (!state.modals.debugModal) {
    return
  }
  state.modals.debugModal = false
  prevMode()
}

onMounted(() => {
  state.inputEmitter.on('closeModal', onCloseModal)
  state.inputEmitter.on('selectModalAction', selectModalAction)
  state.inputEmitter.on('performModalAction', performModalAction)

  setFontSize(state.options.fontSize)
  setFontFamily(state.options.fontFamily)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', onCloseModal)
  state.inputEmitter.off('selectModalAction', selectModalAction)
  state.inputEmitter.off('performModalAction', performModalAction)
})
</script>

<style lang="less">
.debug-modal {
  min-height: 100vh;
  width: 100vw;
  background: rgb(14, 20, 20);
  padding-bottom: 0px;

  .modal-body {
    position: relative;
    padding: 10px;

    .close {
      margin: 0;
      padding: 5px;
      background-color: #111;
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 32px;
      z-index: 2;
      line-height: 16px;
      cursor: pointer;
      &:hover {
        background-color: #e88080;
        color: #000;
      }
    }

  }
}
</style>