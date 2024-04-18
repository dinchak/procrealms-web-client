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
        :class="state.modals.helpModal ? 'active' : ''"
        size="24"
        @click="toggleHelp"
      >
        <QuestionMarkOutlined/>
      </n-icon>
      
      <n-icon
        title="Sidebar"
        :class="state.options.showMobileMenu ? 'active' : ''"
        size="24"
        @click="state.options.showMobileMenu = !state.options.showMobileMenu"
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

function toggleHelp () {
  state.modals.helpModal = !state.modals.helpModal
  setMode('modal')
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
  top: 5px;
  right: 10px;
  .interface {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    .n-icon {
      padding: 5px 5px;
      color: #fff;
      cursor: pointer;
      transition: all 0.2s;
      margin-right: 5px;
      border: 1px solid #444;
      &:last-child {
        margin-right: 0;
      }
      &:hover {
        border: 1px solid #0cc6c6;
      }
      &.active {
        border: 1px solid #0cc6c6;
        background-color: #0cc6c6;
        color: #000;
      }
    }
  }
}

</style>