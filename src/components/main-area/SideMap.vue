<template>
  <div class="side-map" v-if="state.options.showSideMap">
    <div class="map-container">
      <div 
        class="ansi"
        v-for="(line, id) in state.gameState.sidemap"
        :key="id"
        v-html-safe="ansiToHtml(line)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { useHelpers } from '@/composables/helpers'
import { state } from '@/composables/state'

const { ansiToHtml } = useHelpers()
</script>

<style scoped lang="less">
.side-map {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: auto;
  margin-right: 8px;
  .map-container {
    padding-top: 5px;
    .ansi {
      white-space: pre;
      font-size: 1rem;
      line-height: 0.9rem;
    }
  }

}
</style>
