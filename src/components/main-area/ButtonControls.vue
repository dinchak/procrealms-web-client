<template>
  <div class="interface-overlay">
    <div class="interface">
      <NIcon
          title="Settings"
          :class="state.settingsMode ? 'active' : ''"
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

      <NIcon
          title="Sidebar"
          :class="state.options.showMobileMenu ? 'active' : ''"
          size="24"
          @click="state.options.showMobileMenu = !state.options.showMobileMenu"
      >
        <MenuOutlined/>
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
    <SettingsOverlay v-if="state.settingsMode"/>
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
  state.settingsMode = !state.settingsMode
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
  z-index: 2;
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media screen and (max-width: 650px) {
    .game.swap-mobile-menu & {
      flex-direction: column-reverse;
      top: auto;
      bottom: 5px;
    }
  }
  @media screen and (min-width: 651px) {
    .game.swap-mobile-menu & {
      right: 272px + 5px;
    }
  }
}

.interface {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 5px;

  @media screen and (max-width: 650px) {
    flex-direction: column-reverse;
    .game.swap-mobile-menu & {
      flex-direction: column;
    }
  }

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

.game-modal-shortcuts {
  position: absolute;
  flex-basis: 0;
  flex-grow: 0;
  right: 0;
  top: 30px + 10px; // Offset from ButtonControls
  display: flex;
  gap: 5px;
  flex-direction: column;

  .game.swap-mobile-menu & {
    flex-direction: column;
  }
  @media screen and (max-width: 650px) {
    position: static;
    .game.swap-mobile-menu & {
      flex-direction: column-reverse;
    }
  }

  .shortcut {
    padding: 5px;
    cursor: pointer;
    height: 24px;
    width: 24px;
    user-select: none;
    border: 1px solid rgba(255, 255, 255, 0.24);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    background: rgb(16, 16, 20);

    &:last-child {
      margin-right: 0;
    }

    &:hover {
      border: 1px solid #0cc6c6;
    }

    .icon {
      width: 24px;
      height: 24px;
    }
  }
}
</style>