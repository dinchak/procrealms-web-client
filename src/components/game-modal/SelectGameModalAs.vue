<template>
  <div class="select-game-modal-as" v-if="getGameModalAsOptions().length > 1">
    <div class="label">Select character</div>
    <NSelect v-model:value="state.gameModalAs" :options="getGameModalAsOptions()"></NSelect>
  </div>
</template>

<script setup>
import { NSelect } from 'naive-ui'
import { state, getGameModalAsOptions } from '@/composables/state'
</script>

<style lang="less">
.select-game-modal-as {
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  .label {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }
  .n-select {
    max-width: 200px;
  }
}
</style>