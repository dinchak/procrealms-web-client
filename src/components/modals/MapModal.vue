<template>
  <n-card :class="getSideClass()" v-if="state.modals.mapModal">
    <p class="close" v-on:click="closeModal()">x</p>
    <div class="ansi" v-for="(line, id) in largeMap" :key="id" v-html="ansiToHtml(line)"></div>
  </n-card>
</template>

<script setup>
import { NCard } from 'naive-ui'
import { ref, watch, onMounted } from 'vue'
import { helpers } from '@/composables/helpers'
import { state } from '@/composables/state'
import { command_ids } from '@/composables/constants/command_ids'
import { useWebSocket } from '@/composables/web_socket'
import { useKeyHandler } from '@/composables/key_handler'

const { cmd } = useWebSocket()
const { onKeydown, keyState } = useKeyHandler()
const { ansiToHtml } = helpers()

const MAP_ID = command_ids.MAP
const largeMap = ref([])

watch(() => state.cache.commandCache[MAP_ID], () => {
  if (state.modals.mapModal) {
    largeMap.value = state.cache.commandCache[MAP_ID].split('\n')
  }
})

watch(() => state.modals.mapModal, () => {
  if (state.modals.mapModal) {
    cmd('map', MAP_ID)
  }
})

watch(() => state.cache.commandCache[MAP_ID], () => {
  largeMap.value = state.cache.commandCache[MAP_ID].split('\n')
})

watch(() => state.gameState.map, () => {
  if (state.modals.mapModal) {
    cmd('map', MAP_ID)
  }
})

function getSideClass() {
  return state.options.swapControls ? 'right' : 'left'
}

function closeModal() {
  state.modals.mapModal = false
}

onKeydown((ev) => {
  if (keyState.alt || keyState.ctrl) {
    return false
  }

  if (!state.options.movementDuringInput || state.mode === 'input') {
    return false
  }

  if (ev.key === 'M' || ev.key === 'm') {
    state.modals.mapModal = !state.modals.mapModal
    return true
  }
})

onMounted(() => {
  if (state.modals.mapModal) {
    cmd('map', MAP_ID)
  }
})
</script>

<style scoped lang="less">
.ansi {
  white-space: pre;
}

.left {
  left: 5px;
}

.right {
  right: 5px;
}

.n-card {
  position: absolute;
  max-width: 62vw;
  margin-top: 35px;
  z-index: 2;
  line-height: 10px;
}

.close {
  position: absolute;
  top: -10px;
  right: 10px;
  cursor: pointer;
  font-size: 1.4em;
}

@media screen and (max-width: 600px) {
  .n-card {
    font-size: 15px;
    line-height: 14px;
  }
}
</style>