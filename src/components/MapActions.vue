<template>
  <div class="map-actions">
    <n-button type="error" ghost :disabled="!roomHasEnemies()" @click="cmd('battle')">[<span class="bold-yellow">B</span>]attle</n-button>
    <n-button type="warning" ghost :disabled="!roomHasResources()" @click="cmd('harvest')">[<span class="bold-yellow">H</span>]arvest</n-button>
    <n-button type="success" ghost :disabled="!roomHasChest()" @click="cmd('loot')">[<span class="bold-yellow">L</span>]oot</n-button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

import { NButton } from 'naive-ui'

import { useKeyHandler } from '@/composables/key_handler'
import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/composables/state'

const { onKeydown } = useKeyHandler()
const { cmd, fetchEntity, fetchItem } = useWebSocket()

onKeydown((ev) => {
  if (state.mode == 'input') {
    return
  }

  if (ev.key == 'B' || ev.key == 'b') {
    cmd('battle')
  } else if (ev.key == 'H' || ev.key == 'h') {
    cmd('harvest')
  } else if (ev.key == 'L' || ev.key == 'l') {
    cmd('loot')
  }
})

async function getRoomEntities () {
  let roomEntities = []

  for (let eid of state.gameState.room.entities) {
    try {
      let entity = await fetchEntity(eid)
      roomEntities.push(entity)
    } catch (err) {
      console.log(`failed to fetch entity eid ${eid}`)
      console.log(err.stack)
    }
  }

  return roomEntities
}

async function roomHasEnemies () {
  let roomEntities = await getRoomEntities()
  return roomEntities.find(en => en.traits.includes('evil'))
}

async function getRoomItems () {
  let roomItems = []
  for (let iid of state.gameState.room.items) {
    try {
      let item = await fetchItem(iid)
      roomItems.push(item)
    } catch (err) {
      console.log(`failed to fetch item iid ${iid}`)
      console.log(err.stack)
    }
  }
  return roomItems
}

async function roomHasResources () {
  let roomItems = await getRoomItems()
  return roomItems.find(en => en.type == 'resource' && en.subtype != 'chest')
}

async function roomHasChest () {
  let roomItems = await getRoomItems()
  return roomItems.find(en => en.type == 'resource' && en.subtype == 'chest')
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
})

</script>

<style lang="less">
.map-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-top: 5px;
  margin-bottom: 5px;
  width: 100%;
  .n-button {
    margin: 1px;
  }
}
</style>
