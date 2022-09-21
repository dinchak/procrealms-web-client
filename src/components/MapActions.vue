<template>
  <div class="map-actions">
    <n-button type="error" ghost :disabled="!roomHasEnemies()" @click="cmd('battle')">[<span class="bold-yellow">B</span>]attle</n-button>
    <n-button type="warning" ghost :disabled="!roomHasResources()" @click="cmd('harvest')">[<span class="bold-yellow">H</span>]arvest</n-button>
    <n-button type="success" ghost :disabled="!roomHasChest()" @click="cmd('loot')">[<span class="bold-yellow">L</span>]oot</n-button>
  </div>
</template>

<script setup>

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

function roomHasEnemies () {
  let roomEntities = []

  for (let eid of state.gameState.room.entities) {
    let entity = state.entityCache[eid]
    if (!entity) {
      fetchEntity(eid)
      continue
    }
    roomEntities.push(entity)
  }

  return roomEntities.find(en => en.traits.includes('evil'))
}

function roomHasResources () {
  let roomItems = []

  for (let iid of state.gameState.room.items) {
    let item = state.itemCache[iid]
    if (!item) {
      fetchItem(iid)
      continue
    }
    roomItems.push(item)
  }

  return roomItems.find(en => en.type == 'resource' && en.subtype != 'chest')
}

function roomHasChest () {
  let roomItems = []

  for (let iid of state.gameState.room.items) {
    let item = state.itemCache[iid]
    if (!item) {
      fetchItem(iid)
      continue
    }
    roomItems.push(item)
  }

  return roomItems.find(en => en.type == 'resource' && en.subtype == 'chest')
}

</script>

<style lang="less">
.map-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-top: 15px;
  margin-bottom: 5px;
  width: 100%;
  .n-button {
    margin: 1px;
  }
}
</style>
