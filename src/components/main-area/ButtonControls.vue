<template>
  <div class="interface-overlay">
    <n-icon 
      v-if="state.options.overlayControls"
      :class="state.modals.gameModal ? 'active' : ''"
      size="24"
      @click="toggleSettings"
    >
      <SettingsFilled />
    </n-icon>

    <n-icon 
      v-if="state.options.overlayControls"
      :class="state.modals.mapModal ? 'active' : ''"
      size="24"
      @click="toggleMap()"
    >
      <MapOutlined />
    </n-icon>
    
    <n-icon
      :class="!state.options.hideSidebar ? 'active' : ''"
      size="24"
      @click="state.options.hideSidebar = !state.options.hideSidebar"
    >
      <MenuOutlined />
    </n-icon>
  </div>
</template>

<script setup>
import { NIcon } from 'naive-ui'

import MapOutlined from '@vicons/material/MapOutlined'
import MenuOutlined from '@vicons/material/MenuOutlined'
import SettingsFilled from '@vicons/material/SettingsFilled'

import { setMode, state } from '@/composables/state'

function toggleMap() {
  state.modals.mapModal = !state.modals.mapModal
}

function toggleSettings() {
  state.modals.gameModal = !state.modals.gameModal
  setMode('modal')
}

</script>
<style scoped lang="less">
.interface-overlay {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 1;
  .n-icon {
    padding: 5px 5px;
    color: #aaa;
    cursor: pointer;
    &:hover {
      color: #fff;
      background-color: darken(#16c60c, 33%);
    }
    &.active {
      color: #f9f1a5;
      background-color: darken(#16c60c, 33%);
    }
  }
}

</style>