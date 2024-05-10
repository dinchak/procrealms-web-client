<template>
  <div :class="getScrollContainerClass()">
    <SelectGameModalAs></SelectGameModalAs>

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

    <NGrid class="inventory" cols="1 800:2 1200:3">
      <NGi v-if="getItems().length == 0">You don't have anything in your inventory.</NGi>

      <NGi v-for="item in getItems()" :key="item.iid">
        <div class="item">
          <div class="name selectable" v-html-safe="ansiToHtml(item.fullName)" :class="getItemNameClass(item)" @click="selectItem(item)"></div>

          <ItemDetails :item="item" :actions="getActions(item)" v-if="selectedIid == item.iid"></ItemDetails>

        </div>
      </NGi>

    </NGrid>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineProps, toRefs } from 'vue'
import { NGrid, NGi, NInput } from 'naive-ui'
import { state, getOrderCmd } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

import ItemDetails from '@/components/game-modal/ItemDetails.vue'
import SelectGameModalAs from '@/components/game-modal/SelectGameModalAs.vue'

const { ansiToHtml, copperToMoneyString } = useHelpers()
const { fetchItems, fetchItem, cmd } = useWebSocket()

const props = defineProps(['miniOutputEnabled'])
const { miniOutputEnabled } = toRefs(props)

const items = ref([])
const selectedIid = ref({})
const search = ref('')

function getItems () {
  if (search.value) {
    return items.value.filter(item => item.fullName.toLowerCase().includes(search.value.toLowerCase()))
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

async function updateItem (iid) {
  delete state.cache.itemCache[iid]
  let oldItem = items.value[items.value.findIndex(i => i.iid == iid)]
  let newItem = await fetchItem(iid)
  items.value[items.value.findIndex(i => i.iid == iid)] = newItem
  if (selectedIid.value == oldItem.iid) {
    selectedIid.value = newItem.iid
  }
}

function getActions (item) {
  let actions = [{
    label: 'Drop',
    onClick: () => cmd(`${getOrderCmd()}drop iid:${item.iid}`),
    class: 'bold-red',
    disabled: false
  }]

  if (item.keeping) {
    actions.push({
      label: 'Unkeep',
      onClick: () => {
        cmd(`${getOrderCmd()}unkeep iid:${item.iid}`)
        updateItem(item.iid)
      },
      class: 'bold-yellow',
      disabled: false
    })
  } else {
    actions.push({
      label: 'Keep',
      onClick: () => {
        cmd(`${getOrderCmd()}keep iid:${item.iid}`)
        updateItem(item.iid)
      },
      class: 'bold-green',
      disabled: false
    })
  }

  if (item.type == 'consumable') {
    if (item.subtype == 'food') {
      actions.push({
        label: 'Eat',
        onClick: () => cmd(`${getOrderCmd()}eat iid:${item.iid}`),
        class: 'bold-green',
        disabled: false
      })
    } else if (item.subtype == 'potion') {
      actions.push({
        label: 'Drink',
        onClick: () => cmd(`${getOrderCmd()}drink iid:${item.iid}`),
        class: 'bold-green',
        disabled: false
      })
    } else {
      actions.push({
        label: 'Consume',
        onClick: () => cmd(`${getOrderCmd()}consume iid:${item.iid}`),
        class: 'bold-green',
        disabled: false
      })
    }
  }

  if (state.gameState.room.flags.includes('store')) {
    actions.push({
      label: 'Sell',
      onClick: () => cmd(`${getOrderCmd()}sell iid:${item.iid}`),
      class: 'bold-green',
      disabled: false
    })
  } else {
    actions.push({
      label: 'Sell',
      onClick: () => cmd(`${getOrderCmd()}sell iid:${item.iid}`),
      class: 'bold-green',
      disabled: true
    })
  }

  if (item.type == 'weapon') {
    actions.push({
      label: 'Wield',
      onClick: () => cmd(`${getOrderCmd()}wield iid:${item.iid}`),
      class: 'bold-red',
      disabled: false
    })
  }

  if (item.type == 'armor') {
    actions.push({
      label: 'Wear',
      onClick: () => cmd(`${getOrderCmd()}wear iid:${item.iid}`),
      class: 'bold-red',
      disabled: false
    })
  }

  if (item.type == 'weapon' || item.type == 'armor') {
    actions.push({
      label: 'Compare',
      onClick: () => cmd(`${getOrderCmd()}compare iid:${item.iid}`),
      class: 'bold-yellow',
      disabled: false
    })
  }

  if (item.type == 'weapon' || item.type == 'armor' || item.type == 'tool' || item.type == 'bag') {
    if (hasSkillsRequired(item)) {
      actions.push({
        label: 'Salvage',
        onClick: () => cmd(`${getOrderCmd()}salvage iid:${item.iid}`),
        class: 'bold-yellow',
        disabled: false
      })
      if (item.type == 'tool') {
        actions.push({
          label: 'Repair',
          onClick: () => cmd(`${getOrderCmd()}repair iid:${item.iid}`),
          class: 'bold-yellow',
          disabled: false
        })
      }
    }
  }

  if (item.type == 'material') {
    if (item.subtype == 'hide') {
      actions.push({
        label: 'Tan',
        onClick: () => cmd(`${getOrderCmd()}tan iid:${item.iid}`),
        class: 'bold-yellow',
        disabled: false
      })
    }
    
    if (item.subtype == 'seed') {
      actions.push({
        label: 'Plant',
        onClick: () => cmd(`${getOrderCmd()}plant iid:${item.iid}`),
        class: 'bold-yellow',
        disabled: false
      })
    }

    if (item.subtype == 'bandage') {
      actions.push({
        label: 'Wrap',
        onClick: () => cmd(`${getOrderCmd()}wrap iid:${item.iid}`),
        class: 'bold-yellow',
        disabled: false
      })
    }

    if (item.subtype == 'fish') {
      actions.push({
        label: 'Filet',
        onClick: () => cmd(`${getOrderCmd()}filet iid:${item.iid}`),
        class: 'bold-yellow',
        disabled: false
      })
    }
  }

  if (item.type == 'book' || item.type == 'scroll') {
    actions.push({
      label: 'Read',
      onClick: () => cmd(`${getOrderCmd()}read iid:${item.iid}`),
      class: 'bold-magenta',
      disabled: false
    })
  }

  if (item.type == 'tool') {
    if (item.subtype == 'penned animal') {
      actions.push({
        label: 'Unpen',
        onClick: () => cmd(`${getOrderCmd()}unpen iid:${item.iid}`),
        class: 'bold-yellow',
        disabled: false
      })
    }

    if (item.subtype == 'deployable') {
      actions.push({
        label: 'Unpack',
        onClick: () => cmd(`${getOrderCmd()}unpack iid:${item.iid}`),
        class: 'bold-yellow',
        disabled: false
      })
    }
  }

  return actions
}

function hasSkillsRequired (item) {
  if (!item.skillsRequired || item.skillsRequired.length == 0) {
    return false
  }

  for (let skill of item.skillsRequired) {
    let playerSkill = state.gameState.skills[skill.name]
    if (!playerSkill || playerSkill.level < skill.level) {
      return false
    }
  }

  return true
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

function getScrollContainerClass () {
  return {
    'scroll-container': true,
    'mini-output-enabled': miniOutputEnabled.value
  }
}

function getInventory () {
  if (state.gameModalAs && state.gameState.charmies[state.gameModalAs]) {
    return state.gameState.charmies[state.gameModalAs].items || []
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
  if (!state.gameModalAs || !state.gameState.charmies[state.gameModalAs]) {
    return
  }

  charmieInventoryWatcher = watch(() => {
    return state.gameState.charmies[state.gameModalAs] ? state.gameState.charmies[state.gameModalAs].items : []
  }, async () => {
    items.value = await fetchItems(getInventory())
  })
}

let watchers = []
onMounted(async () => {
  items.value = await fetchItems(getInventory())
  
  watchers.push(
    watch(() => state.gameState.inventory, async () => {
      if (state.gameModalAs && state.gameState.charmies[state.gameModalAs]) {
        return
      }
      items.value = await fetchItems(state.gameState.inventory)
    })
  )

  watchers.push(
    watch(() => state.gameModalAs, async () => {
      items.value = await fetchItems(getInventory())
      unwatchCharmieInventory()
      watchCharmieInventory()
    })
  )
})


onBeforeUnmount(() => {
  for (let watcher of watchers) {
    watcher()
  }
  unwatchCharmieInventory()
})
</script>

<style lang="less" scoped>
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
  .inventory {
    .item {
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

@media screen and (max-width: 800px) {
  .scroll-container {
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
    .inventory-summary {
      .summary {
        flex-direction: row;
        justify-content: space-between;
      }
    }
  }
}
</style>