<template>
  <div class="side-movement" v-if="state.options.showSideMovement" :style="{ bottom: getBottom() }">
    <MovementControls></MovementControls>
  </div>
</template>

<script setup>
import { state, showHUD } from '@/composables/state'
import MovementControls from '@/components/common/MovementControls.vue'

function getBottom () {
  let bottomOffset = 40
  if (showHUD()) {
    bottomOffset += 140
  }
  if (state.options.showQuickSlots) {
    bottomOffset += 50
  }
  return bottomOffset + 'px'
}
</script>

<style scoped lang="less">
.side-movement {
  position: absolute;
  right: 5px;
  z-index: 4;
}
</style>
