<template>
  <div class="interface-overlay">
    <div class="interface">
      <NIcon
          title="Sidebar"
          :class="state.options.showMobileMenu ? 'active' : ''"
          size="24"
          @click="state.options.showMobileMenu = !state.options.showMobileMenu"
      >
        <MenuOutlined/>
      </NIcon>

      <NIcon
          title="Settings"
          :class="state.modals.settingsModal ? 'active' : ''"
          size="24"
          @click="toggleSettings"
      >
        <SettingsFilled/>
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
          v-if="!state.options.showGameModalShortcuts"
          title="Game Menu"
          :class="state.modals.gameModal ? 'active' : ''"
          size="24"
          @click="openGameModal()"
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
    </div>

    <div class="game-modal-shortcuts" v-if="state.options.showGameModalShortcuts">
      <div class="shortcut" @click="openGameModal('score')">
        <div class="icon">
          <img src="@/assets/icons/character.svg">
        </div>
      </div>

      <div class="shortcut" @click="openGameModal('skills')">
        <div class="icon">
          <img src="@/assets/icons/skills.svg">
        </div>
      </div>

      <div class="shortcut" @click="openGameModal('quests')">
        <div class="icon">
          <img src="@/assets/icons/trophy.svg">
        </div>
      </div>

      <div class="shortcut" @click="openGameModal('inventory')">
        <div class="icon">
          <img src="@/assets/icons/backpack.svg">
        </div>
      </div>

      <div class="shortcut" @click="openGameModal('equipment')">
        <div class="icon">
          <img src="@/assets/icons/battle-gear.svg">
        </div>
      </div>

      <div class="shortcut" @click="openGameModal('options')">
        <div class="icon">
          <img src="@/assets/icons/toggles.svg">
        </div>
      </div>

    </div>
    <SettingsOverlay v-if="state.modals.settingsModal"/>
    <MusicPlayerOverlay v-if="state.options.showMusicPlayer"/>
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
  state.modals.settingsModal = !state.modals.settingsModal
  setMode('modal')
}

function openGameModal (pane = null) {
  if (pane) {
    state.gamepadTab = pane
  }
  state.modals.gameModal = true
  setMode('modal')
}

</script>
<style scoped lang="less">
.interface-overlay {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 10px;
  overflow-y: scroll;
}

.interface {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 5px;
  margin-left: 10px;

  .n-icon {
    padding: 5px 5px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
    background: #18181b;
    border: 1px solid #18181b;
    user-select: none;
    transition: all 0.3s;
    border-radius: 4px;

    &:hover {
      border: 1px solid rgb(69 100 119);
      background-color: rgb(27 38 45 / 90%);
    }

    &.active {
      border: 1px solid rgb(69 100 119);
      background-color: rgb(27 38 45 / 90%);
      color: #fff;
    }
  }
}

.game-modal-shortcuts {
  flex-basis: 0;
  flex-grow: 0;
  right: 0;
  display: flex;
  gap: 5px;
  flex-direction: column;
  margin-left: 10px;

  .game.swap-mobile-menu & {
    flex-direction: column;
  }

  .shortcut {
    padding: 5px;
    cursor: pointer;
    height: 24px;
    width: 24px;
    user-select: none;
    border: 1px solid #18181b;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    background: #18181b;
    border-radius: 4px;

    &:last-child {
      margin-right: 0;
    }

    &:hover {
      border: 1px solid rgb(69 100 119);
      background-color: rgb(27 38 45 / 90%);
    }

    .icon {
      width: 24px;
      height: 24px;
    }
  }
}
</style>