<template>
  <div class="side-map" v-if="state.options.showSideMap">
    <div class="map-container">
      <div 
        class="ansi"
        v-for="(line, id) in largeMap"
        :key="id"
        v-html-safe="ansiToHtml(line)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useHelpers } from '@/composables/helpers'
import { state } from '@/composables/state'
import { command_ids } from '@/composables/constants/command_ids'
import { useWebSocket } from '@/composables/web_socket'

const { cmd } = useWebSocket()
const { ansiToHtml } = useHelpers()

const MAP_ID = command_ids.MAP
const largeMap = ref([])

function showSideMap () {
  state.options.showSideMap = !state.options.showSideMap
}

function calcMapSize () {
  let width = Math.round(5 + (state.options.sideMapWidth / 2))
  let height = Math.round(5 + (state.options.sideMapHeight / 2))
  return `${width}x${height}`
}

function refreshMap () {
  cmd(`map ${calcMapSize()}`, MAP_ID)
}

let watchers = []
onMounted(() => {
  if (state.options.showSideMap && !state.gameState.battle.active) {
    refreshMap()
  }

  state.inputEmitter.on('showSideMap', showSideMap)

  watchers.push(watch(() => state.cache.commandCache[MAP_ID], (value, oldValue) => {
    let difference = false

    if (!state.cache.commandCache[MAP_ID]) {
      return
    }

    for (let idx in value) {
      if (!value || !oldValue) {
        difference = true
        break
      }
      if (value[idx] !== oldValue[idx]) {
        difference = true
        break
      }
    }

    if (state.options.showSideMap && !state.gameState.battle.active && difference) {
      largeMap.value = state.cache.commandCache[MAP_ID].split('\n')
    }
  }))

  watchers.push(watch(() => [state.options.showSideMap, state.options.sideMapWidth, state.options.sideMapHeight], () => {
    if (state.options.showSideMap && !state.gameState.battle.active) {
      refreshMap()
    }
  }))

  watchers.push(watch(() => state.gameState.map, (value, oldValue) => {
    let difference = false

    for (let idx in value) {
      if (!value || !oldValue) {
        difference = true
        break
      }
      if (value[idx] !== oldValue[idx]) {
        difference = true
        break
      }
    }

    if (state.options.showSideMap && !state.gameState.battle.active && difference) {
      refreshMap()
    }
  }))
})

onBeforeUnmount(() => {
  state.inputEmitter.off('showSideMap', showSideMap)
  for (let watcher of watchers) {
    watcher()
  }
})
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
