<template>
  <div class="interface-overlay">
    <div class="interface">
      <n-icon 
        title="Game Menu"
        :class="state.modals.gameModal ? 'active' : ''"
        size="24"
        @click="toggleGameModal"
      >
        <AssessmentOutlined/>
      </n-icon>

      <n-icon 
        title="Settings"
        :class="state.settingsMode ? 'active' : ''"
        size="24"
        @click="toggleSettings"
      >
        <SettingsFilled />
      </n-icon>

      <n-icon
        title="Help"
        :class="state.options.showTabs ? 'active' : ''"
        size="24"
        @click="toggleTabs"
      >
        <QuestionMarkOutlined/>
      </n-icon>
      
      <n-icon
        title="Sidebar"
        :class="!state.options.hideSidebar ? 'active' : ''"
        size="24"
        @click="state.options.hideSidebar = !state.options.hideSidebar"
      >
        <MenuOutlined />
      </n-icon>
    </div>

    <HUDSettings v-if="state.settingsMode" />
  </div>
</template>

<script setup>
import { NIcon } from 'naive-ui'

import HUDSettings from '@/components/hud/HUDSettings.vue'

import AssessmentOutlined from '@vicons/material/AssessmentOutlined'
import MenuOutlined from '@vicons/material/MenuOutlined'
import QuestionMarkOutlined from '@vicons/material/QuestionMarkOutlined'
import SettingsFilled from '@vicons/material/SettingsFilled'

import { setMode, state } from '@/composables/state'

function toggleTabs() {
  state.options.showTabs = !state.options.showTabs
}

function toggleSettings () {
  state.settingsMode = !state.settingsMode
}

function toggleGameModal() {
  state.modals.gameModal = !state.modals.gameModal
  setMode('modal')
}

</script>
<style scoped lang="less">
.interface-overlay {
  position: absolute;
  top: 2px;
  right: 5px;
  z-index: 5;
  .interface {
    .n-icon {
      padding: 5px 5px;
      color: #aaa;
      cursor: pointer;
      transition: all 0.2s;
      margin-right: 5px;
      &:last-child {
        margin-right: 0;
      }
      &:hover {
        color: #000;
        background-color: #63e2b7;
      }
      &.active {
        color: #000;
        background-color: #63e2b7
      }
    }
  }
}

</style>