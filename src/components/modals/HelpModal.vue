<template>
  <n-modal
    v-model:show="state.modals.helpModal"
    title="Help"
    @after-leave="closeModal"
    class="help-modal"
  >
    <n-card>
      <p class="close" @click="closeModal()">✕</p>

      <NTabs type="card">
        <NTabPane name="index" tab="Index">
          Index
        </NTabPane>
        <NTabPane name="topics" tab="Topics">
          Topics
        </NTabPane>
        <NTabPane name="commands" tab="Commands">
          Commands
        </NTabPane>
      </NTabs>


    </n-card>

  </n-modal>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { NModal, NCard, NTabs, NTabPane } from 'naive-ui'

import { state, prevMode } from '@/composables/state'

import { useWebSocket } from '@/composables/web_socket'

const { send } = useWebSocket()

function closeModal () {
  if (!state.modals.helpModal) {
    return
  }
  state.modals.helpModal = false
  prevMode()
}

function loadHelpTopics () {
  send('help', { cmd: 'topics'})
}

onMounted(() => {
  state.inputEmitter.on('closeModal', closeModal)
  loadHelpTopics()
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', closeModal)
})

</script>

<style lang="less">
.slide {
  display: flex;
  flex-direction: row;
  .caption {
    margin: 0 20px;
  }
}

.help-modal {
  height: 100vh;
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
      background-color: #e88080;
      color: #000;
    }
  }
}

</style>