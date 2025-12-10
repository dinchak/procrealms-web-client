<template>
  <div :class="getScrollContainerClass()">
    <SelectPlayerModalAs></SelectPlayerModalAs>

    <NGrid class="inventory-summary" cols="1 600:2">
      <NGi class="cell search">
        <NInput placeholder="Filter Items" v-model:value="search" clearable></NInput>
      </NGi>

      <NGi class="cell summary">
        <div class="money" v-html-safe="copperToMoneyString(state.gameState.player.money)"></div>
        <div class="money-brief" v-html-safe="copperToMoneyString(state.gameState.player.money, true)"></div>
        <div class="limit">
          <div class="value bold-cyan">
            <span class="bold-white">{{ getNumItems() }}</span> <span class="black">/</span> {{ getMaxNumItems() }}
          </div>
          <div class="label cyan">items</div>
        </div>
        <div class="limit">
          <div class="value bold-red">
            <span class="bold-white">{{ getWeight() }}</span> <span class="black">/</span> {{ getMaxWeight() }}
          </div>
          <div class="label red">lbs</div>
        </div>
      </NGi>
    </NGrid>

    <div class="sorting">
      <span>Sort by </span>
      <NPopselect v-model:value="state.inventorySortValue" :options="sortOptions" @change="onSortChange">
        <span class="dropdown">{{ state.inventorySortValue }}</span>
      </NPopselect>
    </div>

    <div v-if="getItems().length == 0">You don't have anything in your inventory.</div>

    <div class="item-table">
      <div class="inventory" v-for="(e, i) in columns" :key="i">
        <div v-for="(item, index) in getItems()" :key="item.iid" class="item-row">
          <div :class=itemClass(item.iid) v-if="index % columns === i">
            <div class="name selectable" v-html-safe="ansiToHtml(item.fullName)" :class="getItemNameClass(item)" @click="selectItem(item)"></div>
              <ItemDetails :item="item" :actions="getActions(item)" v-if="selectedIid == item.iid"></ItemDetails>
          </div>
        </div>
      </div>
    </div>

</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineProps, toRefs } from 'vue'
import { NGrid, NGi, NInput, NPopselect } from 'naive-ui'

import ItemDetails from '@/components/game-modal/ItemDetails.vue'
import SelectPlayerModalAs from '@/components/game-modal/SelectPlayerModalAs.vue'

import { state } from '@/static/state'

import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const { ansiToHtml, copperToMoneyString, getActions } = useHelpers()
const { fetchItems } = useWebSocket()

const props = defineProps(['miniOutputEnabled'])
const { miniOutputEnabled } = toRefs(props)

const items = ref([])
const selectedIid = ref({})
const search = ref('')
const columns = ref(1)

const sortOptions = [
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

function getItems () {
  if (search.value) {
    return items.value.filter(item => {
      const validItem = item.fullName.toLowerCase().includes(search.value.toLowerCase()) ||
          item.type.toLowerCase().includes(search.value.toLowerCase()) ||
          item.subtype.toLowerCase().includes(search.value.toLowerCase())
      return validItem
    })
  } else {
    return items.value
  }
}

function getItemNameClass (item) {
  return selectedIid.value == item.iid ? 'selected' : ''
}

function selectItem (item) {
  if (selectedIid.value == item.iid) {
    selectedIid.value = {}
    return
  }
  selectedIid.value = item.iid
}

function getNumItems () {
  return state.gameState.player.numItems || 0
}

function getMaxNumItems () {
  return state.gameState.player.maxNumItems || 0
}

function getWeight () {
  const initialValue = state.gameState.player.weight || 0
  return Number.isInteger(initialValue) ? initialValue : initialValue.toFixed(2)
}

function getMaxWeight () {
  const initialValue = state.gameState.player.maxWeight || 0
  return Number.isInteger(initialValue) ? initialValue : initialValue.toFixed(2)
}

function getScrollContainerClass () {
  return {
    'scroll-container': true,
    'mini-output-enabled': miniOutputEnabled.value
  }
}

function getInventory () {
  if (state.playerModalAs && state.gameState.charmies[state.playerModalAs]) {
    return state.gameState.charmies[state.playerModalAs].items || []
  }
  return state.gameState.inventory || []
}

let charmieInventoryWatcher = null
function unwatchCharmieInventory () {
  if (charmieInventoryWatcher) {
    charmieInventoryWatcher()
  }
}

function watchCharmieInventory () {
  if (!state.playerModalAs || !state.gameState.charmies[state.playerModalAs]) {
    return
  }

  charmieInventoryWatcher = watch(() => {
    return state.gameState.charmies[state.playerModalAs] ? state.gameState.charmies[state.playerModalAs].items : []
  }, async () => {
    items.value = sortItems(await fetchItems(getInventory()))
  })
}

function itemClass (itemIid) {
  return selectedIid.value === itemIid ? 'item border selected-item' : 'item'
}

function onWidthChange () {
  if (window.innerWidth < 600) {
    columns.value = 1
  } else if (window.innerWidth < 1200) {
    columns.value = 2
  } else {
    columns.value = 3
  }
}

async function onSortChange () {
  items.value = sortItems(await fetchItems(getInventory()))
}

function sortItems (its) {
  its.sort((a, b) => { return a[state.inventorySortValue] > b[state.inventorySortValue] ? 1 : -1 })
  return its
}

let watchers = []
onMounted(async () => {
  onWidthChange()
  window.addEventListener('resize', onWidthChange)

  items.value = sortItems(await fetchItems(getInventory()))

  watchers.push(
    watch(() => state.gameState.inventory, async () => {
      if (state.playerModalAs && state.gameState.charmies[state.playerModalAs]) {
        return
      }
      items.value = sortItems(await fetchItems(state.gameState.inventory))
    })
  )

  watchers.push(
    watch(() => state.playerModalAs, async () => {
      items.value = sortItems(await fetchItems(getInventory()))
      unwatchCharmieInventory()
      watchCharmieInventory()
    })
  )
})

onBeforeUnmount(() => {
  watchers.forEach(w => w())
  unwatchCharmieInventory()
  window.removeEventListener('resize', onWidthChange)
})
</script>

<style lang="less" scoped>
.item-table {
  display: flex;
  width: 100%;
}
.scroll-container {
  height: calc(100vh - 75px);
  overflow-y: scroll;
  max-width: 1200px;
  margin: 0 auto;

  &.mini-output-enabled {
    height: calc(100vh - 225px);
  }

  .inventory-summary {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    .cell {
      margin: 5px 5px;
    }
    .summary {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      .money {
        text-align: right;
      }
      .money-brief {
        display: none;
        text-align: right;
      }
      .limit {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        .value {
          text-align: right;
          margin-right: 10px;
        }
        .label {
          text-align: left;
        }
      }
    }
  }
  .sorting {
    margin-bottom: 20px;
    margin-left: 5px;

    .dropdown {
      border: 1px solid rgba(255, 255, 255, 0.24);
      padding: 5px;
      display: inline-block;
      text-align: center;
      width: 5em;
    }
  }
  .inventory {
    width: 33%;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    flex-grow: 1;
    .item-row {
      width: 100%;
      .item {
        width: 100%;
        .name {
          padding: 5px 10px;
          cursor: pointer;
          &.selected {
            background: #121;
          }

          &:hover, &.selected {
            background: #121;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 800px) {
  .scroll-container {
    .inventory {
      width: 50%;
    }
    .inventory-summary {
      .summary {
        .money {
          display: none;
        }
        .money-brief {
          display: block;
        }
      }
    }
  }
}

@media screen and (max-width: 600px) {
  .scroll-container {
    .inventory {
      width: 100%;
    }
    .inventory-summary {
      .summary {
        flex-direction: row;
        justify-content: space-between;
      }
    }
  }
}
</style>