<template>
  <div :class="getEquipmentRowClass()">
    <div class="slot">{{ itemSlot }}</div>
    <div class="item" v-if="iid" v-html-safe="ansiToHtml(getItemName())"></div>
    <div class="item" v-if="!iid">Nothing</div>
  </div>
</template>

<script setup>
import { watch, defineProps, toRefs, ref, onMounted, onBeforeUnmount } from 'vue'

import { ANSI } from '@/static/constants'

import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const { fetchItem } = useWebSocket()
const { ansiToHtml } = useHelpers()

const props = defineProps(['iid', 'itemSlot', 'selected'])

const { iid, itemSlot, selected } = toRefs(props)
const item = ref({})

function getItemName () {
  return `${ANSI.reset}L${ANSI.boldWhite}${item.value.level} ${item.value.colorName}`
}

function getEquipmentRowClass () {
  let classes = ['equipment-row']
  if (selected.value) {
    classes.push('selected')
  }
  return classes.join(' ')
}

let watchers = []
onMounted(async () => {
  if (iid.value) {
    item.value = await fetchItem(iid.value)
  }

  watchers.push(watch(() => iid.value, async () => {
    if (iid.value) {
      item.value = await fetchItem(iid.value)
    } else {
      item.value = {}
    }
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