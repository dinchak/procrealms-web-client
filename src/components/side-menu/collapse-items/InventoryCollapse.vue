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

      <InventoryRow v-for="item in filteredItems" :key="item.iid" v-bind="item" v-on:click="clickHandler(item)" :isPlayer="props.isPlayer"></InventoryRow>
      <InventoryModal
          :visible="isModalOpen"
          :isPlayer="props.isPlayer"
          :item="clickedItem"
          :charEId="character.eid"
          :name="character.name"
          menu="inventory"
      ></InventoryModal>
    </div>
  </n-collapse-item>
</template>

<script setup>
import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import { ref, watch, onMounted, defineProps } from 'vue'
import { helpers } from '@/composables/helpers'
import { NCollapseItem, NInput, NPopselect } from 'naive-ui'
import InventoryRow from '@/components/side-menu/collapse-items/InventoryRow.vue'
import { useKeyHandler } from '@/composables/key_handler'
import { command_ids } from '@/composables/constants/command_ids'
import InventoryModal from "@/components/modals/InventoryModal.vue";

const { fetchItems, cmd } = useWebSocket()
const { copperToMoneyString } = helpers()
const { onKeydown } = useKeyHandler()
const props = defineProps(['inventory', 'isPlayer', 'character'])

const items = ref([])
const searchTerm = ref('')
const filteredItems = ref([])
const searchInput = ref(null)
const clickedItem = ref({})
const isModalOpen = ref(0)
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
onMounted(() => {
  setItems(props.inventory)
})

watch(() => props.inventory, () => {
  setItems(props.inventory)
})

watch(searchTerm, () => {
  setItems(props.inventory)
})

watch(value, () => {
  filteredItems.value = filteredItems.value.sort((a, b) => a[value.value] > b[value.value] ? 1 : -1)
})

// Methods

async function setItems (itemIIDs) {
  items.value = await fetchItems(itemIIDs)

  const input = searchTerm.value.toLowerCase()

  filteredItems.value = items.value.filter((item) => (item.name.toLowerCase().includes(input) ||
      item.colorName.toLowerCase().includes(input) || item.type.toLowerCase().includes(input)) ||
      (item.subtype ? item.subtype.toLowerCase().includes(input) : false))
      .sort((a, b) => a[value.value] > b[value.value] ? 1 : -1)

  if (state.modals.inventoryModal.visible) { // TODO Remove This statement as part of inventory modal
    items.value.map(item => {
      if (item.name === state.modals.inventoryModal.item.name && item.iid !== state.modals.inventoryModal.item.iid) {
        state.modals.inventoryModal.item = item
      }
    })
  }

  if (isModalOpen.value) {
    items.value.map(item => {
      if (item.name === clickedItem.value.name && item.iid !== clickedItem.value.iid) {
        clickedItem.value = item
      }
    })
  }
}

function clickHandler(item) {
  state.modals.inventoryModal.visible = true
  state.modals.inventoryModal.item = item
  state.modals.inventoryModal.menu = 'inventory'
  clickedItem.value = item
  isModalOpen.value++

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