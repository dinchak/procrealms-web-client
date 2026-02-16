<template>
  <NCollapseItem title="Equipment">
    <EquipmentRow
      v-for="{ iid, slot } in equipmentRows"
      :key="slot"
      :itemSlot="slot"
      :iid="iid"
      :selected="selectedIid && selectedIid == iid"
      v-on:click="clickHandler(iid, slot)"
    ></EquipmentRow>
    <div class="equipment-header" v-if="petEquipmentRows?.length > 0">Pet equipment</div>
    <EquipmentRow
        v-for="{ iid, slot } in petEquipmentRows"
        :key="slot"
        :itemSlot="slot"
        :iid="iid"
        :selected="selectedIid && selectedIid == iid"
        v-on:click="clickHandler(iid, slot)"
    ></EquipmentRow>
    <ItemModal
      v-if="getEquipment()[selectedSlot]"
      :item="item"
      mode="equipment"
      @closeItemModal="closeItemModal"
    ></ItemModal>
  </NCollapseItem>
</template>

<script setup>
import { watch, ref, onMounted, onBeforeUnmount } from 'vue'
import { NCollapseItem } from 'naive-ui'

import EquipmentRow from '@/components/mobile-menu/collapse-items/EquipmentRow.vue'
import ItemModal from '@/components/modals/ItemModal.vue'

import { state } from "@/static/state"
import { EQUIPMENT_LABELS, PET_EQUIPMENT_LABELS } from '@/static/constants'

import { useWebSocket } from '@/composables/web_socket'

const { fetchItem } = useWebSocket()

const selectedIid = ref('')
const selectedSlot = ref('')
const equipmentRows = ref([])
const petEquipmentRows = ref([])
const item = ref({})
let selectedFetchToken = 0

function refreshRows () {
  equipmentRows.value = getEquipmentRows(EQUIPMENT_LABELS)
  petEquipmentRows.value = getEquipmentRows(PET_EQUIPMENT_LABELS)
}

let watchers = []
onMounted(() => {
  refreshRows()

  watchers.push(watch(
    () => [state.playerModalAs, ...Object.values(getEquipment())].join('|'),
    () => {
      refreshRows()
    }
  ))
})

onBeforeUnmount(() => {
  watchers.forEach(w => w())
})

function getEquipment () {
  if (state.playerModalAs && state.gameState.charmies[state.playerModalAs]) {
    return state.gameState.charmies[state.playerModalAs].equipment
  }
  return state.gameState.equipment
}

function getEquipmentRows (labels) {
  return labels.map(({ label, slot, color }) => {
    return { slot, label, color, iid: getEquipment()[slot] }
  })
}

async function clickHandler (iid, slot) {
  if (!iid) {
    return
  }

  if (selectedIid.value && selectedIid.value == iid) {
    selectedIid.value = ''
    selectedSlot.value = ''
    item.value = {}
  } else {
    selectedIid.value = iid
    selectedSlot.value = slot
    const token = ++selectedFetchToken
    const fetched = await fetchItem(iid)

    if (token !== selectedFetchToken) {
      return
    }

    item.value = fetched || {}
  }
}

function closeItemModal (value) {
  if (value === 'equipment') {
    selectedIid.value = ''
    selectedSlot.value = ''
    item.value = {}
  }
}

</script>
<style lang="less">
.equipment-header {
  margin: 10px 0;
}
</style>