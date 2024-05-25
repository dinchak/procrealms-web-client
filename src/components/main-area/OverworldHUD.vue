<template>
  <div class="bottom-hud" v-if="showHUD()" :style="{ height: getHUDHeight() + 'px' }">
    <div class="center-hud">
      <MiniMap v-if="state.options.showMinimap" />
      <HUDRoomInfo class="hud-item" v-if="state.options.showRoomInfo" />
      <HUDEffects :affects="state.gameState.affects" class="hud-item" v-if="state.options.showEffects" />
      <HUDQuests class="hud-item" v-if="state.options.showQuests" />
    </div>
  </div>
</template>

<script setup>
import { state, showHUD, getHUDHeight } from '@/static/state'

import HUDEffects from '@/components/hud/HUDEffects.vue'
import HUDQuests from '@/components/hud/HUDQuests.vue'
import HUDRoomInfo from '@/components/hud/HUDRoomInfo.vue'
import MiniMap from '@/components/common/MiniMap.vue'
</script>

<style scoped lang="less">
.bottom-hud {
  display: flex;
  padding-top: 5px;
  border-top: 1px solid #181818;
  background-color: rgb(16, 18, 22);
}

.movement-controls-container {
  margin-right: 3px;
  margin-left: 10px;
}

.center-hud {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.hud-item {
  overflow-y: auto;
  flex-grow: 1;
  flex-basis: 0;
}

</style>