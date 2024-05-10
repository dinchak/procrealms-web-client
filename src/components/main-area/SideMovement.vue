<template>
  <div class="side-movement" v-if="state.options.showSideMovement">
    <MovementControls></MovementControls>
  </div>
</template>

<script setup>
import { state } from '@/static/state'
import MovementControls from '@/components/common/MovementControls.vue'
</script>

<style scoped lang="less">
.side-movement {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-left: 10px;
}
</style>
