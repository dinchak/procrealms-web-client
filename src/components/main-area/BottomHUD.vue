<template>
  <div class="bottom-hud" v-if="showHUD()">
    <div class="center-hud">
      <MiniMap v-if="state.options.showMinimap" />
      <HUDRoomInfo class="hud-item" v-if="state.options.showRoomInfo" />
      <HUDQuests class="hud-item" v-if="state.options.showQuests" />
      <HUDEffects :effects="state.gameState.effects" class="hud-item" v-if="state.options.showEffects" />
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

:global(.hud-popup-panel) {
  background: rgb(16, 18, 22);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
  left: 0;
  max-height: min(420px, calc(100vh - 24px));
  max-width: calc(100vw - 24px);
  min-width: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  position: fixed;
  top: 0;
  width: min(500px, calc(100vw - 24px));
  z-index: 29;
}

@media screen and (max-width: 420px) {
  :global(.hud-popup-panel) {
    max-height: min(360px, calc(100vh - 16px));
    max-width: 100%;
  }
}
</style>
