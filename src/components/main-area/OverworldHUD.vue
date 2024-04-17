<template>
  <div class="bottom-hud" v-if="showHUD()">
    <div class="center-hud">
      <MiniMap v-if="state.options.showMinimap"></MiniMap>
      <HUDRoomInfo v-if="state.options.showRoomInfo"></HUDRoomInfo>
      <HUDAffects v-if="state.options.showAffects"></HUDAffects>
      <HUDQuests v-if="state.options.showQuests"></HUDQuests>
    </div>

    <!-- <div class="movement-controls-container" v-if="state.options.showMovementControls">
      <MovementControls></MovementControls>
    </div> -->
  </div>
</template>

<script setup>
import { state, showHUD } from '@/composables/state'

import HUDAffects from '@/components/hud/HUDAffects.vue'
// import MovementControls from '@/components/common/MovementControls.vue'
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
  width: calc(100% - 20px);
  padding-left: 10px;
  padding-right: 10px;

  .movement-controls-container {
    margin-right: 3px;
    margin-left: 10px;
  }

  .center-hud {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    overflow-x: scroll;
    width: 100%;
    padding-top: 3px;
    border-top: 1px solid #333;
  }
}

</style>