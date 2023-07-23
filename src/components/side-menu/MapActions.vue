<template>
  <div class="map-actions">
    <n-button type="error" ghost :disabled="!roomHasEnemies()" @click="cmd('battle')" aria-label="Battle">[<span class="bold-yellow">B</span>]attle</n-button>
    <n-button type="warning" ghost :disabled="!roomHasResources()" @click="cmd('harvest')" aria-label="Harvest">[<span class="bold-yellow">H</span>]arvest</n-button>
    <n-button type="success" ghost :disabled="!roomHasChest()" @click="cmd('loot')" aria-label="Loot">[<span class="bold-yellow">L</span>]oot</n-button>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'

import { NButton } from 'naive-ui'

import { useKeyHandler } from '@/composables/key_handler'
import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/composables/state'

const { onKeydown, keyState } = useKeyHandler()
const { cmd, fetchEntities, fetchItems } = useWebSocket()

const roomItems = ref([])
const roomEntities = ref([])

onKeydown((ev) => {
  if (keyState.alt || keyState.ctrl) {
    return false
  }

  if (state.mode == 'input') {
    return false
  }

  if (state.gameState.battle.active) {
    return false
  }

  if (ev.code == 'KeyB') {
    cmd('battle')
    return true
  } else if (ev.code == 'KeyH') {
    cmd('harvest')
    return true
  } else if (ev.code == 'KeyL') {
    cmd('loot')
    return true
  }

  return false
})

async function getRoomEntities () {
  return await fetchEntities(state.gameState.room.entities)
}

function roomHasEnemies () {
  return roomEntities.value.find(en => en.traits.includes('evil'))
}

async function getRoomItems () {
  return await fetchItems(state.gameState.room.items)
}

function roomHasResources () {
  return roomItems.value.find(en => en.type == 'resource' && en.subtype != 'chest')
}

function roomHasChest () {
  return roomItems.value.find(en => en.type == 'resource' && en.subtype == 'chest')
}

watch(() => state.gameState.room.entities, async () => {
  roomEntities.value = await getRoomEntities()
})

watch(() => state.gameState.room.items, async () => {
  roomItems.value = await getRoomItems()
})

onMounted(() => {
  let ids = ['bottom-left', 'bottom-right']
  for (let id of ids) {
    let el = document.getElementById(id)
    if (el) {
      let containers = el.getElementsByClassName('n-layout-sider-scroll-container')
      for (let container of containers) {
        setTimeout(() => {
          container.scrollTo(0, container.scrollHeight)
        })
      }
    }
  }
})

</script>

<style lang="less">
.map-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-top: 2px;
  margin-bottom: 2px;
  width: 100%;
  .n-button {
    margin: 1px;
  }
}
</style>
