<template>
  <div class="map-modal" v-if="state.modals.mapModal">
    <NSlider v-if="state.settingsMode" class="slider" v-model:value="mapWidth" @update:value="refreshMap()" :step="2">
      <template #thumb>
        <NIconWrapper :size="24" :border-radius="12">
          <NIcon :size="18" :component="SwapHorizOutlined" />
        </NIconWrapper>
      </template>
    </NSlider>

    <NSlider v-if="state.settingsMode" class="slider" v-model:value="mapHeight" @update:value="refreshMap()" :step="2">
      <template #thumb>
        <NIconWrapper :size="24" :border-radius="12">
          <NIcon :size="18" :component="SwapVertOutlined" />
        </NIconWrapper>
      </template>
    </NSlider>
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
import { NSlider, NIconWrapper, NIcon } from 'naive-ui'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useHelpers } from '@/composables/helpers'
import { state } from '@/composables/state'
import { command_ids } from '@/composables/constants/command_ids'
import { useWebSocket } from '@/composables/web_socket'

import SwapVertOutlined from '@vicons/material/SwapVertOutlined'
import SwapHorizOutlined from '@vicons/material/SwapHorizOutlined'

const { cmd } = useWebSocket()
const { ansiToHtml } = useHelpers()

const MAP_ID = command_ids.MAP
const largeMap = ref([])
const mapWidth = ref(50)
const mapHeight = ref(50)

function showMapModal () {
  state.modals.mapModal = !state.modals.mapModal
}

function calcMapSize () {
  let width = Math.round(5 + (mapWidth.value / 2))
  let height = Math.round(5 + (mapHeight.value / 2))
  return `${width}x${height}`
}

let cmdTimeout = false
let doMapCmd = false

function refreshMap () {
  if (cmdTimeout) {
    doMapCmd = true
    return
  }

  cmd(`map ${calcMapSize()}`, MAP_ID)

  cmdTimeout = setTimeout(() => {
    cmdTimeout = false
    if (doMapCmd) {
      cmd(`map ${calcMapSize()}`, MAP_ID)
    }
  }, 500)
}

let watchers = []
onMounted(() => {
  if (state.modals.mapModal && !state.gameState.battle.active) {
    refreshMap()
  }

  state.inputEmitter.on('showMapModal', showMapModal)

  watchers.push(watch(() => state.cache.commandCache[MAP_ID], () => {
    if (state.modals.mapModal) {
      largeMap.value = state.cache.commandCache[MAP_ID].split('\n')
    }
  }))

  watchers.push(watch(() => state.modals.mapModal, () => {
    if (state.modals.mapModal && !state.gameState.battle.active) {
      refreshMap()
    }
  }))

  watchers.push(watch(() => state.gameState.map, () => {
    if (state.modals.mapModal && !state.gameState.battle.active) {
      refreshMap()
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
  top: 33px;
  right: 5px;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  overflow: hidden;
  .map-container {
    padding-top: 5px;
    .ansi {
      white-space: pre;
      font-size: 1rem;
      line-height: 0.9rem;
    }
  }

  .slider {
    width: 100px;
    z-index: 5;
    margin-top: 10px;
    margin-bottom: 3px;
  }
}
</style>
