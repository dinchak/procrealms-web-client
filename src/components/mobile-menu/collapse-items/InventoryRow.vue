<template>
  <div :class="getInventoryRowClass()">
    <NPopover trigger="hover" placement="top-start" :keep-alive-on-hover="false" :disabled="!item.description">
      <template #trigger >
        <div v-html-safe="ansiToHtml(getItemName())" class="item-name"></div>
      </template>
      <div v-html-safe="`${ansiToHtml(item.description)}`" class="tooltip"></div>
    </NPopover>
  </div>
</template>

<script setup>
import { defineProps, toRefs, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { NPopover } from 'naive-ui'

import { ANSI } from '@/static/constants'

import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const { ansiToHtml } = useHelpers()
const { fetchItem } = useWebSocket()

const props = defineProps({
  iid: String,
  selected: Boolean
})

const { iid, selected } = toRefs(props)
const item = ref({})

function getItemName () {
  return item.value ? item.value.fullName : ''
}

function getInventoryRowClass () {
  let classes = ['inventory-row']
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
.inventory-row {
  padding: 5px 10px;
  user-select: none;
  cursor: pointer;
  &.selected {
    background: #121;
  }
  .item-name {
    cursor: pointer;
  }
}

.tooltip {
  width: 200px;
}
</style>