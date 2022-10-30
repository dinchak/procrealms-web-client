<template>
  <n-collapse-item title="Equipment">
    <EquipmentRow
      v-for="slotItem in equipment"
      :key="slotItem.slot"
      v-bind="slotItem"
      v-on:click="clickHandler(slotItem.iid)"
    ></EquipmentRow>
  </n-collapse-item>
</template>

<script setup>
import { state } from '@/composables/state';
import { useWebSocket } from '@/composables/web_socket';
import { watch, ref, onMounted } from 'vue';
import { NCollapseItem } from 'naive-ui'

import EquipmentRow from '@/components/side-menu/collapse-items/EquipmentRow.vue'

const { fetchItem, fetchItems } = useWebSocket()

const equipment = ref([])

onMounted(() => {
  setEquipment()
})

watch(state.gameState.equipment, () => {
  setEquipment()
})

async function setEquipment() {
  let iids = Object.values(state.gameState.equipment)
  let items = await fetchItems(iids.filter(iid => iid))

  let slots = Object.keys(state.gameState.equipment)

  equipment.value = slots.map(slot => {
    let item = items.find(it => it.iid == state.gameState.equipment[slot])

    if (!item) {
      return {
        slot, iid: false, colorName: 'nothing', level: false
      }
    }

    return { slot, iid: item.iid, colorName: item.colorName, level: item.level }
  })
}

async function clickHandler (iid) {
  if (!iid) {
    return
  }

  let item = await fetchItem(iid)
  state.modals.inventoryModal.visible = true
  state.modals.inventoryModal.item = item
  state.modals.inventoryModal.menu = 'equipment'
}
</script>