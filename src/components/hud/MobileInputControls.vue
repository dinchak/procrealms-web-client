<template>
  <div class="mobile-input-controls">
    <n-button size="small" @click="state.inputEmitter.emit('prevCommand')">Prev</n-button>
    <n-button size="small" @click="state.inputEmitter.emit('nextCommand')">Next</n-button>
    <n-button size="small" @click="state.inputEmitter.emit('sendCommand')">Send</n-button>
  </div>
</template>

<script setup>
import { NButton } from 'naive-ui'
import { state } from '@/static/state'
</script>

<style scoped lang="less">
.mobile-input-controls {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  .n-button {
    margin-right: 8px;
  }
}
</style>