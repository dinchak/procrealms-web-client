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
import { defineProps, toRefs, ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { NPopover } from 'naive-ui'

import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const { ansiToHtml } = useHelpers()
const { fetchItem } = useWebSocket()

const props = defineProps({
  iid: String,
  item: Object,
  selected: Boolean
})

const { iid, item: itemProp, selected } = toRefs(props)

const fetchedItem = ref({})
let fetchToken = 0
let watchers = []

// Computed `displayItem` prefers the passed prop when available, otherwise falls back to fetchedItem.
const displayItem = computed(() => {
  if (itemProp.value && Object.keys(itemProp.value).length) {
    return itemProp.value
  }
  return fetchedItem.value || {}
})

function getItemName () {
  return displayItem.value ? displayItem.value.fullName : ''
}

function getInventoryRowClass () {
  let classes = ['inventory-row']
  if (selected.value) {
    classes.push('selected')
  }
  return classes.join(' ')
}

async function refreshFetchedItem (nextIid) {
  const token = ++fetchToken

  if (!nextIid) {
    fetchedItem.value = {}
    return
  }

  const fetched = await fetchItem(nextIid)
  if (token !== fetchToken) {
    return
  }

  fetchedItem.value = fetched || {}
}

onMounted(() => {
  if (!(itemProp.value && Object.keys(itemProp.value).length) && iid.value) {
    refreshFetchedItem(iid.value)
  }

  // If parent doesn't provide `item`, keep fetchedItem in sync with iid changes.
  watchers.push(watch(() => iid.value, newIid => {
    if (itemProp.value && Object.keys(itemProp.value).length) {
      return
    }
    refreshFetchedItem(newIid)
  }))

  // If the parent starts providing an `item` object, clear the fetched cache.
  watchers.push(watch(() => itemProp.value, newVal => {
    if (newVal && Object.keys(newVal).length) {
      fetchToken += 1
      fetchedItem.value = {}
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