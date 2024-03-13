<template>
  <div class="minimap-container">
    <div class="minimap">
      <div class="line" v-for="(line, i) in renderMinimap()" :key="'line-' + i" v-html-safe="line"></div>
    </div>
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
.minimap-container {
  display: flex;
  align-items: center;
  justify-content: center;
  .minimap {
    user-select: none;
    white-space: pre;
    // .line {
    //   height: 19px;
    // }
  }
}
</style>
