<template>
  <SplashScreen v-if="!state.token || !state.connected"></SplashScreen>

  <LogoutModal></LogoutModal>

  <HelpOverlay></HelpOverlay>

  <n-layout has-sider v-if="state.token && state.connected" class="game">
    <n-layout-sider :collapsed-width="0" :on-update:collapsed="openCloseSider" v-if="!state.options.swapControls" :collapsed="state.options.hideSidebar">
      <div class="stats-area">
        <PlayerStats></PlayerStats>
        <div class="bottom-area">
          <div class="battle-area" v-if="state.gameState.battle.active">
            <BattleControls></BattleControls>
          </div>
          <div class="map-actions">
            <MapActions v-if="!state.gameState.battle.active"></MapActions>
          </div>
          <div class="map-area" v-if="!state.gameState.battle.active">
            <MoveControls></MoveControls>
            <MiniMap></MiniMap>
          </div>
          <QuickStats></QuickStats>
        </div>
      </div>
    </n-layout-sider>

    <n-layout>
      <div class="content-area">
        <LineOutput></LineOutput>
        <BattleStatus v-if="state.gameState.battle.active"></BattleStatus>
        <KeyboardInput></KeyboardInput>
      </div>
    </n-layout>

    <n-layout-sider class="right-side" :collapsed-width="0" :on-update:collapsed="openCloseSider" v-if="state.options.swapControls" :collapsed="state.options.hideSidebar">
      <div class="stats-area">
        <PlayerStats></PlayerStats>
        <div class="bottom-area">
          <div class="battle-area" v-if="state.gameState.battle.active">
            <BattleControls></BattleControls>
          </div>
          <div class="map-actions">
            <MapActions v-if="!state.gameState.battle.active"></MapActions>
          </div>
          <div class="map-area" v-if="!state.gameState.battle.active">
            <MoveControls></MoveControls>
            <MiniMap></MiniMap>
          </div>
          <QuickStats></QuickStats>
        </div>
      </div>
    </n-layout-sider>

</n-layout>
</template>

<script setup>
import { state } from '@/composables/state'

import { NLayout, NLayoutSider } from 'naive-ui'

import BattleStatus from '@/components/BattleStatus.vue'
import LineOutput from '@/components/LineOutput.vue'
import SplashScreen from '@/components/SplashScreen.vue'
import KeyboardInput from '@/components/KeyboardInput.vue'
import LogoutModal from '@/components/LogoutModal.vue'
import MiniMap from '@/components/MiniMap.vue'
import PlayerStats from '@/components/PlayerStats.vue'
import BattleControls from '@/components/BattleControls.vue'
import MoveControls from '@/components/MoveControls.vue'
import QuickStats from '@/components/QuickStats.vue'
import MapActions from '@/components/MapActions.vue'
import HelpOverlay from '@/components/HelpOverlay.vue'

import { useWindowHandler } from '@/composables/window_handler'

const { triggerResize } = useWindowHandler()

function openCloseSider () {
  triggerResize()
}

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
    .map-area {
      align-items: center;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      width: 100%;
    }
  }

  .content-area {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

.n-layout {
  z-index: 2;
}

</style>
