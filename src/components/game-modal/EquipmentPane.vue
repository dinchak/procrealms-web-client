<template>
  <div :class="getScrollContainerClass()">
    <SelectGameModalAs></SelectGameModalAs>

    <NGrid class="equipment" cols="1">
      <NGi v-for="{ iid, slot, label, color } in getEquipmentLabels()" :key="slot">
        <div class="slot">
          <div class="row" @click="selectIid(iid)">
            <div :class="'label ' + color">{{ label }}</div>
            <div :class="getItemClass(slot)" v-html-safe="iid ? getItemFullName(iid) : 'nothing'"></div>
          </div>
          <div class="row details">
            <ItemDetails :item="selectedItem" :actions="getActions(iid)" v-if="iid && selectedIid == iid"></ItemDetails>
          </div>
        </div>
      </NGi>
    </NGrid>

    <h3 v-if="state.gameModalAs == '' && getPetEid()">Pet Equipment</h3>

    <NGrid class="equipment" cols="1" v-if="state.gameModalAs == '' && getPetEid()">
      <NGi v-for="{ iid, slot, label, color } in getPetEquipmentLabels()" :key="slot">
        <div class="slot">
          <div class="row" @click="selectIid(iid)">
            <div :class="'label ' + color">{{ label }}</div>
            <div :class="getItemClass(slot)" v-html-safe="iid ? getItemFullName(iid) : 'nothing'"></div>
          </div>
          <div class="row details">
            <ItemDetails :item="selectedItem" :actions="getActions(iid)" v-if="iid && selectedIid == iid"></ItemDetails>
          </div>
        </div>
      </NGi>
    </NGrid>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineProps, toRefs } from 'vue'
import { NGrid, NGi } from 'naive-ui'

import ItemDetails from '@/components/game-modal/ItemDetails.vue'
import SelectGameModalAs from '@/components/game-modal/SelectGameModalAs.vue'

import { state, getOrderCmd } from '@/static/state'
import { equipmentLabels, petEquipmentLabels } from '@/static/constants'

import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml, getPetEid } = useHelpers()
const { cmd, fetchItems, fetchItem } = useWebSocket()

const props = defineProps(['miniOutputEnabled'])
const { miniOutputEnabled } = toRefs(props)

const selectedIid = ref(0)
const selectedItem = ref({})
const equipment = ref([])

function getItemClass (slot) {
  let iid = getEquipmentIid(slot)
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
  if (state.gameModalAs && state.gameState.charmies[state.gameModalAs]) {
    return state.gameState.charmies[state.gameModalAs].equipment
  }
  return state.gameState.equipment
}

function getEquipmentLabels () {
  return equipmentLabels.map(({ label, slot, color }) => {
    return { slot, label, color, iid: getEquipmentIid(slot) }
  })
}

function getPetEquipmentLabels () {
  return petEquipmentLabels.map(({ label, slot, color }) => {
    return { slot, label, color, iid: getEquipmentIid(slot) }
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
  selectedItem.value = await fetchItem(iid)
}

function getItemFullName (iid) {
  const item = equipment.value.find(it => it.iid == iid)
  if (!item) {
    return ''
  }
  return ansiToHtml(item.fullName)
}

function getActions (iid) {
  return [{
    label: 'Remove',
    onClick: () => cmd(`${getOrderCmd()}remove iid:${iid}`),
    class: 'bold-red',
    disabled: false
  }]
}

function getScrollContainerClass () {
  return {
    'scroll-container': true,
    'mini-output-enabled': miniOutputEnabled.value
  }
}

let watchers = []
onMounted(async () => {
  let fetchIids = Object.values(getEquipment()).filter(iid => iid)
  equipment.value = await fetchItems(fetchIids)

  watchers.push(
    watch(state.gameState, async () => {
      equipment.value = await fetchItems(Object.values(getEquipment()))
    }),

    watch(() => state.gameModalAs, async () => {
      equipment.value = await fetchItems(Object.values(getEquipment()))
    })
  )
})

onBeforeUnmount(() => {
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
          width: 75px;
          text-align: right;
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