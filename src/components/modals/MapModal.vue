<template>
  <div class="map-modal" v-if="state.modals.mapModal">
    <div 
      class="ansi"
      v-for="(line, id) in largeMap"
      :key="id"
      v-html-safe="ansiToHtml(line)"
    ></div>
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
const mapSize = '29x19'

function showMapModal () {
  state.modals.mapModal = !state.modals.mapModal
}

let watchers = []
onMounted(() => {
  if (state.modals.mapModal && !state.gameState.battle.active) {
    cmd(`map ${mapSize}`, MAP_ID)
  }

  state.inputEmitter.on('showMapModal', showMapModal)

  watchers.push(watch(() => state.cache.commandCache[MAP_ID], () => {
    if (state.modals.mapModal) {
      largeMap.value = state.cache.commandCache[MAP_ID].split('\n')
    }
  }))

  watchers.push(watch(() => state.modals.mapModal, () => {
    if (state.modals.mapModal && !state.gameState.battle.active) {
      cmd(`map ${mapSize}`, MAP_ID)
    }
  }))

  watchers.push(watch(() => state.gameState.map, () => {
    if (state.modals.mapModal && !state.gameState.battle.active) {
      cmd(`map ${mapSize}`, MAP_ID)
    }
  }))
})

onBeforeUnmount(() => {
  state.inputEmitter.off('showMapModal', showMapModal)
  for (let watcher of watchers) {
    watcher()
  }
})
</script>

<style scoped lang="less">
.map-modal {
  position: absolute;
  top: 32px;
  right: 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow: hidden;
  .ansi {
    white-space: pre;
    font-size: 1rem;
    line-height: 0.9rem;
  }
}
</style>
