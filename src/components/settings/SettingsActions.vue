<template>
  <div class="settings-actions-container">
    <NButton class="settings-button selectable" type="info" @click="openTriggersModal()" ghost>Triggers</NButton>
    <NButton class="settings-button selectable" type="success" @click="toggleFullscreen()" :ghost="!state.isFullscreen">Full Screen</NButton>
    <NButton class="settings-button selectable" type="error" @click="openLogoutModal()" ghost>Logout</NButton>
  </div>
</template>
<script setup>
import { state, setMode } from '@/static/state'

import { NButton } from 'naive-ui'

function openTriggersModal () {
  setMode('modal')
  state.modals.triggersModal = true
}

function openLogoutModal () {
  setMode('modal')
  state.modals.logoutModal = true
}

function toggleFullscreen () {
  if (state.isFullscreen) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

</script>
<style lang="less" scoped>
.settings-actions-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  .settings-button {
    margin-bottom: 5px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>