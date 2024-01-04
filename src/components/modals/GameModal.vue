<template>
  <NModal
    v-model:show="state.modals.gameModal"
    title="Game Menu"
    @after-enter="onOpenModal"
    @after-leave="onCloseModal"
    class="game-modal"
  >

    <div>
      <div class="modal-body">
        <p class="close" @click="closeModal()">✕</p>

        <NTabs
          v-model:value="currentPane"
          class="game-modal-tabs"
          type="card"
          tab-style="min-width: 80px;"
          ref="tabs"
        >
          <NTabPane name="score" tab="Score"><ScorePane></ScorePane></NTabPane>
          <NTabPane name="skills" tab="Skills"><SkillsPane></SkillsPane></NTabPane>
          <NTabPane name="quests" tab="Quests"><QuestsPane></QuestsPane></NTabPane>
          <NTabPane name="inventory" tab="Inventory"><InventoryPane></InventoryPane></NTabPane>
          <NTabPane name="equipment" tab="Equipment"><EquipmentPane></EquipmentPane></NTabPane>
          <NTabPane name="options" tab="Options"><OptionsPane></OptionsPane></NTabPane>

        </NTabs>

        <div class="mini-output" ref="mini-output" id="mini-output">
          <div v-for="(line, i) in getRecentOutput()" class="line" v-html-safe="line" :key="`line-${i}`"></div>
        </div>

        <KeyboardInput focus-mode="modal-input"></KeyboardInput>
      </div>
    </div>
  </NModal>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { NModal, NTabs, NTabPane } from 'naive-ui'
import { state, prevMode } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'

import EquipmentPane from '@/components/game-modal/EquipmentPane.vue'
import InventoryPane from '@/components/game-modal/InventoryPane.vue'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'
import OptionsPane from '@/components/game-modal/OptionsPane.vue'
import QuestsPane from '@/components/game-modal/QuestsPane.vue'
import ScorePane from '@/components/game-modal/ScorePane.vue'
import SkillsPane from '@/components/game-modal/SkillsPane.vue'

const { selectNearestElement } = useHelpers()

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

const tabs = ref(null)
const currentPane = ref("score")
const panes = ref(['score', 'skills', 'quests', 'inventory', 'equipment', 'options'])

function onCloseModal () {
  closeModal()
}

function onOpenModal () {
  currentPane.value = state.gamepadTab || "score"
  scrollDown()
}

function closeModal () {
  if (!state.modals.gameModal) {
    return
  }
  state.modals.gameModal = false
  if (state.mode == 'modal-input') {
    prevMode()
  }
  prevMode()
}

function prevModalTab () {
  let index = panes.value.indexOf(currentPane.value)
  if (index == 0) {
    currentPane.value = panes.value[panes.value.length - 1]
  } else {
    currentPane.value = panes.value[index - 1]
  }
  state.gamepadTab = currentPane.value
  nextTick(() => tabs.value?.syncBarPosition())
}

function nextModalTab () {
  let index = panes.value.indexOf(currentPane.value)
  if (index == panes.value.length - 1) {
    currentPane.value = panes.value[0]
  } else {
    currentPane.value = panes.value[index + 1]
  }
  state.gamepadTab = currentPane.value
  nextTick(() => tabs.value?.syncBarPosition())
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
  state.inputEmitter.on('closeModal', closeModal)
  state.inputEmitter.on('prevModalTab', prevModalTab)
  state.inputEmitter.on('nextModalTab', nextModalTab)
  state.inputEmitter.on('selectModalAction', selectModalAction)
  state.inputEmitter.on('performModalAction', performModalAction)

  watchers.push(
    watch(state.output, () => onOutputChanged())
  )
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', closeModal)
  state.inputEmitter.off('prevModalTab', prevModalTab)
  state.inputEmitter.off('nextModalTab', nextModalTab)
  state.inputEmitter.off('selectModalAction', selectModalAction)
  state.inputEmitter.off('performModalAction', performModalAction)

  watchers.forEach(w => w())
})
</script>

<style lang="less">

.game-modal {
  min-height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 1);
  padding-bottom: 0px;

  .modal-body {
    position: relative;
    padding: 10px;
    .game-modal-tabs {
      .n-tabs-nav {
        width: calc(100vw - 70px);
      }
      height: calc(100vh - 170px);
      overflow-y: hidden;
    }

    .mini-output {
      height: 100px;
      overflow-y: scroll;
      padding: 10px 10px 0 10px;
      margin-bottom: 10px;
      background-color: #000;
      border-top: 1px solid rgba(255, 255, 255, 0.09);
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

    .close {
      margin: 0;
      padding: 10px;
      background-color: #111;
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 32px;
      z-index: 2;
      line-height: 16px;
      cursor: pointer;
      &:hover {
        background-color: #311;
      }
    }
  }
}
</style>