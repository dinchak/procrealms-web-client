<template>
  <div class="hud-settings-container">
    <MapResize></MapResize>
    <InterfaceToggles></InterfaceToggles>
    <FontSelector></FontSelector>
    <SettingsActions></SettingsActions>
  </div>
</template>
<script setup>

import FontSelector from '@/components/settings/FontSelector.vue'
import MapResize from '@/components/settings/MapResize.vue'
import InterfaceToggles from '@/components/settings/InterfaceToggles.vue'
import SettingsActions from '@/components/settings/SettingsActions.vue'

</script>

<style scoped lang="less">
.hud-settings-container {
  position: absolute;
  top: 36px;
  right: 0px;
  z-index: 3;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  flex-wrap: nowrap;
  padding-left: 8px;
  padding-bottom: 3px;
  padding-top: 3px;
  gap: 20px;
  background-color: rgba(0, 0, 0, 0.9);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.9);
}

@media screen and (max-width: 700px) {
  .hud-settings-container {
    flex-wrap: wrap;
    gap: 5px;
  }
}
</style>