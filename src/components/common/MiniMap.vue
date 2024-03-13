<template>
  <div class="minimap">
    <div class="line" v-for="(line, i) in renderMinimap()" :key="'line-' + i" v-html-safe="line"></div>
  </div>
</template>

<script setup>
import { state } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml } = useHelpers()

function renderMinimap () {
  const minimap = []
  if (state.gameState.minimap) {
    for (let line of state.gameState.minimap) {
      minimap.push(ansiToHtml(line))
    }
  }

  return minimap
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
