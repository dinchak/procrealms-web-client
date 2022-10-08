<template>
  <LogoutModal></LogoutModal>

  <HelpOverlay></HelpOverlay>

  <n-layout has-sider v-if="state.token && state.connected" class="game">
    <n-layout-sider id="bottom-left" :collapsed-width="0" :on-update:collapsed="openCloseSider" v-if="!state.options.swapControls" :collapsed="state.options.hideSidebar">
      <div class="stats-area">
        <PlayerStats></PlayerStats>
        <div class="bottom-area">
          <div class="battle-area" v-show="state.gameState.battle.active">
            <BattleControls></BattleControls>
          </div>
          <div class="map-actions">
            <MapActions v-if="!state.gameState.battle.active"></MapActions>
          </div>
          <div class="map-area" v-show="!state.gameState.battle.active">
            <MoveControls></MoveControls>
            <MiniMap></MiniMap>
          </div>
          <QuickStats></QuickStats>
        </div>
      </div>
    </n-layout-sider>

    <n-layout>
      <ModalCard></ModalCard>
      <div class="content-area">
        <LineOutput></LineOutput>
      </div>
      <KeyboardInput></KeyboardInput>
    </n-layout>

    <n-layout-sider id="bottom-right" class="right-side" :collapsed-width="0" :on-update:collapsed="openCloseSider" v-if="state.options.swapControls" :collapsed="state.options.hideSidebar">
      <div class="stats-area">
        <PlayerStats></PlayerStats>
        <div class="bottom-area" >
          <div class="battle-area" v-show="state.gameState.battle.active">
            <BattleControls></BattleControls>
          </div>
          <div class="map-actions">
            <MapActions v-if="!state.gameState.battle.active"></MapActions>
          </div>
          <div class="map-area" v-show="!state.gameState.battle.active">
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

import LineOutput from '@/components/LineOutput.vue'
import KeyboardInput from '@/components/KeyboardInput.vue'
import LogoutModal from '@/components/LogoutModal.vue'
import MiniMap from '@/components/MiniMap.vue'
import PlayerStats from '@/components/PlayerStats.vue'
import BattleControls from '@/components/BattleControls.vue'
import MoveControls from '@/components/MoveControls.vue'
import QuickStats from '@/components/QuickStats.vue'
import MapActions from '@/components/MapActions.vue'
import HelpOverlay from '@/components/HelpOverlay.vue'
import ModalCard from '@/components/ModalCard'

import { useWindowHandler } from '@/composables/window_handler'

const { triggerResize } = useWindowHandler()

function openCloseSider () {
  triggerResize()
}

try {
  const options = JSON.parse(localStorage.getItem('options'))
  if (options !== null) {
    state.options = Object.assign(state.options, options)
  }
} catch (err) {
  console.log(err)
  localStorage.setItem('options', '')
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
    .bottom-area {
      border-top: 1px solid rgba(255, 255, 255, 0.09);
    }
    .map-area {
      align-items: center;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      width: 100%;
    }
  }

  .content-area {
    // height: ~"calc(100vh - 45px)";
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
