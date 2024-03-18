<template>
  <n-layout has-sider
    v-if="state.token && state.connected && !state.disconnected" class="game" 
    :sider-placement="state.options.swapMobileMenuSide ? 'right' : 'left'">
    <MobileMenu v-if="!state.options.swapMobileMenuSide"></MobileMenu>
    <n-layout>
      <LogoutModal></LogoutModal>
      <HelpModal></HelpModal>
      <TriggersModal></TriggersModal>
      <GameModal></GameModal>
      <MercModal></MercModal>

      <ButtonControls></ButtonControls>
      <div class="content-area">
        <LineOutput></LineOutput>
        <div class="side-area" :style="{ height: getSideAreaHeight() }">
          <SideMap v-if="!state.gameState.battle.active"></SideMap>
          <SideAliases></SideAliases>
          <SideMovement v-if="!state.gameState.battle.active"></SideMovement>
        </div>
      </div>
      <QuickSlots v-if="state.options.showQuickSlots && !state.options.showMobileMenu"></QuickSlots>
      <OverworldHUD v-if="!state.gameState.battle.active"></OverworldHUD>
      <KeyboardInput :focus-mode="'input'" :active-modes="['hotkey', 'input']"></KeyboardInput>

    </n-layout>
    <MobileMenu v-if="state.options.swapMobileMenuSide"></MobileMenu>
    <RadialOverlay></RadialOverlay>
  </n-layout>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { state, setMode, showHUD } from '@/composables/state'
import { NLayout } from 'naive-ui'

import ButtonControls from '@/components/main-area/ButtonControls.vue'
import GameModal from '@/components/modals/GameModal.vue'
import HelpModal from '@/components/modals/HelpModal.vue'
import SideAliases from '@/components/main-area/SideAliases.vue'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'
import LineOutput from '@/components/main-area/LineOutput.vue'
import LogoutModal from '@/components/modals/LogoutModal.vue'
import MercModal from '@/components/modals/MercModal.vue'
import QuickSlots from '@/components/hud/QuickSlots.vue'
import OverworldHUD from '@/components/main-area/OverworldHUD.vue'
import RadialOverlay from '@/components/modals/RadialOverlay.vue'
import SideMap from '@/components/main-area/SideMap.vue'
import MobileMenu from '@/components/mobile-menu/MobileMenu.vue'
import SideMovement from '@/components/main-area/SideMovement.vue'
import TriggersModal from "@/components/modals/TriggersModal.vue"

import { useHelpers } from '@/composables/helpers'

const { selectMovementDirection, moveInSelectedDirection } = useHelpers()

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

function getSideAreaHeight () {
  let heightOffset = 84
  if (state.options.showQuickSlots) {
    heightOffset += 50
  }
  if (showHUD()) {
    heightOffset += 140
  }
  return `calc(100vh - ${heightOffset}px)`
}

let watchers = []
onMounted(() => {
  state.inputEmitter.on('openGameModal', openGameModal)
  state.inputEmitter.on('openHelpModal', openHelpModal)
  state.inputEmitter.on('openScore', openScore)
  state.inputEmitter.on('openQuests', openQuests)
  state.inputEmitter.on('openInventory', openInventory)
  state.inputEmitter.on('selectMovementDirection', selectMovementDirection)
  state.inputEmitter.on('moveInSelectedDirection', moveInSelectedDirection)

  watchers.push(watch(state.options, () => {
    localStorage.setItem('options', JSON.stringify(state.options))
    console.log(state.options)
  }))

  watchers.push(watch(() => state.options.textInputAlwaysFocused, () => {
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
  state.inputEmitter.off('selectMovementDirection', selectMovementDirection)
  state.inputEmitter.off('moveInSelectedDirection', moveInSelectedDirection)

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
    flex-direction: row;
    justify-content: space-between;
    .side-area {
      margin-top: 40px;
      padding-top: 2px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      flex: 0 0 auto;
      align-items: flex-end;
    }
  }
}

.n-layout {
  z-index: 1;
}

.n-layout-sider {
  z-index: 2;
}

</style>
