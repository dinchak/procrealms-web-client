<template>
  <div class="settings-actions-container">
    <NButton class="settings-button selectable" type="warning" @click="openHelpModal()" ghost>Help</NButton>
    <NButton class="settings-button selectable" color="#39b1ff" @click="openInputMappingModal()" ghost>Input Mapping</NButton>
    <NButton class="settings-button selectable" color="#ff9f39" @click="openTriggersModal()" ghost>Triggers</NButton>
    <NButton class="settings-button selectable" color="#c65ffe" @click="toggleFullscreen()" :ghost="!state.isFullscreen">Full Screen</NButton>
    <NButton class="settings-button selectable" type="info" @click="triggerImport()" ghost>Import Settings</NButton>
    <NButton class="settings-button selectable" type="primary" @click="exportOptions()" ghost>Export Settings</NButton>
    <NButton class="settings-button selectable" color="#d7f27d" @click="showMoreOptions()" ghost>Show More Options</NButton>
    <NButton class="settings-button selectable" type="error" @click="openLogoutModal()" ghost>Logout</NButton>
    <input ref="fileInput" type="file" accept="application/json" style="display:none" @change="onFileSelected" />
</div>
</template>
<script setup>
import { ref } from 'vue'
import { state, setMode } from '@/static/state'
import { NButton } from 'naive-ui'

import { useLocalStorageHandler } from '@/composables/local_storage_handler'

const { exportOptions, importOptions } = useLocalStorageHandler()
const fileInput = ref(null)

function openTriggersModal () {
  setMode('modal')
  state.modals.triggersModal = true
}

function openInputMappingModal () {
  setMode('modal')
  state.modals.inputMappingModal = true
}

function openHelpModal () {
  setMode('modal')
  state.modals.helpModal = true
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

function showMoreOptions () {
  state.showMoreOptions = !state.showMoreOptions
}

function triggerImport () {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

async function onFileSelected (event) {
  const files = event.target.files || event.dataTransfer?.files
  if (!files || files.length === 0) {
    return
  }
  const file = files[0]
  const text = await file.text()
  importOptions(text)
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