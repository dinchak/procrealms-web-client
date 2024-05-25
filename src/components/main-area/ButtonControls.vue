<template>
  <div class="interface-overlay">
    <div class="interface">
      <NIcon 
        title="Settings"
        :class="state.settingsMode ? 'active' : ''"
        size="24"
        @click="toggleSettings"
      >
        <SettingsFilled />
      </NIcon>

      <NIcon 
        title="Music Player"
        :class="state.options.showMusicPlayer ? 'active' : ''"
        size="24"
        @click="toggleMusicPlayer"
      >
        <MusicNoteOutlined/>
      </NIcon>

      <NIcon 
        title="Game Menu"
        :class="state.modals.gameModal ? 'active' : ''"
        size="24"
        @click="toggleGameModal"
      >
        <AssessmentOutlined/>
      </NIcon>

      <NIcon
        title="Help"
        :class="state.modals.helpModal ? 'active' : ''"
        size="24"
        @click="toggleHelp"
      >
        <QuestionMarkOutlined/>
      </NIcon>
      
      <NIcon
        title="Sidebar"
        :class="state.options.showMobileMenu ? 'active' : ''"
        size="24"
        @click="state.options.showMobileMenu = !state.options.showMobileMenu"
      >
        <MenuOutlined />
      </NIcon>
    </div>

    <SettingsOverlay v-if="state.settingsMode" />
    <MusicPlayerOverlay v-if="state.options.showMusicPlayer" />
  </div>
</template>

<script setup>
import { NIcon } from 'naive-ui'

import MusicPlayerOverlay from '@/components/settings/MusicPlayerOverlay.vue'
import SettingsOverlay from '@/components/settings/SettingsOverlay.vue'

import AssessmentOutlined from '@vicons/material/AssessmentOutlined'
import MenuOutlined from '@vicons/material/MenuOutlined'
import MusicNoteOutlined from '@vicons/material/MusicNoteOutlined'
import QuestionMarkOutlined from '@vicons/material/QuestionMarkOutlined'
import SettingsFilled from '@vicons/material/SettingsFilled'

import { setMode, state } from '@/static/state'

function toggleMusicPlayer () {
  state.options.showMusicPlayer = !state.options.showMusicPlayer
}

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
  z-index: 2;
  .interface {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 5px;
    .n-icon {
      padding: 5px 5px;
      color: #fff;
      cursor: pointer;
      transition: all 0.2s;
      background: rgb(16, 16, 20);
      border: 1px solid rgba(255, 255, 255, 0.24);
      user-select: none;
      transition: all 0.3s;

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