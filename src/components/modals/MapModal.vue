<template>
  <n-card :class="getSideClass()" v-if="state.modals.mapModal">
    <p class="close" v-on:click="closeModal()">x</p>
    <div v-for="(line, id) in largeMap" :key="id">
      <div v-html="ansiSpan(line)"></div>
    </div>
  </n-card>
</template>

<script setup>
import { NCard } from 'naive-ui'
import { ref, watch } from 'vue'
import { ansiSpan } from 'ansi-to-span'
import { state } from '@/composables/state'
import { command_ids } from '@/composables/constants/command_ids'
import { useWebSocket } from '@/composables/web_socket'
import { useKeyHandler } from '@/composables/key_handler'

const { cmd } = useWebSocket()
const { onKeydown, keyState } = useKeyHandler()
const MAP_ID = command_ids.MAP
const largeMap = ref([])

watch(() => state.commandCache[MAP_ID], () => {
  if (state.modals.mapModal) {
    largeMap.value = state.commandCache[MAP_ID].replaceAll(' ',  '&nbsp;').split(' ')
  }
})

watch(() => state.modals.mapModal, () => {
  if (state.modals.mapModal) {
    cmd('map', MAP_ID)
    largeMap.value = state.commandCache[MAP_ID].replaceAll(' ',  '&nbsp;').split(' ')
  }
})

watch(() => state.gameState.map, () => {
  cmd('map', MAP_ID)
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

  if (!state.options.movementDuringInput && state.mode === 'input') {
    return false
  }

  if (ev.key === 'm') {
    state.modals.mapModal = !state.modals.mapModal
    return true
  }
})

cmd('map', MAP_ID)
</script>

<style scoped lang="less">
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