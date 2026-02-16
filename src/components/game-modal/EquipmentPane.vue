<template>
  <div :class="getScrollContainerClass()">
    <SelectPlayerModalAs></SelectPlayerModalAs>

    <NGrid class="equipment-grid"  cols="1 800:2">
      <NGi>
        <h3>Equipment</h3>
        <NGrid class="equipment" cols="1">
          <NGi v-for="{ iid, slot, label, color } in getEquipmentLabels()" :key="iid">
            <div class="slot">
              <div class="row" @click="selectIid(iid)">
                <div :class="'label ' + color">{{ label }}</div>
                <div :class="getItemClass(slot)" v-html-safe="getItemFullName(iid)"></div>
              </div>
              <div class="row details">
                <ItemDetails :item="selectedItem" :actions="getActions(iid)" :item-output-id="iid" v-if="iid && selectedIid == iid"></ItemDetails>
              </div>
            </div>
          </NGi>
        </NGrid>

        <h3 v-if="state.playerModalAs == '' && getPetEid()">Pet Equipment</h3>
        <NGrid class="equipment" cols="1" v-if="state.playerModalAs == '' && getPetEid()">
          <NGi v-for="{ iid, slot, label, color } in getPetEquipmentLabels()" :key="iid">
            <div class="slot">
              <div class="row" @click="selectIid(iid)">
                <div :class="'label ' + color">{{ label }}</div>
                <div :class="getItemClass(slot)" v-html-safe="getItemFullName(iid)"></div>
              </div>
              <div class="row details">
                <ItemDetails :item="selectedItem" :actions="getActions(iid)" :item-output-id="iid" v-if="iid && selectedIid == iid"></ItemDetails>
              </div>
            </div>
          </NGi>
        </NGrid>

      </NGi>
      <NGi>
        <h3>Tools</h3>
        <NGrid class="equipment" cols="1">
          <NGi v-for="{ iid, slot, label, color } in getToolLabels()" :key="slot">
            <div class="slot">
              <div class="row" @click="selectIid(iid)">
                <div :class="'label ' + color">{{ label }}</div>
                <div :class="getItemClass(slot)" v-html-safe="getItemFullName(iid)"></div>
              </div>
              <div class="row details">
                <ItemDetails :item="selectedItem" :actions="getActions(iid)" :item-output-id="iid" v-if="iid && selectedIid == iid"></ItemDetails>
              </div>
            </div>
          </NGi>
        </NGrid>
      </NGi>
    </NGrid>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps, toRefs, watch } from 'vue'
import { NGrid, NGi } from 'naive-ui'

import ItemDetails from '@/components/game-modal/ItemDetails.vue'
import SelectPlayerModalAs from '@/components/game-modal/SelectPlayerModalAs.vue'

import { state } from '@/static/state'

import {
  EQUIPMENT_LABELS,
  PET_EQUIPMENT_LABELS,
  TOOL_LABELS
} from '@/static/constants'

import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml, getPetEid, getActions } = useHelpers()
const { fetchItems, fetchItem } = useWebSocket()
const IS_DEVELOPMENT = import.meta.env.MODE == 'development'

const props = defineProps(['miniOutputEnabled'])
const { miniOutputEnabled } = toRefs(props)

const selectedIid = ref(0)
const selectedItem = ref({})

const cacheCounter = ref(0)
let equipmentRefreshToken = 0
let equipmentRefreshTimeout = null
let selectedFetchToken = 0

function incrementUiDiagnostic (key, amount = 1) {
  if (!IS_DEVELOPMENT) {
    return
  }

  state.diagnostics.ui[key] = (state.diagnostics.ui[key] || 0) + amount
}

function getFetchIids () {
  return Object.values(getEquipment())
    .filter(iid => iid)
    .concat(
      Object.values(getTools())
        .filter(iid => iid)
    )
}

async function refreshEquipmentItems () {
  const token = ++equipmentRefreshToken
  incrementUiDiagnostic('equipmentPaneRefreshes')
  await fetchItems(getFetchIids())

  if (token !== equipmentRefreshToken) {
    incrementUiDiagnostic('equipmentPaneStaleDrops')
    return
  }

  cacheCounter.value += 1
}

function scheduleEquipmentRefresh (delay = 0) {
  if (equipmentRefreshTimeout) {
    clearTimeout(equipmentRefreshTimeout)
  }

  equipmentRefreshTimeout = setTimeout(() => {
    equipmentRefreshTimeout = null
    refreshEquipmentItems()
  }, delay)
}

function getItemClass (slot) {
  let iid = getEquipmentIid(slot) || getToolIid(slot)
  let classes = ['item']

  if (iid) {
    classes.push('selectable')
  }

  if (iid && selectedIid.value == iid) {
    classes.push('selected')
  }

  return classes.join(' ')
}

function getEquipmentIid (slot) {
  return getEquipment()[slot]
}

function getEquipment () {
  if (state.playerModalAs && state.gameState.charmies[state.playerModalAs]) {
    return state.gameState.charmies[state.playerModalAs].equipment
  }
  return state.gameState.equipment
}

function getToolIid (slot) {
  return getTools()[slot]
}

function getTools () {
  if (state.playerModalAs && state.gameState.charmies[state.playerModalAs]) {
    return {}
  }
  return state.gameState.tools
}

function getEquipmentLabels () {
  return EQUIPMENT_LABELS.map(({ label, slot, color }) => {
    return { slot, label, color, iid: getEquipmentIid(slot) }
  })
}

function getPetEquipmentLabels () {
  return PET_EQUIPMENT_LABELS.map(({ label, slot, color }) => {
    return { slot, label, color, iid: getEquipmentIid(slot) }
  })
}

function getToolLabels () {
  return TOOL_LABELS.map(({ label, slot, color }) => {
    return { slot, label, color, iid: getToolIid(slot) }
  })
}

async function selectIid (iid) {
  if (!iid) {
    return
  }

  if (selectedIid.value == iid) {
    selectedIid.value = 0
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

function getItemFullName (iid) {
  if (!iid) {
    return 'nothing'
  }

  if (state.cache.itemCache[iid]) {
    return ansiToHtml(state.cache.itemCache[iid].item.fullName)
  }

  return 'nothing'
}

function getScrollContainerClass () {
  return {
    'scroll-container': true,
    'mini-output-enabled': miniOutputEnabled.value
  }
}

let watchers = []
onMounted(() => {
  scheduleEquipmentRefresh(0)

  watchers.push(
    watch(
      () => Object.values(getEquipment()).filter(Boolean).join('|'),
      () => {
        scheduleEquipmentRefresh(0)
      }
    )
  )

  watchers.push(
    watch(
      () => state.playerModalAs,
      () => {
        scheduleEquipmentRefresh(0)
      }
    )
  )

  watchers.push(
    watch(
      () => Object.values(getTools()).filter(Boolean).join('|'),
      () => {
        scheduleEquipmentRefresh(0)
      }
    )
  )
})

onBeforeUnmount(() => {
  if (equipmentRefreshTimeout) {
    clearTimeout(equipmentRefreshTimeout)
    equipmentRefreshTimeout = null
  }
  watchers.forEach(w => w())
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

  .equipment {
    .slot {
      display: flex;
      flex-direction: column;
      cursor: pointer;

      .row {
        display: flex;
        flex-direction: row;

        &.details {
          padding-left: 100px;
        }

        .label {
          width: 120px;
          text-align: right;
          font-size: 0.9rem;
          padding: 5px 10px;
        }

        .item {
          text-align: left;
          padding: 5px 10px;
          &.selectable {
            &:hover, &.selected {
              background: #121;
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 500px) {
  .scroll-container {
    .equipment {
      .slot {
        .row {
          &.details {
            padding-left: 0;
          }
        }
      }
    }
  }
}
</style>