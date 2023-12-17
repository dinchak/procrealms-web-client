<template>
  <div class="map-actions">
    <n-button type="error" ghost :disabled="!roomHasEnemies()" @click="cmd('battle')" aria-label="Battle">[<span class="bold-yellow">B</span>]attle</n-button>
    <n-button type="warning" ghost :disabled="!roomHasResources()" @click="cmd('harvest')" aria-label="Harvest">[<span class="bold-yellow">H</span>]arvest</n-button>
    <n-button type="success" ghost :disabled="!roomHasChest()" @click="cmd('loot')" aria-label="Loot">[<span class="bold-yellow">L</span>]oot</n-button>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { NButton } from 'naive-ui'
import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/composables/state'

const { cmd, fetchEntities, fetchItems } = useWebSocket()
const roomItems = ref([])
const roomEntities = ref([])

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

function battle () {
  cmd('battle')
}

function harvest () {
  cmd('harvest')
}

function loot () {
  cmd('loot')
}

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

  state.inputEmitter.on('battle', battle)
  state.inputEmitter.on('harvest', harvest)
  state.inputEmitter.on('loot', loot)

  watch(() => state.gameState.room.entities, async () => {
    roomEntities.value = await getRoomEntities()
  })

  watch(() => state.gameState.room.items, async () => {
    roomItems.value = await getRoomItems()
  })
})

onBeforeUnmount(() => {
  state.inputEmitter.off('battle', battle)
  state.inputEmitter.off('harvest', harvest)
  state.inputEmitter.off('loot', loot)
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
