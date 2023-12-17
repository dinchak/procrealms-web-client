<template>
  <div class="mobile-input-controls">
    <n-button size="small" @click="state.inputEmitter.emit('prevCommand')">Prev</n-button>
    <n-button size="small" @click="state.inputEmitter.emit('nextCommand')">Next</n-button>
    <n-button size="small" @click="state.inputEmitter.emit('sendCommand')">Send</n-button>
  </div>
</template>

<script setup>
import { NButton } from 'naive-ui'
import { state } from '@/composables/state'
</script>

<style scoped lang="less">
.mobile-input-controls {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 120px;
  margin-right: 8px;
  .n-button {
    margin-top: 18px;
  }
}
</style>