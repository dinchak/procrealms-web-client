<template>
  <div class="bottom-hud" v-if="showHUD()" :style="{ height: getHUDHeight() + 'px' }">
    <div class="center-hud" :style="{ height: getHUDHeight() }">
      <MiniMap v-if="state.options.showMinimap"></MiniMap>
      <HUDRoomInfo v-if="state.options.showRoomInfo"></HUDRoomInfo>
      <HUDEffects v-if="state.options.showEffects"></HUDEffects>
      <HUDQuests v-if="state.options.showQuests"></HUDQuests>
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
  flex-direction: row;
  justify-content: space-between;
  width: calc(100% - 20px);
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  border-top: 1px solid #181818;
  background-color: rgb(16, 18, 22);

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
  }
}

</style>