<template>
  <div class="scroll-container">
    <NGrid class="equipment" cols="1">
      <NGi v-for="(iid, slot) in state.gameState.equipment" :key="slot">
        <div class="slot">
          <div class="label">{{ slot }}</div>
          <div class="item" v-html-safe="iid ? getItemFullName(iid) : 'nothing'"></div>
        </div>
      </NGi>
    </NGrid>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { NGrid, NGi } from 'naive-ui'
import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml } = useHelpers()
const { fetchItems } = useWebSocket()

const equipment = ref([])

function getItemFullName (iid) {
  const item = equipment.value.find(item => item.iid == iid)
  if (!item) {
    return ''
  }
  return ansiToHtml(item.fullName)
}

let watchers = []
onMounted(async () => {
  equipment.value = await fetchItems(Object.values(state.gameState.equipment))
  
  watchers.push(
    watch(state.gameState, async (newVal) => equipment.value = await fetchItems(Object.values(newVal.equipment)))
  )
})

onBeforeUnmount(() => {
  for (let watcher of watchers) {
    watcher()
  }
})

</script>
<style lang="less" scoped>
.scroll-container {
  height: calc(100vh - 225px);
  overflow-y: scroll;

  .equipment {
    .slot {
      display: flex;
      flex-direction: row;
      .label {
        width: 80px;
        text-align: right;
        padding: 0 10px;
      }
      .item {
        flex: 1;
        text-align: left;
        padding: 0 10px;
      }
    }
  }
}
</style>