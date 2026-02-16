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

              <NInput
                v-if="item.amount > 1"
                v-model:value="sellAmount"
                placeholder="Amount"
                type="number"
                :min="1"
                :max="item.amount"
                style="width: 80px;"
              ></NInput>

              <NButton ghost @click="doSell(item)" type="success">
                <span class="bold-green">Auction Item</span>
              </NButton>
            </div>

            <ItemDetails :item="selectedItem" :item-output-id="item.iid" v-if="selectedIid == item.iid"></ItemDetails>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { incrementUiDiagnostic, state, showError, updateCounter } from '@/static/state'
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { NPopselect, NInput, NButton } from 'naive-ui'

import { useHelpers } from '@/composables/helpers'
const { ansiToHtml } = useHelpers()
import { getActiveInventorySource, getInventorySignature, mergeInventorySourceWithFetchedItems, sortItemsByKey } from '@/composables/inventory_helpers'

import { useWebSocket } from '@/composables/web_socket'
const { fetchItem, fetchItems, refreshItem, runCommand } = useWebSocket()

import ItemDetails from '@/components/game-modal/ItemDetails.vue'

const items = ref([])
const selectedIid = ref({})
const selectedItem = ref({})
const search = ref('')
const columns = ref(1)
const minimumBid = ref('')
const buyPrice = ref('')
const sellAmount = ref('')
const minBinRef = ref(null)
let inventoryRefreshToken = 0
let inventoryRefreshTimeout = null
let selectedFetchToken = 0

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

async function selectItem (item) {
  if (selectedIid.value == item.iid) {
    selectedIid.value = {}
    selectedItem.value = {}
    minimumBid.value = ''
    return
  }

  selectedIid.value = item.iid
  const token = ++selectedFetchToken

  const detail = await fetchItem(item.iid)
  if (token !== selectedFetchToken) {
    return
  }
  selectedItem.value = detail || {}

  sellAmount.value = item.amount && item.amount > 0 ? String(item.amount) : ''
  nextTick().then(() => {
    if (minBinRef.value && Array.isArray(minBinRef.value)) {
      minBinRef.value[0].focus()
    }
  })
}

async function mapInventory () {
  const source = getActiveInventorySource(state)
  const fetchedItems = await fetchItems(source.map(i => i.iid))
  return mergeInventorySourceWithFetchedItems(source, fetchedItems)
}

async function refreshInventoryItems () {
  const token = ++inventoryRefreshToken
  incrementUiDiagnostic('auctionSellRefreshes')
  const mapped = await mapInventory()

  if (token !== inventoryRefreshToken) {
    incrementUiDiagnostic('auctionSellStaleDrops')
    return
  }

  items.value = sortItems(mapped)
}

function scheduleInventoryRefresh (delay = 0) {
  if (inventoryRefreshTimeout) {
    clearTimeout(inventoryRefreshTimeout)
  }

  inventoryRefreshTimeout = setTimeout(() => {
    inventoryRefreshTimeout = null
    refreshInventoryItems()
  }, delay)
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
    const charmie = state.gameState.charmies[state.playerModalAs]
    const charmieItems = charmie ? charmie.items : []
    return getInventorySignature(charmieItems)
  }, () => {
    scheduleInventoryRefresh(16)
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
  items.value = sortItems(items.value)
}

function sortItems (its) {
  return sortItemsByKey(its, state.inventorySortValue)
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

  // Determine amount to sell and validate/clamp
  const maxAmt = item.amount && item.amount > 0 ? item.amount : 1
  let amt
  if (maxAmt > 1) {
    if (sellAmount.value === '' || sellAmount.value == null) {
      amt = maxAmt
    } else {
      amt = parseInt(sellAmount.value)
      if (isNaN(amt)) {
        showError('Invalid amount to sell.')
        return
      }
    }
    amt = Math.max(1, Math.min(amt, maxAmt))
  } else {
    amt = 1
  }

  const baseName = (item.name || item.fullName || item.iid)
  const quotedName = (amt > 1) ? `${amt}x ${baseName}` : `${baseName}`
  const safeQuoted = quotedName.replace(/"/g, '\\"')

  let cmd = `auction sell "${safeQuoted}" minimum=${minimumBid.value}`
  if (buyPrice.value) {
    cmd += ` price=${buyPrice.value}`
  }

  await runCommand(cmd, 'the_void')
  await refreshItem(item.iid)
  scheduleInventoryRefresh(16)

  // Reset selection
  selectedIid.value = {}
  selectedItem.value = {}
  minimumBid.value = ''
  buyPrice.value = ''
  sellAmount.value = ''
}

let watchers = []
onMounted(async () => {
  onWidthChange()
  window.addEventListener('resize', onWidthChange)

  await refreshInventoryItems()

  watchers.push(
    watch(() => getInventorySignature(state.gameState.inventory || []), async () => {
      if (state.playerModalAs && state.gameState.charmies[state.playerModalAs]) {
        return
      }
      scheduleInventoryRefresh(16)
    })
  )

  watchers.push(
    watch(() => state.playerModalAs, async () => {
      scheduleInventoryRefresh(16)
      unwatchCharmieInventory()
      watchCharmieInventory()
    })
  )

  watchers.push(
    watch(() => updateCounter.value, () => {
      scheduleInventoryRefresh(16)
    })
  )
})

onBeforeUnmount(() => {
  if (inventoryRefreshTimeout) {
    clearTimeout(inventoryRefreshTimeout)
    inventoryRefreshTimeout = null
  }
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