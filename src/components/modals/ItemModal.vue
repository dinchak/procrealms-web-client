<template>
  <Teleport to="body">
    <NCard v-if="item" :class="getClass()" style="max-height: 600px">
      <p class="close" v-on:click="closeModal()">x</p>
      <h3 v-html-safe="ansiToHtml(getItemName())"></h3>
      <ItemDetails :item="item" :actions="getItemActions()" v-if="item"></ItemDetails>
    </NCard>
  </Teleport>
</template>

<script setup>
import { defineProps, toRefs } from 'vue'
import { NCard } from 'naive-ui'

import ItemDetails from '@/components/game-modal/ItemDetails.vue'

import { state, getOrderCmd } from '@/static/state'
import { ANSI } from '@/static/constants'

import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const { ansiToHtml, getActions } = useHelpers()
const { cmd } = useWebSocket()

const props = defineProps({
  item: Object,
  mode: String
})

const { item, mode } = toRefs(props)

const emit = defineEmits(['closeItemModal'])

function getItemName () {
  if (!item.value.iid) {
    return ''
  }

  return `${ANSI.reset}L${ANSI.boldWhite}${item.value.level} ${item.value.colorName}`
}

function closeModal () {
  console.log('closeModal')
  emit('closeItemModal', mode.value)
}

function getClass() {
  const swapMobileMenuSide = state.options.swapMobileMenuSide

  if (swapMobileMenuSide) {
    return "player-inventory-modal-right"
  } else if (!swapMobileMenuSide) {
    return "player-inventory-modal-left"
  }
}

function getItemActions () {
  if (!item.value.iid) {
    return []
  }

  if (mode.value == 'equipment') {
    return [{
      label: 'Remove',
      onClick: () => cmd(`${getOrderCmd()}remove iid:${item.value.iid}`),
      class: 'bold-red',
      disabled: false
    }]
  } else if (mode.value == 'inventory') {
    return getActions(item.value)
  }
}
</script>

<style scoped lang="less">

.n-card {
  position: fixed;
  margin-top: 50px;
  width: calc(100vw - 280px);
  max-width: 700px;
  z-index: 3;
  top: 0;
  overflow-y: scroll;
  max-height: calc(100vh - 100px);
}

.player-inventory-modal-left {
  left: 275px
}

.player-inventory-modal-right {
  right: 275px;
}

.merc-inventory-modal-left {
  left: 410px;
}

.merc-inventory-modal-right {
  right: 410px;
}

.left {
  left: 5px;
}

.right {
  right: 5px;
}

.item-desc {
  white-space: pre-wrap;
  font-size: 1.2em;
}

h3 {
  margin-top: 0;
  font-size: 1.4em;
}

.close {
  position: absolute;
  top: -20px;
  right: 10px;
  cursor: pointer;
  font-size: 1.4em;
}

.actions-pane {
  overflow-y: scroll;
  margin-bottom: 20px;
}

.examine {
  white-space: pre-wrap;
  font-size: 1.2em;
  overflow-y: scroll;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;

.left {
  text-align: right;
}
.right {
  text-align: left;
}
}

.actions {
  margin-top: 20px;
  width: 100%;
  display: grid;
  gap: 1em;
  grid-template-columns: 1fr 1fr 1fr;
  overflow-y: scroll;

.action {
  text-transform: capitalize;
}
}

.additional-collapse {
  margin-top: 15px;
  margin-bottom: 15px;
}

.input-button {
  display: flex;
}

.additional-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 15px;
  margin-top: 20px;
}

.input-field {
  margin-left: 5px;
  width: 100px;
}

@media screen and (max-width: 800px) {
  .n-card {
    margin-top: 3px;
    width: calc(100vw - 280px);
    min-width: 300px;
    max-width: 700px;
    z-index: 3;
    top: 0;
    height: calc(100vh - 6px);
  }

    .merc-inventory-modal-left, .merc-inventory-modal-right {
      left: 5px;
    }
}

</style>
