<template>
  <div class="minimap">
    <div class="line" v-for="(line, i) in renderMap()" :key="'line-' + i" v-html="line"></div>
  </div>
</template>

<script setup>
import { state } from '@/composables/state'
import { helpers } from '@/composables/helpers'

const { ansiToHtml } = helpers()

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
  font-size: 20px;
  line-height: 20px;
  font-family: 'Inconsolata', monospace;
}
</style>
