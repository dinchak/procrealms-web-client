<template>
  <n-collapse-item title="Equipment">
    <EquipmentRow
      v-for="slotItem in equipment"
      :key="slotItem.slot"
      v-bind="slotItem"
      v-on:click="clickHandler(slotItem.iid)"
    ></EquipmentRow>
    <ItemModal
        :visible="isModalOpen"
        :isPlayer="props.isPlayer"
        :item="clickedItem"
        :charEId="props.character.eid"
        :name="props.character.name"
        :affects="props.affects"
        menu="equipment"
    ></ItemModal>
  </n-collapse-item>
</template>

<script setup>
import { useWebSocket } from '@/composables/web_socket';
import { watch, ref, onMounted, defineProps } from 'vue';
import { NCollapseItem } from 'naive-ui'

import EquipmentRow from '@/components/side-menu/collapse-items/EquipmentRow.vue'
import ItemModal from '@/components/modals/ItemModal.vue';
import {state} from "@/composables/state";

const { fetchItem, fetchItems } = useWebSocket()

const equipment = ref([])
const isModalOpen = ref(0)
const clickedItem = ref({})
const props = defineProps(['character', 'isPlayer', 'affects', 'equipment'])

onMounted(() => {
  setEquipment()
})

watch(props.equipment, () => {
  setEquipment()
})

async function setEquipment() {
  let iids = Object.values(props.equipment)
  let items = await fetchItems(iids.filter(iid => iid))

  let slots = Object.keys(props.equipment)

  equipment.value = slots.map(slot => {
    let item = items.find(it => it.iid == props.equipment[slot])

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

  props.isPlayer ? state.modals.inventoryModals.playerItemModal = "equipment" : state.modals.inventoryModals.mercItemModal = "equipment"

  let item = await fetchItem(iid)
  isModalOpen.value++
  clickedItem.value = item
}
</script>