<template>
  <GameModal
    v-model="state.modals.tradeModal"
    title="Trade Menu"
    modal-class="trade-modal"
    modal-key="tradeModal"
    @opened="onModalOpened"
    @closed="onModalClosed"
  >
    <div class="trade-container">
      <div class="trade-columns">

        <div class="trade-column">
          <div class="trade-name bold-magenta">Items For Sale</div>
          <div class="trade-label">
            <span class="bold-yellow">{{ shopkeeper.name }}</span>

            <div class="filters">
              <div class="sorting">
                <span>Sort by </span>
                <NPopselect v-model:value="shopkeeperSortValue" :options="sortOptions" @update:value="onShopkeeperSortChange">
                  <span class="dropdown">{{ shopkeeperSortValue }}</span>
                </NPopselect>
              </div>

              <div class="only-usable">
                <input type="checkbox" v-model="onlyUsableItems" id="onlyUsableItems" @change="updateItemList()"/>
                <label for="onlyUsableItems">Only Usable</label>
              </div>
            </div>

          </div>
          <div class="shop-inventory">
            <div v-for="{ name, iid } in state.shop.items" :key="iid" class="item-row">
              <div :class=itemClass(iid)>
                <div class="name selectable" v-html-safe="ansiToHtml(name)" :class="getItemNameClass(iid)" @click="selectItem(iid)"></div>
                  <ItemDetails :item="selectedItem" :actions="getBuyActions(selectedItem)" :item-output-id="iid" v-if="selectedIid == iid"></ItemDetails>
              </div>
            </div>
          </div>
        </div>

        <div class="trade-column">
          <div class="trade-name bold-cyan">Your Inventory</div>
          <div class="trade-label">
            <span class="cyan" v-html-safe="copperToMoneyString(state.gameState.player.money)"></span>

            <div class="filters">
              <div class="sorting">
                <span>Sort by </span>
                <NPopselect v-model:value="state.inventorySortValue" :options="sortOptions" @update:value="onInventorySortChange">
                  <span class="dropdown">{{ state.inventorySortValue }}</span>
                </NPopselect>
              </div>
            </div>

          </div>
          <div class="player-inventory">
            <div v-for="item in playerItems" :key="item.iid" class="item-row">
              <div :class=itemClass(item.iid)>
                <div class="name selectable" v-html-safe="ansiToHtml(item.fullName)" :class="getItemNameClass(item)" @click="selectItem(item.iid)"></div>
                  <ItemDetails :item="item" :actions="getSellActions(item)" :item-output-id="item.iid" v-if="selectedIid == item.iid"></ItemDetails>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </GameModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { NPopselect } from 'naive-ui'
import { incrementUiDiagnostic, state, updateCounter } from '@/static/state'

import GameModal from '@/components/modals/GameModal.vue'
import ItemDetails from '@/components/game-modal/ItemDetails.vue'

import { useWebSocket } from '@/composables/web_socket'
const { runCommand, fetchItems, fetchEntity, fetchItem } = useWebSocket()

import { useHelpers } from '@/composables/helpers'
const { ansiToHtml, copperToMoneyString, runItemAction, getActions } = useHelpers()
import { getInventorySignature, mergeInventorySourceWithFetchedItems, sortItemsByKey } from '@/composables/inventory_helpers'

const shopItems = ref([])
const playerItems = ref([])
const shopkeeper = ref({ name: 'Loading...' })
const selectedIid = ref('')
const selectedItem = ref({})
const shopkeeperSortValue = ref('name')
const onlyUsableItems = ref(false)
let shopRefreshToken = 0
let playerRefreshToken = 0
let selectedFetchToken = 0
let shopkeeperFetchToken = 0
let shopRefreshTimeout = null
let playerRefreshTimeout = null

let watchers = []

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

function getBuyActions (item) {
  let actions = []

  actions.push({
    label: 'Buy',
    onClick: async () => {
      await runItemAction('buy', item)
      updateItemList()
    },
    class: 'bold-green',
    disabled: false
  })

  if (item.amount > 1) {
    actions.push({
      label: 'Buy All',
      onClick: async () => {
        await runItemAction('buy all', item)
        updateItemList()
      },
      class: 'bold-green',
      disabled: false
    })
  }

  actions.push({
    label: 'Examine',
    onClick: () => runItemAction('examine', item),
    class: 'bold-cyan',
    disabled: false
  })

  if (['armor', 'weapon'].includes(item.type)) {
    actions.push({
      label: 'Compare',
      onClick: () => runItemAction('compare', item),
      class: 'bold-magenta',
      disabled: false
    })
  }

  return actions
}

async function refreshShopItems () {
  const token = ++shopRefreshToken
  incrementUiDiagnostic('tradeShopRefreshes')
  const iids = state.shop.items.map(it => it.iid)
  const fetchedItems = await fetchItems(iids)

  if (token !== shopRefreshToken) {
    incrementUiDiagnostic('tradeShopStaleDrops')
    return
  }

  shopItems.value = sortShopkeeperItems(fetchedItems)
}

function scheduleShopRefresh (delay = 16) {
  if (shopRefreshTimeout) {
    clearTimeout(shopRefreshTimeout)
  }

  shopRefreshTimeout = setTimeout(() => {
    shopRefreshTimeout = null
    refreshShopItems()
  }, delay)
}

async function refreshPlayerItems () {
  const token = ++playerRefreshToken
  incrementUiDiagnostic('tradePlayerRefreshes')
  const sourceItems = state.gameState.inventory || []
  const iids = sourceItems.map(it => it.iid)
  const fetchedItems = await fetchItems(iids)

  if (token !== playerRefreshToken) {
    incrementUiDiagnostic('tradePlayerStaleDrops')
    return
  }

  const mergedItems = mergeInventorySourceWithFetchedItems(sourceItems, fetchedItems)
  playerItems.value = sortPlayerItems(mergedItems)
}

function schedulePlayerRefresh (delay = 16) {
  if (playerRefreshTimeout) {
    clearTimeout(playerRefreshTimeout)
  }

  playerRefreshTimeout = setTimeout(() => {
    playerRefreshTimeout = null
    refreshPlayerItems()
  }, delay)
}

function getShopSignature () {
  return getInventorySignature(state.shop.items || [])
}

async function refreshShopkeeperEntity (eid) {
  const token = ++shopkeeperFetchToken
  const entity = await fetchEntity(eid)

  if (token !== shopkeeperFetchToken) {
    return
  }

  shopkeeper.value = entity || { name: 'Loading...' }
}

function getSellActions (item) {
  let actions = getActions(item)
  actions = actions.filter(ac => !['Sell', 'Sell All'].includes(ac.label))

  let sellLabel = 'Sell'
  if (item.amount > 1) {
    sellLabel = 'Sell 1x'
  }

  actions.unshift({
    label: sellLabel,
    onClick: async () => {
      await runItemAction('sell', item)
      updateItemList()
    },
    class: 'bold-red',
    disabled: false
  })

  if (item.amount > 1) {
    actions.unshift({
      label: 'Sell All',
      onClick: async () => {
        await runItemAction('sell all', item)
        updateItemList()
      },
      class: 'bold-red',
      disabled: false
    })
  }

  return actions
}

function updateItemList () {
  let cmd = `list`
  if (onlyUsableItems.value) {
    cmd += ` usable`
  }
  runCommand(cmd, 'the_void')
}

function onModalOpened () {
  state.shop.shopkeeper = ''
  state.shop.items = []

  updateItemList()

  watchers.push(watch(() => getShopSignature(), () => {
    scheduleShopRefresh(16)
  }, { immediate: true }))

  watchers.push(watch(() => state.shop.shopkeeper, async newShopkeeperId => {
    if (!newShopkeeperId) {
      shopkeeper.value = { name: 'Loading...' }
      return
    }

    refreshShopkeeperEntity(newShopkeeperId)
  }, { immediate: true }))

  watchers.push(watch(() => getInventorySignature(state.gameState.inventory || []), () => {
    schedulePlayerRefresh(16)
  }, { immediate: true }))

  watchers.push(watch(() => updateCounter.value, () => {
    schedulePlayerRefresh(16)
  }))
}

function onModalClosed () {
  watchers.forEach(unwatch => unwatch())
  watchers = []

  if (shopRefreshTimeout) {
    clearTimeout(shopRefreshTimeout)
    shopRefreshTimeout = null
  }

  if (playerRefreshTimeout) {
    clearTimeout(playerRefreshTimeout)
    playerRefreshTimeout = null
  }

  state.shop.shopkeeper = ''
  state.shop.items = []
  state.shop.prices = []

  shopItems.value = []
  playerItems.value = []

  state.inventoryOutput = {}
}

function itemClass (itemIid) {
  return selectedIid.value === itemIid ? 'item border selected-item' : 'item'
}

function getItemNameClass (iid) {
  return selectedIid.value == iid ? 'selected' : ''
}

async function selectItem (iid) {
  if (selectedIid.value == iid) {
    selectedIid.value = ''
    selectedItem.value = {}
    return
  }
  selectedIid.value = iid
  const token = ++selectedFetchToken
  const detail = await fetchItem(iid)
  if (token !== selectedFetchToken) {
    return
  }
  selectedItem.value = detail || {}
}

function onInventorySortChange () {
  playerItems.value = sortPlayerItems(playerItems.value)
}

function sortPlayerItems (items) {
  return sortItemsByKey(items, state.inventorySortValue)
}

function onShopkeeperSortChange () {
  shopItems.value = sortShopkeeperItems(shopItems.value)
}

function sortShopkeeperItems (items) {
  return sortItemsByKey(items, shopkeeperSortValue.value)
}

</script>

<style lang="less" scoped>
.trade-container {
  max-width: 850px;
  margin: 0 auto;

  .trade-columns {
    display: flex;
    flex-direction: row;
    gap: 10px;

    .trade-column {
      display: flex;
      flex-direction: column;
      flex-basis: 50%;

      .trade-label {
        height: 40px;
        margin: 2px 0 5px 0;
        padding-bottom: 5px;
        border-bottom: 1px solid #333;
        .filters {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          gap: 20px;
          align-items: center;

          .only-usable {
            input[type="checkbox"] {
              margin: 0 5px 0 0;
              padding: 0;
              accent-color: #383;
            }
          }

          .sorting {
            .dropdown {
              border: 1px solid rgba(255, 255, 255, 0.24);
              padding: 0px 5px;
              display: inline-block;
              cursor: pointer;
            }
          }
        }
      }

      .shop-inventory, .player-inventory {
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
  }
}

@media screen and (max-width: 800px) {
  .trade-container {
    .trade-columns {
      flex-direction: column;

      .trade-column {
        flex-basis: 100%;

        .trade-name {
          margin-top: 20px;
        }
      }
    }
  }
}
</style>