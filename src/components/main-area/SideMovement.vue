<template>
  <div class="side-movement" v-if="state.options.showSideMovement && !state.gameState.battle.active">
    <MovementControls />
  </div>
</template>

<script setup>
import { state } from '@/static/state'
import MovementControls from '@/components/common/MovementControls.vue'
</script>

<style scoped lang="less">
.side-movement {
  position: fixed;
  bottom: 50px;
  right: 15px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: 5px;
  background-color: #18181b;
  isolation: isolate;
  // Above the main interface (mobile toolbar is 20), below overlays/modals.
  z-index: 25;
}
</style>
