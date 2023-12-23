<template>
  <n-modal
    v-model:show="state.modals.gameModal"
    title="Game Menu"
    @after-leave="closeModal"
    class="game-modal"
  >
    <n-card>
      <p class="close" @click="closeModal()">✕</p>

      <n-tabs
        v-model:value="currentPane"
        type="card"
        tab-style="min-width: 80px;"
        ref="tabs"
      >
        <n-tab-pane
          name="score"
          tab="Score"
        >
          <ScorePane></ScorePane>
        </n-tab-pane>

        <n-tab-pane
          name="skills"
          tab="Skills"
        >
          <div>This is the skills pane</div>
        </n-tab-pane>

      </n-tabs>
    </n-card>
  </n-modal>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { NModal, NTabs, NCard, NTabPane } from 'naive-ui'
import { state, prevMode } from '@/composables/state'

import ScorePane from '@/components/game-modal/ScorePane.vue'

const tabs = ref(null)
const currentPane = ref(state.gamepadTab || "score")

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
  currentPane.value = "skills"
  state.gamepadTab = "skills"
  nextTick(() => tabs.value?.syncBarPosition())
}

onMounted(() => {
  state.inputEmitter.on('closeModal', closeModal)
  state.inputEmitter.on('prevModalTab', prevModalTab)
  state.inputEmitter.on('nextModalTab', nextModalTab)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', closeModal)
  state.inputEmitter.off('prevModalTab', prevModalTab)
  state.inputEmitter.off('nextModalTab', nextModalTab)
})
</script>

<style scoped lang="less">
.game-modal {
  min-height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 1);
  .close {
    margin: 0;
    padding: 10px;
    background-color: #111;
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 32px;
    z-index: 2;
    line-height: 16px;
    cursor: pointer;
    &:hover {
      background-color: #311;
    }
  }
}
</style>