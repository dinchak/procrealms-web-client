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
          <div class="map-area" v-show="!state.gameState.battle.active" v-if="state.options.showMapArea">
            <MoveControls></MoveControls>
            <n-icon class="map-icon" v-on:click="toggleMap()"><MapOutlined /></n-icon>
            <MiniMap></MiniMap>
          </div>
          <QuickStats></QuickStats>
        </div>
      </div>
    </n-layout-sider>

    <n-layout>
      <ModalCard></ModalCard>
      <MapModal></MapModal>
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
            <n-icon class="map-icon" v-on:click="toggleMap()"><MapOutlined /></n-icon>
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

import { NLayout, NLayoutSider, NIcon } from 'naive-ui'

import LineOutput from '@/components/main-area/LineOutput.vue'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'
import LogoutModal from '@/components/modals/LogoutModal.vue'
import MiniMap from '@/components/side-menu/MiniMap.vue'
import PlayerStats from '@/components/side-menu/PlayerStats.vue'
import BattleControls from '@/components/side-menu/BattleControls.vue'
import MoveControls from '@/components/side-menu/MoveControls.vue'
import QuickStats from '@/components/side-menu/QuickStats.vue'
import MapActions from '@/components/side-menu/MapActions.vue'
import HelpOverlay from '@/components/HelpOverlay.vue'
import ModalCard from '@/components/modals/ModalCard'
import MapModal from '@/components/modals/MapModal'
import MapOutlined from '@vicons/material/MapOutlined'

import { useWindowHandler } from '@/composables/window_handler'
import { useWebSocket } from '@/composables/web_socket'

const { triggerResize } = useWindowHandler()
const { cmd } = useWebSocket()

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

function toggleMap() {
  if (!state.modals.mapModal) {
    cmd('map', '1001')
  }
  state.modals.mapModal = !state.modals.mapModal
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

      .map-icon {
        font-size: 30px;
        text-align: left;
        cursor: pointer;
      }
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
