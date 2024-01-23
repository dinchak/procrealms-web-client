<template>
  <n-layout has-sider
    v-if="state.token && state.connected && !state.disconnected" class="game" 
    :sider-placement="state.options.swapControls ? 'right' : 'left'">
    <SideMenu v-if="!state.options.swapControls"></SideMenu>
    <n-layout>
      <LogoutModal></LogoutModal>
      <HelpModal></HelpModal>
      <TriggersModal></TriggersModal>
      <GameModal></GameModal>
      <MapModal></MapModal>
      <MercModal></MercModal>
      <ButtonControls></ButtonControls>
      <div class="content-area">
        <LineOutput></LineOutput>
      </div>
      <QuickSlots v-if="state.options.showQuickSlots"></QuickSlots>
      <OverworldHUD v-if="!state.gameState.battle.active"></OverworldHUD>
      <KeyboardInput :focus-mode="'input'" :active-modes="['hotkey', 'input']"></KeyboardInput>

    </n-layout>
    <SideMenu v-if="state.options.swapControls"></SideMenu>
    <RadialOverlay></RadialOverlay>
  </n-layout>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { state, setMode } from '@/composables/state'
import { NLayout } from 'naive-ui'

import ButtonControls from '@/components/main-area/ButtonControls.vue'
import GameModal from '@/components/modals/GameModal.vue'
import HelpModal from '@/components/modals/HelpModal.vue'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'
import LineOutput from '@/components/main-area/LineOutput.vue'
import LogoutModal from '@/components/modals/LogoutModal.vue'
import MapModal from '@/components/modals/MapModal'
import MercModal from '@/components/modals/MercModal'
import QuickSlots from '@/components/main-area/QuickSlots.vue'
import OverworldHUD from '@/components/main-area/OverworldHUD.vue'
import RadialOverlay from '@/components/modals/RadialOverlay.vue'
import SideMenu from '@/components/side-menu/SideMenu'
import TriggersModal from "@/components/modals/TriggersModal.vue"

function openGameModal () {
  setMode('modal')
  state.modals.gameModal = true
}

function openScore () {
  setMode('modal')
  state.modals.gameModal = true
  state.gamepadTab = "score"
}

function openInventory () {
  setMode('modal')
  state.modals.gameModal = true
  state.gamepadTab = "inventory"
}

function openQuests () {
  setMode('modal')
  state.modals.gameModal = true
  state.gamepadTab = "quests"
}

function openHelpModal () {
  setMode('modal')
  state.modals.helpModal = true
}

let watchers = []
onMounted(() => {
  state.inputEmitter.on('openGameModal', openGameModal)
  state.inputEmitter.on('openHelpModal', openHelpModal)
  state.inputEmitter.on('openScore', openScore)
  state.inputEmitter.on('openQuests', openQuests)
  state.inputEmitter.on('openInventory', openInventory)

  watchers.push(watch(state.options, () => localStorage.setItem('options', JSON.stringify(state.options))))
  watchers.push(watch(state.options.textInputAlwaysFocused, () => {
    if (state.options.textInputAlwaysFocused) {
      state.inputEmitter.emit('focusTextInput')
    }
  }))
})

onBeforeUnmount(() => {
  state.inputEmitter.off('openGameModal', openGameModal)
  state.inputEmitter.off('openInventory', openInventory)
  state.inputEmitter.off('openScore', openScore)
  state.inputEmitter.off('openHelpModal', openHelpModal)
  state.inputEmitter.off('openQuests', openQuests)

  watchers.forEach(w => w())
})
</script>

<style lang="less">
.game {
  background-color: #181818;
  height: 100vh;
  .stats-area {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    .bottom-area {
      border-top: 1px solid rgba(255, 255, 255, 0.09);
    }
    .map-area {
      align-items: center;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      width: 100%;

      .map-icon {
        font-size: 1.9rem;
        text-align: left;
        cursor: pointer;
      }
    }
  }

  .content-area {
    flex-basis: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
    min-height: 0;
  }
}

.n-layout {
  z-index: 1;
}

.n-layout-sider {
  z-index: 2;
}

</style>
