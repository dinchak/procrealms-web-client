<template>
  <div :class="getScrollContainerClass()">
    <SelectGameModalAs></SelectGameModalAs>
    <NGrid class="equipment" cols="1">
      <NGi v-for="(iid, slot) in state.gameState.equipment" :key="slot">
        <div class="slot">
          <div :class="'row' + (iid ? ' selectable' : '')" @click="selectIid(iid)">
            <div class="label">{{ slot }}</div>
            <div class="item" v-html-safe="iid ? getItemFullName(iid) : 'nothing'"></div>
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
import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'

import ItemDetails from '@/components/game-modal/ItemDetails.vue'
import SelectGameModalAs from './SelectGameModalAs.vue'

const { ansiToHtml } = useHelpers()
const { cmd, fetchItems, fetchItem } = useWebSocket()

const props = defineProps(['miniOutputEnabled'])
const { miniOutputEnabled } = toRefs(props)

const selectedIid = ref(0)
const selectedItem = ref({})
const equipment = ref([])

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
  const item = equipment.value.find(item => item.iid == iid)
  if (!item) {
    return ''
  }
  return ansiToHtml(item.fullName)
}

function getActions (iid) {
  return [{
    label: 'Remove',
    onClick: () => cmd(`remove iid:${iid}`),
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
  equipment.value = await fetchItems(Object.values(state.gameState.equipment))
  
  watchers.push(
    watch(state.gameState, async (newVal) => equipment.value = await fetchItems(Object.values(newVal.equipment)))
  )
})

onBeforeUnmount(() => {
  for (let watcher of watchers) {
    watcher()
  }
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
      font-size: 16px;
      padding: 5px 10px;
      cursor: pointer;
      .row {
        display: flex;
        flex-direction: row;

        &.selectable {
          &:hover, &.selected {
            background: #121;
          }
        }

        &.details {
          padding-left: 105px;
        }

        .label {
          width: 75px;
          text-align: right;
          padding: 0 10px;
        }
        .item {
          flex: 1;
          text-align: left;
          padding: 0 10px;
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