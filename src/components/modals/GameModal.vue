<template>
  <n-modal
    v-model:show="state.modals.gameModal"
    title="Game Menu"
    @after-enter="onOpenModal"
    @after-leave="onCloseModal"
    class="game-modal"
  >

    <div>
      <div class="modal-body">
        <p class="close" @click="closeModal()">✕</p>

        <n-tabs
          v-model:value="currentPane"
          class="game-modal-tabs"
          type="card"
          tab-style="min-width: 80px;"
          ref="tabs"
        >
          <n-tab-pane name="score" tab="Score"><ScorePane></ScorePane></n-tab-pane>
          <n-tab-pane name="quests" tab="Quests"><QuestsPane></QuestsPane></n-tab-pane>
          <n-tab-pane name="inventory" tab="Inventory"><InventoryPane></InventoryPane></n-tab-pane>
          <n-tab-pane name="equipment" tab="Equipment"><EquipmentPane></EquipmentPane></n-tab-pane>

        </n-tabs>

        <div class="mini-output" ref="mini-output" id="mini-output">
          <div v-for="(line, i) in getRecentOutput()" class="line" v-html-safe="line" :key="`line-${i}`"></div>
        </div>

        <KeyboardInput></KeyboardInput>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { NModal, NTabs, NTabPane } from 'naive-ui'
import { state, prevMode } from '@/composables/state'

import EquipmentPane from '@/components/game-modal/EquipmentPane.vue'
import InventoryPane from '@/components/game-modal/InventoryPane.vue'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'
import QuestsPane from '@/components/game-modal/QuestsPane.vue'
import ScorePane from '@/components/game-modal/ScorePane.vue'

const tabs = ref(null)
const currentPane = ref("score")

function onCloseModal () {
  closeModal()
}

function onOpenModal () {
  currentPane.value = state.gamepadTab || "score"
}

function closeModal () {
  if (!state.modals.gameModal) {
    return
  }
  state.modals.gameModal = false
  prevMode()
}

function prevModalTab () {
  currentPane.value = "score"
  state.gamepadTab = "score"
  nextTick(() => tabs.value?.syncBarPosition())
}

function nextModalTab () {
  currentPane.value = "quests"
  state.gamepadTab = "quests"
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

  watchers.push(
    watch(state.output, () => onOutputChanged())
  )

  scrollDown()
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', closeModal)
  state.inputEmitter.off('prevModalTab', prevModalTab)
  state.inputEmitter.off('nextModalTab', nextModalTab)

  watchers.forEach(w => w())
})
</script>

<style scoped lang="less">

.game-modal {
  min-height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 1);
  padding-bottom: 0px;

  .modal-body {
    position: relative;
    padding: 10px;
    .game-modal-tabs {
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