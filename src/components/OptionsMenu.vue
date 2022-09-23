<template>
  <div class="options-menu">

    <n-switch v-model:value="state.options.movementDuringInput">
      <template #checked>
        Enable Movement During Input
      </template>
      <template #unchecked>
        Enable Command History
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.fixedMap">
      <template #checked>
        Fixed Minimap
      </template>
      <template #unchecked>
        Scrolling Minimap
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.commandHistoryButton">
      <template #checked>
        Show Mobile Buttons
      </template>
      <template #unchecked>
        Hide Mobile Buttons
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.swapControls">
      <template #checked>
        Menu On Right
      </template>
      <template #unchecked>
        Menu On Left
      </template>
    </n-switch>

    <n-button type="success" @click="goFullscreen()" ghost>Full Screen</n-button>
    <n-button type="warning" @click="state.showHelp = !state.showHelp" ghost>Help</n-button>
    <n-button type="error" @click="state.showLogout = true" ghost>Logout</n-button>
  </div>
</template>

<script setup>
import { NSwitch, NButton } from 'naive-ui'

import { state } from '@/composables/state'

function goFullscreen () {
  let app = document.getElementById('app')
  app.requestFullscreen()
}

</script>

<style lang="less">
.options-menu {
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  .n-switch, .n-button {
    margin-bottom: 15px;
  }
}

</style>
