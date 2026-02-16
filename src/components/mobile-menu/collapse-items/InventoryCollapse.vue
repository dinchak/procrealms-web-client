<template>
  <NCollapseItem title="Inventory" class="inventory-dropdown">
    <div class="money" v-html-safe=copperToMoneyString(getMoney())></div>

    <div class="limits">
      <div class="items">{{getNumItems()}}/{{getMaxNumItems()}} items</div>
      <div class="weight">{{getWeight()}}/{{getMaxWeight()}} lbs</div>
    </div>

    <div v-if="items.length !== 0" class="inventory-items">
      <div class="search">
        <NInput v-model:value="searchTerm" ref="searchInput" @blur="onBlur" @focus="onFocus" placeholder="Search"></NInput>
      </div>

      <div class="sorting">
        <span>Sort by </span>
        <NPopselect v-model:value="value" :options="options">
          <span class="dropdown">{{value}}</span>
        </NPopselect>
      </div>

      <div v-for="item in filteredItems" :key="item.iid">
        <InventoryRow
          :iid="item.iid"
          :item="item"
          :selected="getSelected(item.iid)"
          v-on:click="clickHandler(item.iid)"
        ></InventoryRow>

        <div class="inline-details" v-if="selectedIid == item.iid">
          <ItemDetails :item="selectedItem" :actions="getActions(selectedItem)" :item-output-id="item.iid"></ItemDetails>
        </div>
      </div>
    </div>
  </NCollapseItem>
</template>

<script setup>
import { ref, watch, onMounted, defineProps, onBeforeUnmount } from 'vue'
import { NCollapseItem, NInput, NPopselect } from 'naive-ui'

import InventoryRow from '@/components/mobile-menu/collapse-items/InventoryRow.vue'
import ItemDetails from '@/components/game-modal/ItemDetails.vue'

import { state, setMode, prevMode, updateCounter } from '@/static/state'

import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'

const { fetchItem, fetchItems } = useWebSocket()
const { copperToMoneyString, getActions } = useHelpers()

const props = defineProps(['inventory', 'isPlayer', 'character', 'effects', 'menu'])
const IS_DEVELOPMENT = import.meta.env.MODE == 'development'

const items = ref([])
const searchTerm = ref('')
const filteredItems = ref([])
const searchInput = ref(null)
const value = ref('name')
const selectedIid = ref('')
const selectedItem = ref({})

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

let watchers = []
let refreshTimeout = null
let refreshRequestToken = 0
let selectedFetchToken = 0

function incrementUiDiagnostic (key, amount = 1) {
  if (!IS_DEVELOPMENT) {
    return
  }

  state.diagnostics.ui[key] = (state.diagnostics.ui[key] || 0) + amount
}

onMounted(() => {
  scheduleItemsRefresh(0)

  watchers.push(watch(() => (props.inventory || []).map(i => `${i.iid}|${i.name}|${i.amount || 1}`), () => {
    scheduleItemsRefresh(0)
  }))

  watchers.push(watch(searchTerm, () => {
    applyFilterSort()
  }))

  watchers.push(watch(updateCounter, () => {
    scheduleItemsRefresh(40)
  }))

  watchers.push(watch(value, () => {
    applyFilterSort()
  }))
})

onBeforeUnmount(() => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout)
    refreshTimeout = null
  }
  watchers.forEach(w => w())
})

function getSelected (iid) {
  return selectedIid.value === iid
}

async function setItems (inventory) {
  const token = ++refreshRequestToken
  incrementUiDiagnostic('inventoryCollapseRefreshes')

  const inventoryItems = inventory || []
  const fetchedItems = await fetchItems(inventoryItems.map(i => i.iid))

  if (token !== refreshRequestToken) {
    incrementUiDiagnostic('inventoryCollapseStaleDrops')
    return
  }

  items.value = fetchedItems
  applyFilterSort()
}

function scheduleItemsRefresh (delay = 0) {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout)
  }

  refreshTimeout = setTimeout(() => {
    refreshTimeout = null
    setItems(props.inventory)
  }, delay)
}

function applyFilterSort () {
  const input = searchTerm.value.toLowerCase()

  filteredItems.value = items.value
    .filter(item => {
      return (item.name.toLowerCase().includes(input) ||
        item.colorName.toLowerCase().includes(input) ||
        item.type.toLowerCase().includes(input)) ||
        (item.subtype ? item.subtype.toLowerCase().includes(input) : false)
    })
    .sort((a, b) => {
      return a[value.value] > b[value.value] ? 1 : -1
    })
}

function clickHandler (iid) {
  if (selectedIid.value && selectedIid.value == iid) {
    selectedIid.value = ''
    selectedItem.value = {}
    return
  }

  selectedIid.value = iid
  const token = ++selectedFetchToken
  fetchItem(iid).then(item => {
    if (token !== selectedFetchToken) {
      return
    }
    selectedItem.value = item || {}
  })
}

function onFocus () {
  setMode('input')
}

function onBlur () {
  prevMode()
}

function getMoney () {
  return props.character.money || 0
}

function getNumItems () {
  return props.character.numItems || 0
}

function getMaxNumItems () {
  return props.character.maxNumItems || 0
}

function getWeight () {
  const initialValue = props.character.weight || 0
  return Number.isInteger(initialValue) ? initialValue : initialValue.toFixed(2)
}

function getMaxWeight () {
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