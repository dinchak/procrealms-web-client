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
        <div class="map-area" v-show="!state.gameState.battle.active">
          <MoveControls></MoveControls>
          <MiniMap v-if="state.options.showMapArea"></MiniMap>
        </div>
      </div>
    </div>
  </n-layout-sider>
</template>

<script setup>
import { state } from '@/composables/state'
import { NLayoutSider } from 'naive-ui'

import MiniMap from '@/components/side-menu/MiniMap.vue'
import PlayerStats from '@/components/side-menu/PlayerStats.vue'
import BattleControls from '@/components/side-menu/BattleControls.vue'
import MoveControls from '@/components/side-menu/MoveControls.vue'
import MapActions from '@/components/side-menu/MapActions.vue'

import { useWindowHandler } from '@/composables/window_handler'

const { triggerResize } = useWindowHandler()

function openCloseSider () {
  triggerResize()
}
</script>

<style scoped lang="less">
.bottom-area {
  padding-bottom: 5px;
}

.map-area {
  padding-top: 10px;
  padding-bottom: 10px;
  min-height: 152px;
}
</style>
