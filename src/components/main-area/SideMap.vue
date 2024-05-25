<template>
  <div class="side-map" v-if="state.options.showSideMap">
    <div class="map-container">
      <div 
        class="map-line"
        v-for="(line, id) in state.gameState.sidemap"
        :key="id"
        v-html-safe="ansiToHtml(line)"
        :style="{ height: state.options.fontSize }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { useHelpers } from '@/composables/helpers'
import { state } from '@/static/state'

const { ansiToHtml } = useHelpers()
</script>

<style scoped lang="less">
.side-map {
  display: flex;
  align-items: flex-end;
  align-self: center;
  flex-direction: column;
  user-select: none;
  .map-container {
    .map-line {
      white-space: pre;
    }
  }

}
</style>
