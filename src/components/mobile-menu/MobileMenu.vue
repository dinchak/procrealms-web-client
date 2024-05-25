<template>
  <n-el tag="aside" class="stats-area" :class="{
    'hide': !state.options.showMobileMenu,
    'right-side': state.options.swapMobileMenuSide
  }" style="background-color: var(--table-color)">
    <PlayerStats/>
    <div class="bottom-area">
      <div class="quick-slots">
        <QuickSlots :is-mobile-menu="true"/>
      </div>
      <div class="map-area"
           v-show="!state.gameState.battle.active && (state.options.showMobileMenuMoveControls || state.options.showMobileMenuMap)">
        <MoveControls v-if="state.options.showMobileMenuMoveControls" />
        <MiniMap v-if="state.options.showMobileMenuMap" />
      </div>
      <div class="mini-stats">
        <MiniStats :entity="state.gameState.player" />
      </div>
    </div>
  </n-el>
</template>

<script setup>
import { state } from '@/static/state'
import { NEl } from 'naive-ui'

import MiniMap from '@/components/common/MiniMap.vue'
import PlayerStats from '@/components/mobile-menu/PlayerStats.vue'
import MoveControls from '@/components/mobile-menu/MoveControls.vue'
import MiniStats from '@/components/mobile-menu/MiniStats.vue'
import QuickSlots from '@/components/hud/QuickSlots.vue'
import { onMounted } from 'vue'
</script>

<style scoped lang="less">
.stats-area {
  box-sizing: border-box;
  transition: transform 0.2s, opacity 0.5s;
  opacity: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 272px; // original width of n-layout sider
  width: 272px;
  padding: 10px;

  &.hide {
    transition: transform 0s, opacity 0s;
    overflow: hidden;
    transform: translate(-70px, 0);
    opacity: 0.5;
    width: 0;
    min-width: 0;

    &.right-side {
      transform: translate(70px, 0);
    }
  }
}

.bottom-area {
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
