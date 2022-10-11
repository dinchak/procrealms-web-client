<template>
  <n-collapse-item title="Inventory" class="inventory-dropdown">
    <div class="money" v-html=copperToMoneyString(getMoney())></div>
    <div class="limits">
      <div class="items">{{getNumItems()}}/{{getMaxNumItems()}} items</div>
      <div class="weight">{{getWeight()}}/{{getMaxWeight()}} lbs</div>
    </div>
    <div v-if="items.length !== 0" class="inventory-items">
      <div class="search">
        <n-input v-model:value="searchTerm" ref="searchInput" @blur="onBlur" @focus="onFocus" placeholder="Search"></n-input>
      </div>
      <div class="sorting">
        <span>Sort by </span>
        <n-popselect v-model:value="value" :options="options">
          <span class="dropdown">{{value}}</span>
        </n-popselect>
      </div>

      <InventoryRow v-for="item in filteredItems" :key="item.iid" v-bind="item" v-on:click="clickHandler(item)"></InventoryRow>
    </div>
  </n-collapse-item>
</template>

<script setup>
import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import { reactive, ref, watch, watchEffect } from 'vue'
import { helpers } from '@/composables/helpers'
import { NCollapseItem, NInput, NPopselect } from 'naive-ui'
import InventoryRow from '@/components/side-menu/collapse-items/InventoryRow.vue'
import { useKeyHandler } from '@/composables/key_handler'
import { command_ids } from '@/composables/constants/command_ids'

const { fetchItem, cmd } = useWebSocket()
const { copperToMoneyString } = helpers()
const { onKeydown } = useKeyHandler()

const items = reactive([])
const searchTerm = ref('')
const filteredItems = ref([])
const searchInput = ref(null)
const clickedItem = ref({})
const options = [
  {
    label: 'Name',
    value: 'name'
  },
  {
    label: 'Level',
    value: 'level'
  },
  {
    label: 'Type',
    value: 'type'
  },
  {
    label: 'Subtype',
    value: 'subtype'
  },
  {
    label: 'Weight',
    value: 'weight'
  },
  {
    label: 'Value',
    value: 'value'
  }
]
const value = ref('name')

// Watchers
watchEffect(() => {
  setItems(state.gameState.inventory)
})

watch(searchTerm, () => {
  setItems(state.gameState.inventory)
})

watch(value, () => {
  filteredItems.value = filteredItems.value.sort((a, b) => a[value.value] > b[value.value] ? 1 : -1)
})

// Methods

function setItems(itemIIDs) {
  let oldItems = [...items]
  itemIIDs.forEach(async (iid, index) => {
    items[index] = await fetchItem(iid)
    if (items[index].name === clickedItem.value.name) {
      clickedItem.value.amount = items[index].amount
    }
    if (oldItems.length !== items.length) {
      oldItems = [...items]
    }
  })

  if (itemIIDs.length < items.length) {
    const diff = items.length - itemIIDs.length
    items.splice(itemIIDs.length, diff)
  }

  const input = searchTerm.value.toLowerCase()

  filteredItems.value = items.filter((item) => (item.name.toLowerCase().includes(input) ||
      item.colorName.toLowerCase().includes(input) || item.type.toLowerCase().includes(input)) ||
      (item.subtype ? item.subtype.toLowerCase().includes(input) : false))
      .sort((a, b) => a[value.value] > b[value.value] ? 1 : -1)

  if (state.modal.visible) {
    items.map(item => {
      if (item.name === state.modal.item.name && item.iid !== state.modal.item.iid) {
        state.modal.item = item
      }
    })
  }
}

function clickHandler(item) {
  state.modal.visible = true
  state.modal.item = item
  state.modal.menu = 'inventory'

  const itemCacheKeys = Object.keys(state.itemCache)
  const commandCacheKeys = Object.keys(state.commandCache)
  console.log(itemCacheKeys.length)
  console.log(commandCacheKeys.length)

  const commandCacheKey = command_ids.EXAMINE + item.iid.toString()
  cmd(`examine iid:${item.iid}`, commandCacheKey)
}

// Setters
onKeydown((ev) => {
  if (ev.key === 'Escape' && state.mode ==='input' && searchInput.value) {
    searchInput.value.blur()
  }
})

function onFocus() {
  state.mode = 'input'
}

function onBlur() {
  state.mode = 'hotkey'
}

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

.inventory-items {
  position: static;
}

.sorting {
  margin-bottom: 15px;
}

.dropdown {
  margin-bottom: 40px;
  padding: 5px;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  text-transform: capitalize;
  position: relative;
}
</style>