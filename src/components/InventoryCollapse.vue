<template>
  <n-collapse-item title="Inventory">
    <div v-if="items.length !== 0">
      <div class="money" v-html=copperToMoneyString(getMoney())></div>
      <div v-for="item in items" :key="item.iid">{{item.amount}}x {{item.name}} </div>
      <div class="items">{{getNumItems()}} / {{getMaxNumItems()}} items</div>
    </div>
  </n-collapse-item>
</template>

<script setup>
import {NCollapseItem} from 'naive-ui'
import {state} from "@/composables/state";
import {useWebSocket} from "@/composables/web_socket";
import {reactive, watch} from "vue";
import { helpers } from "@/composables/helpers";

const { fetchItem } = useWebSocket()
const { copperToMoneyString } = helpers()
const items = reactive([])

watch(() => [state.gameState.inventory], () => {
  const itemIIDs = state.gameState.inventory
  itemIIDs.forEach(async (iid, index) => {
    items[index] = await fetchItem(iid)
  })
  if (itemIIDs.length < items.length) {
    const diff = items.length - itemIIDs.length
    items.splice(itemIIDs.length, diff)
  }
})

function getMoney() {
  return state.gameState.player.money
}

function getNumItems() {
  return state.gameState.player.numItems
}

function getMaxNumItems() {
  return state.gameState.player.maxNumItems
}
</script>

<style>
.money {
  padding-bottom: 10px;
}

.items {
  padding-top: 10px;
}
</style>