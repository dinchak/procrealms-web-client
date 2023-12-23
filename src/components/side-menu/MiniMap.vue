<template>
  <div class="minimap">
    <div class="line" v-for="(line, i) in renderMap()" :key="'line-' + i" v-html-safe="line"></div>
  </div>
</template>

<script setup>
import { state } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml } = useHelpers()

function renderMap () {
  const map = []
  if (state.gameState.map) {
    for (let line of state.gameState.map) {
      map.push(ansiToHtml(line))
    }
  }
  return map
}
</script>

<style lang="less">
.minimap {
  user-select: none;
  white-space: pre;
  font-size: 19px;
  .line {
    height: 19px;
  }
}
</style>
