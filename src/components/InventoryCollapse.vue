<template>
  <n-collapse-item title="Inventory">
    <div v-if="items.length !== 0">
      <div class="money" v-html=copperToMoneyString(getMoney())></div>
      <div class="limits">
        <div class="items">{{getNumItems()}}/{{getMaxNumItems()}} items</div>
        <div class="weight">{{getWeight()}}/{{getMaxWeight()}} lbs</div>
      </div>
      <div class="search">
        <n-input v-model:value="searchTerm" ref="searchInput" @blur="onBlur" @focus="onFocus" placeholder="Search"></n-input>
      </div>
      <InventoryRow v-for="item in filteredItems" :key="item.iid" v-bind="item" @toggled="toggleExpand"></InventoryRow>
    </div>
  </n-collapse-item>
</template>

<script setup>
import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import { onMounted, reactive, ref, watch, watchEffect } from 'vue'
import {helpers} from '@/composables/helpers'
import { NCollapseItem, NInput } from 'naive-ui'
import InventoryRow from '@/components/InventoryRow.vue'
import { useKeyHandler } from '@/composables/key_handler'

const { fetchItem } = useWebSocket()
const { copperToMoneyString } = helpers()
const { onKeydown } = useKeyHandler()

const items = reactive([])
const searchTerm = ref('')
const filteredItems = ref([])
const searchInput = ref(null)

// Watchers
watchEffect(() => {
  setItems(state.gameState.inventory)
})

watch(searchTerm, () => {
  setItems(state.gameState.inventory)
})

// Methods

function setItems(itemIIDs) {
  let oldItems = [...items]
  itemIIDs.forEach(async (iid, index) => {
    items[index] = await fetchItem(iid)
    if (oldItems.length === 0) {
      items[index].expanded = false
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

  filteredItems.value = items.filter((item) => (item.name.toLowerCase().includes(searchTerm.value) ||
      item.colorName.toLowerCase().includes(searchTerm.value) || item.type.toLowerCase().includes(searchTerm.value)) ||
      (item.subtype ? item.subtype.toLowerCase().includes(searchTerm.value) : false))
      .sort((a, b) => a.name > b.name)
}

function toggleExpand(iid) {
  items.map(item => {
    if (item.iid === iid) {
      item.expanded = !item.expanded
    }
  })
}

// Setters
onKeydown((ev) => {
  if (ev.key === 'Escape' && state.mode ==='input') {
    searchInput.value.blur()
    return true
  }
})

function onFocus() {
  state.mode = 'input'
}

function onBlur() {
  state.mode = 'blur'
}

onMounted(() => {
  setItems(state.gameState.inventory)
})

// Getters

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

</script>

<style scoped>
.money {
  padding-bottom: 10px;
}

.limits {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.items, .weight {
  padding-top: 10px;
}

.search {
  padding: 10px 15px 10px 0;
}
</style>