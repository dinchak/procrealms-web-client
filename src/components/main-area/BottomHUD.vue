<template>
  <div class="bottom-hud" v-if="showHUD()" :style="{ height: getHUDHeight() + 'px' }">
    <div class="center-hud">
      <MiniMap v-if="state.options.showMinimap" />
      <HUDRoomInfo class="hud-item" v-if="state.options.showRoomInfo" />
      <HUDEffects :effects="state.gameState.effects" class="hud-item" v-if="state.options.showEffects" />
      <HUDQuests class="hud-item" v-if="state.options.showQuests" />
    </div>
  </div>
</template>

<script setup>
import { getHUDHeight, showHUD, state } from '@/static/state'

import HUDEffects from '@/components/hud/HUDEffects.vue'
import HUDQuests from '@/components/hud/HUDQuests.vue'
import HUDRoomInfo from '@/components/hud/HUDRoomInfo.vue'
import MiniMap from '@/components/common/MiniMap.vue'
</script>

<style scoped lang="less">
.bottom-hud {
  display: flex;
  padding-top: 5px;
  background-color: #18181b;
  overflow-x: auto;

  .center-hud {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
    flex: 1 0 auto;

    .hud-item {
      overflow-y: auto;
      flex-grow: 1;
    }
  }
}
</style>