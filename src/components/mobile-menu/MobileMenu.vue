<template>
  <n-el tag="aside" class="sidebar" :class="{
    'hide': !state.options.showMobileMenu,
    'right-side': state.options.swapMobileMenuSide,
    'map-area-visible': (state.options.showMobileMenuMoveControls || state.options.showMobileMenuMap)
  }" style="background-color: var(--table-color)">
  <div class="sidebar-inner">
    <PlayerStats/>
    <div class="bottom-area">
      <div class="quick-slots">
        <QuickSlots :is-mobile-menu="true"/>
      </div>
      <div class="map-area"
           v-show="!state.gameState.battle.active && (state.options.showMobileMenuMoveControls || state.options.showMobileMenuMap)">
        <MovementControls is-mobile-menu="true" v-if="state.options.showMobileMenuMoveControls" />
        <MiniMap v-if="state.options.showMobileMenuMap" />
      </div>
      <div class="mini-stats">
        <MiniStats :entity="state.gameState.player" />
      </div>
    </div>
  </div>
  </n-el>
</template>

<script setup>
import { state } from '@/static/state'
import { NEl } from 'naive-ui'

import MiniMap from '@/components/common/MiniMap.vue'
import PlayerStats from '@/components/mobile-menu/PlayerStats.vue'
import MiniStats from '@/components/mobile-menu/MiniStats.vue'
import QuickSlots from '@/components/hud/QuickSlots.vue'
import { onMounted } from 'vue'
import MovementControls from '@/components/common/MovementControls.vue'
</script>

<style scoped lang="less">
.sidebar {
  box-sizing: border-box;
  transition: transform 0.2s, opacity 0.5s;
  opacity: 1;
  min-width: 272px; // original width of n-layout sider
  width: 272px;
  padding: 10px;
  flex: 0 0 auto;

  &.hide {
    transition: transform 0s, opacity 0s;
    overflow: hidden;
    transform: translate(-70px, 0);
    opacity: 0.5;
    width: 0;
    min-width: 0;
    padding: 0;
    flex: 0 1 0;

    &.right-side {
      transform: translate(70px, 0);
    }
  }

  @media screen and (max-width: 650px) {
    min-width: auto;
    width: auto;
    min-height: 220px;
    height: 40%;
    padding-right: 34px + 10px + 10px;

    &.hide {
      transform: translate(0, -70px);
      height: 0;
      min-height: 0;

      &.right-side {
        transform: translate(0, 70px);
      }
    }
  }

}
.sidebar-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  @media screen and (max-width: 650px) {
    overflow-y: auto;
  }
  @media screen and (min-width: 651px) and (max-height: 575px) {
      overflow-y: auto;
  }
  @media screen and (min-width: 651px) and (max-height: 745px) {
    .sidebar.map-area-visible & {
      overflow-y: auto;
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
