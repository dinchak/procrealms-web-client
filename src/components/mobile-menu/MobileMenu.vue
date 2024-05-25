<template>
  <n-el tag="aside" class="stats-area" :class="{
    'hide': !state.options.showMobileMenu,
    'right-side': state.options.swapMobileMenuSide
  }">
    <PlayerStats/>
    <div class="bottom-area">
      <div class="quick-slots">
        <QuickSlots :is-mobile-menu="true"/>
      </div>
      <div class="map-area"
           v-show="!state.gameState.battle.active && (state.options.showMobileMenuMoveControls || state.options.showMobileMenuMap)">
        <MoveControls v-if="state.options.showMobileMenuMoveControls"></MoveControls>
        <MiniMap v-if="state.options.showMobileMenuMap"></MiniMap>
      </div>
      <div class="mini-stats">
        <MiniStats :entity="state.gameState.player"></MiniStats>
      </div>
    </div>
  </n-el>
</template>

<script setup>
import { state } from '@/static/state'
import { useThemeVars } from 'naive-ui'

import MiniMap from '@/components/common/MiniMap.vue'
import PlayerStats from '@/components/mobile-menu/PlayerStats.vue'
import MoveControls from '@/components/mobile-menu/MoveControls.vue'
import MiniStats from '@/components/mobile-menu/MiniStats.vue'
import QuickSlots from '@/components/hud/QuickSlots.vue'

import { useWindowHandler } from '@/composables/window_handler'

const { triggerResize } = useWindowHandler()

function openCloseSider () {
  triggerResize()
}
</script>

<style scoped lang="less">
.stats-area {
  transition: margin-right 0.2s, margin-left 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 272px; // original width of n-layout sider
  width: 272px;
  margin-right: 0;
  margin-left: 0;
  padding-top: 10px;

  &.hide {
    margin-left: -272px;
    &.right-side {
      margin-left: 0;
      margin-right: -272px;
    }
  }
}

.bottom-area {
  align-self: flex-end;
  padding-bottom: 5px;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
}

.map-area {
  padding-top: 10px;
  padding-bottom: 10px;
  min-height: 152px;
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

.mini-stats {
  margin-top: 10px;
}
</style>
