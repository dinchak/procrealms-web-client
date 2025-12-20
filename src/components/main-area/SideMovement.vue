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
  position: absolute;
  bottom: 50px;
  right: 15px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
</style>
