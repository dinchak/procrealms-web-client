<template>
  <n-layout-sider id="bottom-left" :collapsed-width="0" :on-update:collapsed="openCloseSider" :collapsed="!state.options.showMobileMenu">
    <div class="stats-area">
      <PlayerStats></PlayerStats>
      <div class="bottom-area" >
        <div class="quick-slots" v-show="state.options.showQuickSlots">
          <QuickSlots :layout-mode="'mobile'"></QuickSlots>
        </div>
        <div class="battle-area" v-show="state.gameState.battle.active">
          <BattleControls></BattleControls>
        </div>
        <div class="map-actions">
          <MapActions v-show="!state.gameState.battle.active"></MapActions>
        </div>
        <div class="map-area" v-show="!state.gameState.battle.active">
          <MoveControls></MoveControls>
          <MiniMap v-if="state.options.showMobileMenuMap"></MiniMap>
        </div>
        <div class="mini-stats">
          <MiniStats :entity="state.gameState.player"></MiniStats>
        </div>
      </div>
    </div>
  </n-layout-sider>
</template>

<script setup>
import { state } from '@/composables/state'
import { NLayoutSider } from 'naive-ui'

import MiniMap from '@/components/common/MiniMap.vue'
import PlayerStats from '@/components/mobile-menu/PlayerStats.vue'
import BattleControls from '@/components/mobile-menu/BattleControls.vue'
import MoveControls from '@/components/mobile-menu/MoveControls.vue'
import MapActions from '@/components/mobile-menu/MapActions.vue'
import MiniStats from '@/components/mobile-menu/MiniStats.vue'
import QuickSlots from '@/components/hud/QuickSlots.vue'

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

.mini-stats {
  margin-top: 10px;
}
</style>
