<template>
  <div class="bottom-hud" v-if="showHUD()">
    <div class="minimap-container" v-if="state.options.showOverlayMinimap">
      <MiniMap></MiniMap>
    </div>

    <div class="center-hud">
      <HUDRoomInfo v-if="state.options.showRoomInfo"></HUDRoomInfo>
      <HUDAllies v-if="state.options.showAllies"></HUDAllies>
      <HUDAffects v-if="state.options.showAffects"></HUDAffects>
      <HUDQuests v-if="state.options.showQuests"></HUDQuests>
    </div>

    <div class="movement-controls-container" v-if="state.options.hudMovementControls">
      <MovementControls></MovementControls>
    </div>
  </div>
</template>

<script setup>
import { state, showHUD } from '@/composables/state'

import HUDAffects from '@/components/hud/HUDAffects.vue'
import HUDAllies from '@/components/hud/HUDAllies.vue'
import MovementControls from '@/components/common/MovementControls.vue'
import HUDQuests from '@/components/hud/HUDQuests.vue'
import HUDRoomInfo from '@/components/hud/HUDRoomInfo.vue'
import MiniMap from '@/components/common/MiniMap.vue'
</script>

<style scoped lang="less">
.bottom-hud {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 140px;
  width: 100%;
  .minimap-container {
    margin-left: 10px;
    margin-right: 10px;
  }
  .movement-controls-container {
    margin-right: 3px;
    margin-left: 10px;
  }

  .center-hud {
    display: flex;
    flex-direction: row;
    overflow-x: scroll;
    width: 100%;
  }
}

</style>