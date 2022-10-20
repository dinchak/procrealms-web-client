<template>
  <n-layout-sider id="bottom-left" :collapsed-width="0" :on-update:collapsed="openCloseSider" :collapsed="state.options.hideSidebar">
    <div class="stats-area">
      <PlayerStats></PlayerStats>
      <div class="bottom-area" >
        <div class="battle-area" v-show="state.gameState.battle.active">
          <BattleControls></BattleControls>
        </div>
        <div class="map-actions">
          <MapActions v-show="!state.gameState.battle.active"></MapActions>
        </div>
        <div class="map-area" v-show="!state.gameState.battle.active" v-if="state.options.showMapArea">
          <MoveControls></MoveControls>
          <n-icon class="map-icon" v-on:click="toggleMap()"><MapOutlined /></n-icon>
          <MiniMap></MiniMap>
        </div>
        <QuickStats :entity="state.gameState.player"></QuickStats>
      </div>
    </div>
  </n-layout-sider>
</template>

<script setup>
import { state } from '@/composables/state'
import { NLayoutSider, NIcon } from 'naive-ui'

import MiniMap from '@/components/side-menu/MiniMap.vue'
import PlayerStats from '@/components/side-menu/PlayerStats.vue'
import BattleControls from '@/components/side-menu/BattleControls.vue'
import MoveControls from '@/components/side-menu/MoveControls.vue'
import QuickStats from '@/components/side-menu/QuickStats.vue'
import MapActions from '@/components/side-menu/MapActions.vue'
import MapOutlined from '@vicons/material/MapOutlined'

import { command_ids } from '@/composables/constants/command_ids'
import { useWindowHandler } from '@/composables/window_handler'
import { useWebSocket } from '@/composables/web_socket'

const { triggerResize } = useWindowHandler()
const { cmd } = useWebSocket()

function openCloseSider () {
  triggerResize()
}

function toggleMap() {
  if (!state.modals.mapModal) {
    cmd('map', command_ids.MAP)
  }
  state.modals.mapModal = !state.modals.mapModal
}
</script>