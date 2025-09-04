<template>
  <div class="hud-settings-overlay" @click="state.settingsMode = false">
    <div class="hud-settings-container" @click="$event.stopPropagation()">
      <MapResize v-if="state.options.showSideMap" />
      <InterfaceToggles />
      <FontSelector />
      <SettingsActions />
    </div>
  </div>
</template>
<script setup>
import { state } from '@/static/state'

import FontSelector from '@/components/settings/FontSelector.vue'
import MapResize from '@/components/settings/MapResize.vue'
import InterfaceToggles from '@/components/settings/InterfaceToggles.vue'
import SettingsActions from '@/components/settings/SettingsActions.vue'
</script>

<style scoped lang="less">
.hud-settings-overlay {
  position: fixed;
  z-index: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);

  .hud-settings-container {
    z-index: 10;
    position: absolute;
    top: 50px;
    right: 50px;
    z-index: 3;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    padding: 5px;
    gap: 20px;
    background-color: rgb(27 38 45 / 90%);
    border: 1px solid rgb(69 100 119);
    border-radius: 4px;

    @media screen and (max-width: 750px) {
      // top: 0;
      // right: 0;
      left: 50px;
      flex-wrap: wrap;
      gap: 5px;
    }
  }
}

</style>