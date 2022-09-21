<template>
  <div class="minimap">
    <div class="line" v-for="(line, i) in renderMap()" :key="'line-' + i" v-html="line"></div>
  </div>
</template>

<script setup>
import { ansiSpan } from 'ansi-to-span'
import { state } from '@/composables/state'

function renderMap () {
  const map = []
  if (state.gameState.map) {
    for (let line of state.gameState.map) {
      map.push(ansiSpan(line))
    }
  }
  return map
}
</script>

<style lang="less">
.minimap {
  user-select: none;
  white-space: pre;
  font-size: 22px;
  line-height: 18px;
}
</style>
