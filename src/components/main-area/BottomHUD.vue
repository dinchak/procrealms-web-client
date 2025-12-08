<template>
  <div class="bottom-hud" v-if="showHUD()">
    <div class="center-hud">
      <MiniMap v-if="state.options.showMinimap" />
      <HUDRoomInfo class="hud-item" v-if="state.options.showRoomInfo" />
      <HUDEffects :effects="state.gameState.effects" class="hud-item" v-if="state.options.showEffects" />
      <HUDQuests class="hud-item" v-if="state.options.showQuests" />
      <HUDChat class="hud-item" v-if="state.options.showChat" />
    </div>
  </div>
</template>

<script setup>
import { showHUD, state } from '@/static/state'

import HUDChat from '@/components/hud/HUDChat.vue'
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
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
    flex: 1 0 auto;
    max-height: 130px;

    .hud-item {
      overflow-y: auto;
      flex-grow: 1;
    }
  }
}
</style>