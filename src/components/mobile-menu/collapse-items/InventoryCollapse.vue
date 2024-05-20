<template>
  <NCollapseItem title="Inventory" class="inventory-dropdown">
    <div class="money" v-html-safe=copperToMoneyString(getMoney())></div>
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

      <InventoryRow v-for="item in filteredItems" :key="item.iid" v-bind="item" v-on:click="clickHandler(item)" :isPlayer="props.isPlayer"></InventoryRow>
      <ItemModal
          :visible="isModalOpen"
          :isPlayer="props.isPlayer"
          :item="clickedItem"
          :charEId="props.character.eid"
          :name="props.character.name"
          :affects="props.affects"
          menu="inventory"
      ></ItemModal>
    </div>
  </NCollapseItem>
</template>

<script setup>
import { ref, watch, onMounted, defineProps } from 'vue'
import { NCollapseItem, NInput, NPopselect } from 'naive-ui'

import { state, setMode, prevMode } from '@/static/state'
import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'
import { COMMAND_IDS } from '@/static/constants'

import InventoryRow from '@/components/mobile-menu/collapse-items/InventoryRow.vue'
import ItemModal from '@/components/modals/ItemModal.vue'

const { fetchItems, cmd } = useWebSocket()
const { copperToMoneyString } = useHelpers()

const props = defineProps(['inventory', 'isPlayer', 'character', 'affects', 'menu'])

const items = ref([])
const searchTerm = ref('')
const filteredItems = ref([])
const searchInput = ref(null)
const clickedItem = ref({})
const isModalOpen = ref(0)
const value = ref('name')

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

onMounted(() => {
  setItems(props.inventory)

  watch(() => props.inventory, () => {
    setItems(props.inventory)
  })

  watch(searchTerm, () => {
    setItems(props.inventory)
  })

  watch(value, () => {
    filteredItems.value = filteredItems.value.sort((a, b) => a[value.value] > b[value.value] ? 1 : -1)
  })
})

async function setItems (itemIIDs) {
  items.value = await fetchItems(itemIIDs)

  const input = searchTerm.value.toLowerCase()

  filteredItems.value = items.value.filter((item) => (item.name.toLowerCase().includes(input) ||
      item.colorName.toLowerCase().includes(input) || item.type.toLowerCase().includes(input)) ||
      (item.subtype ? item.subtype.toLowerCase().includes(input) : false))
      .sort((a, b) => a[value.value] > b[value.value] ? 1 : -1)

  if (isModalOpen.value) {
    items.value.map(item => {
      if (item.name === clickedItem.value.name && item.iid !== clickedItem.value.iid) {
        clickedItem.value = item
      }
    })
  }
}

function clickHandler(item) {
  clickedItem.value = item
  isModalOpen.value++
  props.isPlayer ? state.modals.inventoryModals.playerItemModal = "inventory" : state.modals.inventoryModals.mercItemModal = "inventory"

  const commandCacheKey = COMMAND_IDS.EXAMINE + item.iid.toString()

  const mercOrder = props.isPlayer ? '' : `order eid:${props.character.eid} `
  cmd(`${mercOrder}examine iid:${item.iid}`, commandCacheKey)
}

// Setters
function onFocus() {
  setMode('input')
}

function onBlur() {
  prevMode()
}

// Getters

function getMoney() {
  return props.character.money || 0
}

function getNumItems() {
  return props.character.numItems || 0
}

function getMaxNumItems() {
  return props.character.maxNumItems || 0
}

function getWeight() {
  const initialValue = props.character.weight || 0
  return Number.isInteger(initialValue) ? initialValue : initialValue.toFixed(2)
}

function getMaxWeight() {
  const initialValue = props.character.maxWeight || 0
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