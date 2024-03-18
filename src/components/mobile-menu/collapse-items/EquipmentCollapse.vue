<template>
  <n-collapse-item title="Equipment">
    <EquipmentRow
      v-for="(iid, slot) in equipment"
      :key="slot"
      :itemSlot="slot"
      :item="getItem(iid)"
      v-on:click="clickHandler(iid)"
    ></EquipmentRow>
    <ItemModal
        :visible="selectedItem.iid"
        :isPlayer="isPlayer"
        :item="selectedItem"
        :charEId="character.eid"
        :name="character.name"
        :affects="affects"
        menu="equipment"
    ></ItemModal>
  </n-collapse-item>
</template>

<script setup>
import { ref, defineProps, toRefs, onMounted, onBeforeUnmount, watch } from 'vue'
import { NCollapseItem } from 'naive-ui'

import { state } from "@/composables/state"

import EquipmentRow from '@/components/mobile-menu/collapse-items/EquipmentRow.vue'
import ItemModal from '@/components/modals/ItemModal.vue'

import { useWebSocket } from '@/composables/web_socket'

const { fetchItems } = useWebSocket()

const selectedItem = ref({})

const props = defineProps(['character', 'isPlayer', 'affects', 'equipment'])

const { character, isPlayer, affects, equipment } = toRefs(props)

const items = ref([])

function getItem (iid) {
  return items.value.find(item => item.iid == iid)
}

async function clickHandler (iid) {
  if (!iid) {
    return
  }

  if (isPlayer.value) {
    state.modals.inventoryModals.playerItemModal = "equipment"
  } else {
    state.modals.inventoryModals.mercItemModal = "equipment"
  }

  let item = items.value.find(item => item.iid == iid)
  selectedItem.value = item
}

let watchers = []
onMounted(async () => {
  items.value = await fetchItems(Object.values(equipment.value))
  
  watchers.push(
    watch(equipment.value, async (newVal) => items.value = await fetchItems(Object.values(newVal)))
  )
})

onBeforeUnmount(() => {
  for (let watcher of watchers) {
    watcher()
  }
})

</script>