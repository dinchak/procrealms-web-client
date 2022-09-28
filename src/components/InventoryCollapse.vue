<template>
  <n-collapse-item title="Inventory">
    <div v-if="items.length !== 0">
      <div class="money" v-html=copperToMoneyString(getMoney())></div>
      <InventoryRow v-for="item in items" :key="item.iid" v-bind="item" @toggled="toggleExpand"></InventoryRow>
      <div class="last-row">
        <div class="items">{{getNumItems()}}/{{getMaxNumItems()}} items</div>
        <div class="weight">{{getWeight()}}/{{getMaxWeight()}} lbs</div>
      </div>
    </div>
  </n-collapse-item>
</template>

<script setup>
import { state } from '@/composables/state';
import { useWebSocket } from '@/composables/web_socket';
import {reactive, watch} from "vue";
import { helpers } from '@/composables/helpers'
import { NCollapseItem } from 'naive-ui'
import InventoryRow from '@/components/InventoryRow.vue'

const { fetchItem } = useWebSocket()
const { copperToMoneyString } = helpers()
const items = reactive([])

watch(() => state.gameState.inventory, () => {
  const itemIIDs = state.gameState.inventory
  setItems(itemIIDs)
})

function setItems(itemIIDs) {
  let oldItems = [...items]
  itemIIDs.forEach(async (iid, index) => {
    items[index] = await fetchItem(iid)
    if (oldItems.length === 0) {
      items[index] = {...items[index], expanded: false}
    } else if (oldItems.length !== items.length) {
      oldItems = [...items]
    } else {
      if (oldItems[index] && oldItems[index].name === items[index].name) {
        items[index].expanded = oldItems[index].expanded
      }
    }
  })
  if (itemIIDs.length < items.length) {
    const diff = items.length - itemIIDs.length
    items.splice(itemIIDs.length, diff)
  }
}

function toggleExpand(iid) {
  items.map(item => {
    if (item.iid === iid) {
      item.expanded = !item.expanded
    }
  })
}

function getMoney() {
  return state.gameState.player.money || 0
}

function getNumItems() {
  return state.gameState.player.numItems || 0
}

function getMaxNumItems() {
  return state.gameState.player.maxNumItems || 0
}

function getWeight() {
  const initialValue = state.gameState.player.weight || 0
  return Number.isInteger(initialValue) ? initialValue : initialValue.toFixed(2)
}

function getMaxWeight() {
  const initialValue = state.gameState.player.maxWeight || 0
  return Number.isInteger(initialValue) ? initialValue : initialValue.toFixed(2)
}

setItems(state.gameState.inventory)
</script>

<style scoped>
.money {
  padding-bottom: 10px;
}

.last-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.items, .weight {
  padding-top: 10px;
}
</style>