<template>
  <n-collapse-item title="Equipment">
    <EquipmentRow v-for="(item, index) in equipment" :key="index" v-bind="item" v-on:click="clickHandler(item)"></EquipmentRow>
  </n-collapse-item>
</template>

<script setup>
import { state } from '@/composables/state';
import { useWebSocket } from '@/composables/web_socket';
import { watch, reactive } from 'vue';
import { NCollapseItem } from 'naive-ui'
import EquipmentRow from '@/components/side-menu/collapse-items/EquipmentRow.vue'

const { fetchItem } = useWebSocket()
const equipment = reactive([])
const slots = ['head', 'neck', 'shoulders', 'body', 'hands', 'ring', 'ring', 'waist', 'legs', 'feet', 'weapon', 'offhand']

setEquipment(state.gameState.equipment)

watch(state.gameState.equipment, () => {
  setEquipment(state.gameState.equipment)
})

function setEquipment(equipmentIIDs) {
  const equipmentKeys = Object.keys(equipmentIIDs)
  equipmentKeys.forEach(async (key, index) => {
    if (equipmentIIDs[key]) {
      equipment[index] = await fetchItem(equipmentIIDs[key])
    } else equipment[index] = {
      name: false,
      colorName: 'nothing',
      slot: slots[index],
      level: false
    }
  })
}

function clickHandler(item) {
  state.modals.inventoryModal.visible = true
  state.modals.inventoryModal.item = item
  state.modals.inventoryModal.menu = 'equipment'
}
</script>