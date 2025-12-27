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
          title="Game Menu"
          :class="state.modals.playerModal ? 'active' : ''"
          size="24"
          @click="openPlayerModal()"
      >
        <AssessmentOutlined/>
      </NIcon>

      <NIcon
          title="Crafting Menu"
          :class="state.modals.craftingModal ? 'active' : ''"
          size="24"
          @click="openCraftingModal()"
      >
        <ConstructionFilled/>
      </NIcon>

      <!-- <NIcon
          title="Chat Modal"
          :class="state.modals.craftingModal ? 'active' : ''"
          size="24"
          @click="openChatModal()"
      >
        <ChatFilled/>
      </NIcon>

      <NIcon
          title="Auction Modal"
          :class="state.modals.auctionModal ? 'active' : ''"
          size="24"
          @click="openAuctionModal()"
      >
        <GavelFilled/>
      </NIcon> -->

    </div>

    <SettingsOverlay v-if="state.modals.settingsModal"/>
  </div>
</template>

<script setup>
import { NIcon } from 'naive-ui'

import SettingsOverlay from '@/components/settings/SettingsOverlay.vue'

import AssessmentOutlined from '@vicons/material/AssessmentOutlined'
import ChatFilled from '@vicons/material/ChatFilled'
import ConstructionFilled from '@vicons/material/ConstructionFilled'
import GavelFilled from '@vicons/material/GavelFilled'
import MenuOutlined from '@vicons/material/MenuOutlined'
import SettingsFilled from '@vicons/material/SettingsFilled'

import { setMode, state } from '@/static/state'

function toggleSettings () {
  state.modals.settingsModal = !state.modals.settingsModal
  setMode('modal')
}

function openPlayerModal (pane = null) {
  if (pane) {
    state.gamepadTab = pane
  }
  state.modals.playerModal = true
  setMode('modal')
}

function openCraftingModal () {
  state.modals.craftingModal = true
  setMode('modal')
}

function openChatModal () {
  state.modals.chatModal = true
  setMode('modal')
}

function openAuctionModal () {
  state.modals.auctionModal = true
  setMode('modal')
}

</script>
<style scoped lang="less">
.interface-overlay {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  margin-top: 10px;
  overflow-y: scroll;
}

.interface {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-left: 10px;
  gap: 5px;

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
  margin-top: 5px;

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