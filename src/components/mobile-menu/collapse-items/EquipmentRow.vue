<template>
  <div :class="getEquipmentRowClass()">
    <div class="slot">{{ itemSlot }}</div>
    <div class="item" v-if="iid" v-html-safe="ansiToHtml(getItemName())"></div>
    <div class="item" v-if="!iid">Nothing</div>
  </div>
</template>

<script setup>
import { watch, defineProps, toRefs, ref, onMounted, onBeforeUnmount } from 'vue'

import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const { fetchItem } = useWebSocket()
const { ansiToHtml } = useHelpers()

const props = defineProps(['iid', 'itemSlot', 'selected'])

const { iid, itemSlot, selected } = toRefs(props)
const item = ref({})
let fetchToken = 0

async function refreshItemFromIid (nextIid) {
  const token = ++fetchToken

  if (!nextIid) {
    item.value = {}
    return
  }

  const fetched = await fetchItem(nextIid)
  if (token !== fetchToken) {
    return
  }

  item.value = fetched || {}
}

function getItemName () {
  return item.value ? item.value.fullName : ''
}

function getEquipmentRowClass () {
  let classes = ['equipment-row']
  if (selected.value) {
    classes.push('selected')
  }
  return classes.join(' ')
}

let watchers = []
onMounted(() => {
  refreshItemFromIid(iid.value)

  watchers.push(watch(() => iid.value, () => {
    refreshItemFromIid(iid.value)
  }))
})

onBeforeUnmount(() => {
  watchers.forEach(w => w())
})

</script>

<style scoped lang="less">
.equipment-row {
  display: grid;
  grid-template-columns: 1.0fr 3.0fr;
  gap: 1em;
  padding-top: 5px;
  padding-bottom: 5px;
  cursor: pointer;
  user-select: none;

  &.selected {
    background: #121;
  }

  .slot {
    color: #aaa;
    font-size: 0.7rem;
    text-transform: capitalize;
    display: flex;
    align-items: center;
    padding-left: 3px;
    justify-content: flex-end;
  }

  .remove {
    cursor: pointer;
  }
}

.border-top {
  border-top: 1px solid #333;
}
</style>