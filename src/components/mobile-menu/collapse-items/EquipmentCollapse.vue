<template>
  <NCollapseItem title="Equipment">
    <EquipmentRow
      v-for="{ iid, slot, label, color } in equipmentRows"
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
    ></ItemModal>
  </NCollapseItem>
</template>

<script setup>
import { watch, ref, onMounted, onBeforeUnmount } from 'vue'
import { NCollapseItem } from 'naive-ui'

import EquipmentRow from '@/components/mobile-menu/collapse-items/EquipmentRow.vue'
import ItemModal from '@/components/modals/ItemModal.vue'

import { state } from "@/static/state"
import { equipmentLabels } from '@/static/constants'

import { useWebSocket } from '@/composables/web_socket'

const { fetchItem } = useWebSocket()

const selectedIid = ref('')
const selectedSlot = ref('')
const equipmentRows = ref([])
const item = ref({})

let watchers = []
onMounted(() => {
  equipmentRows.value = getEquipmentRows()
  watchers.push(watch(() => state.gameState.equipment, () => {
    equipmentRows.value = getEquipmentRows()
  }))
})

onBeforeUnmount(() => {
  watchers.forEach(w => w())
})

function getEquipment () {
  if (state.gameModalAs && state.gameState.charmies[state.gameModalAs]) {
    return state.gameState.charmies[state.gameModalAs].equipment
  }
  return state.gameState.equipment
}

function getEquipmentRows () {
  return equipmentLabels.map(({ label, slot, color }) => {
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
    item.value = await fetchItem(iid)
  }
}

</script>