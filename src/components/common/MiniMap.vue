<template>
  <div class="minimap-container">
    <div class="minimap">
      <div class="line"
        :style="{ height: state.options.fontSize }"
        v-for="(line, i) in renderMinimap()"
        :key="'line-' + i"
        v-html-safe="line"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { state } from '@/static/state'
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

<style scoped lang="less">
.minimap-container {
  display: flex;
  flex-grow: 0;
  .minimap {
    user-select: none;
    white-space: pre;
  }
}
</style>
