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
          <div class="trade-name bold-yellow">{{ shopkeeper.name }}</div>
          <div class="trade-label">
            <span class="black">[</span><span class="magenta">Items For Sale</span><span class="black">]</span>
          </div>
          <div class="shop-inventory">
            <div v-for="item in shopItems" :key="item.iid" class="item-row">
              <div :class=itemClass(item.iid)>
                <div class="name selectable" v-html-safe="ansiToHtml(item.fullName)" :class="getItemNameClass(item)" @click="selectItem(item)"></div>
                  <ItemDetails :item="item" :actions="getBuyActions(item)" v-if="selectedIid == item.iid"></ItemDetails>
              </div>
            </div>
          </div>
        </div>

        <div class="trade-column">
          <div class="trade-name bold-white" v-html-safe="copperToMoneyString(state.gameState.player.money)">
          </div>
          <div class="trade-label">
            <span class="black">[</span><span class="cyan">Your Inventory</span><span class="black">]</span>
          </div>
          <div class="player-inventory">
            <div v-for="item in playerItems" :key="item.iid" class="item-row">
              <div :class=itemClass(item.iid)>
                <div class="name selectable" v-html-safe="ansiToHtml(item.fullName)" :class="getItemNameClass(item)" @click="selectItem(item)"></div>
                  <ItemDetails :item="item" :actions="getSellActions(item)" v-if="selectedIid == item.iid"></ItemDetails>
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
import { state } from '@/static/state'

import GameModal from '@/components/modals/GameModal.vue'
import ItemDetails from '@/components/game-modal/ItemDetails.vue'

import { useWebSocket } from '@/composables/web_socket'
const { runCommand, fetchItems, fetchEntity } = useWebSocket()

import { useHelpers } from '@/composables/helpers'
const { ansiToHtml, copperToMoneyString, runAndUpdate } = useHelpers()

const shopItems = ref([])
const playerItems = ref([])
const shopkeeper = ref({ name: 'Loading...' })
const selectedIid = ref('')
let watchers = []

function getBuyActions (item) {
  let actions = []

  actions.push({
    label: 'Examine',
    onClick: () => runAndUpdate('examine', item),
    class: 'bold-cyan',
    disabled: false
  })

  if (['armor', 'weapon'].includes(item.type)) {
    actions.push({
      label: 'Compare',
      onClick: () => runAndUpdate('compare', item),
      class: 'bold-magenta',
      disabled: false
    })
  }

  actions.push({
    label: 'Buy',
    onClick: async () => {
      await runAndUpdate('buy', item)
      runCommand('list', 'the_void')
    },
    class: 'bold-green',
    disabled: false
  })

  if (item.amount > 1) {
    actions.push({
      label: 'Buy All',
      onClick: async () => {
        await runAndUpdate('buy all', item)
        runCommand('list', 'the_void')
      },
      class: 'bold-green',
      disabled: false
    })
  }

  return actions
}

function getSellActions (item) {
  let actions = []

  actions.push({
    label: 'Sell',
    onClick: async () => {
      await runAndUpdate('sell', item)
      runCommand('list', 'the_void')
    },
    class: 'bold-red',
    disabled: false
  })

  if (item.amount > 1) {
    actions.push({
      label: 'Sell All',
      onClick: async () => {
        await runAndUpdate('sell all', item)
        runCommand('list', 'the_void')
      },
      class: 'bold-red',
      disabled: false
    })
  }

  return actions
}

function onModalOpened () {
  state.shop.shopkeeper = ''
  state.shop.items = []

  runCommand('list', 'the_void')

  watchers.push(watch(() => state.shop.items, async newItemIids => {
    console.log(`Shop items updated`)
    shopItems.value = await fetchItems(newItemIids)
  }, { immediate: true }))

  watchers.push(watch(() => state.shop.shopkeeper, async newShopkeeperId => {
    shopkeeper.value = await fetchEntity(newShopkeeperId)
  }, { immediate: true }))

  watchers.push(watch(() => state.gameState.inventory, async newItemIids => {
    playerItems.value = await fetchItems(newItemIids)
  }, { immediate: true }))
}

function onModalClosed () {
  watchers.forEach(unwatch => unwatch())
}

function itemClass (itemIid) {
  return selectedIid.value === itemIid ? 'item border selected-item' : 'item'
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
</script>

<style lang="less" scoped>
.trade-container {
  max-width: 850px;
  margin: 0 auto;

  .trade-columns {
    display: flex;
    flex-direction: row;

    .trade-column {
      display: flex;
      flex-direction: column;
      flex-basis: 50%;

      .trade-label {
        margin: 2px 0 10px 0;
        padding-bottom: 10px;
        border-bottom: 1px solid #333;
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