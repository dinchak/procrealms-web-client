<template>
  <div class="auction-sell-container">
    <div class="auction-header">
      <h3>Auction Item</h3>
    </div>

    <div class="sorting">
      <span>Sort by </span>
      <NPopselect v-model:value="state.inventorySortValue" :options="sortOptions" @update:value="onSortChange">
        <span class="dropdown">{{ state.inventorySortValue }}</span>
      </NPopselect>
    </div>

    <div v-if="getItems().length == 0">You don't have anything in your inventory.</div>

    <div class="item-table">
      <div class="inventory" v-for="i in columns" :key="i">
        <div v-for="item in getColumnItems(i - 1)" :key="item.iid" class="item-row">
          <div :class="itemClass(item.iid)">
            <div class="name selectable" v-html-safe="ansiToHtml(item.fullName)" :class="getItemNameClass(item)" @click="selectItem(item)"></div>

            <div class="auction-actions" v-if="selectedIid == item.iid">
              <NInput
                ref="minBinRef"
                v-model:value="minimumBid"
                placeholder="Minimum Bid"
                style="width: 100px;"
              ></NInput>

              <NInput
                v-model:value="buyPrice"
                placeholder="Buy Price"
                style="width: 100px;"
              ></NInput>

              <NButton ghost @click="doSell(item)" type="success">
                <span class="bold-green">Auction Item</span>
              </NButton>
            </div>

            <ItemDetails :item="item" :item-output-id="item.iid" v-if="selectedIid == item.iid"></ItemDetails>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { state, showError } from '@/static/state'
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { NPopselect, NInput, NButton } from 'naive-ui'

import { useHelpers } from '@/composables/helpers'
const { ansiToHtml } = useHelpers()

import { useWebSocket } from '@/composables/web_socket'
const { fetchItems, runCommand } = useWebSocket()

import ItemDetails from '@/components/game-modal/ItemDetails.vue'

const items = ref([])
const selectedIid = ref({})
const search = ref('')
const columns = ref(1)
const minimumBid = ref('')
const buyPrice = ref('')
const minBinRef = ref(null)

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
    minimumBid.value = ''
    return
  }
  selectedIid.value = item.iid
  // minimumBid.value = copperToMoneyString(item.value, true, false)
  nextTick().then(() => {
    if (minBinRef.value && Array.isArray(minBinRef.value)) {
      minBinRef.value[0].focus()
    }
  })
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

function getColumnItems (colIndex) {
  const its = getItems()
  if (!its || its.length === 0) {
    return []
  }
  const perCol = Math.ceil(its.length / columns.value) || 1
  const start = colIndex * perCol
  return its.slice(start, start + perCol)
}

async function doSell (item) {
  if (!minimumBid.value) {
    showError('You must set a minimum bid to auction an item.')
    return
  }

  let cmd = `auction sell iid:${item.iid} minimum=${minimumBid.value}`
  if (buyPrice.value) {
    cmd += ` price=${buyPrice.value}`
  }

  await runCommand(cmd, 'the_void')

  // Reset selection
  selectedIid.value = {}
  minimumBid.value = ''
  buyPrice.value = ''
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
.auction-sell-container {
  max-width: 1200px;
  margin: 0 auto;

  .auction-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    h3 {
      margin: 0;
    }
  }

  .item-table {
    display: flex;
    width: 100%;
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

  .auction-actions {
    padding: 10px 10px 0 10px;
    display: flex;
    gap: 10px;
    background-color: #101216;
    flex-wrap: wrap;
  }
}

</style>