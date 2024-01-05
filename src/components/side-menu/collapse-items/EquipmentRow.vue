<template>
  <div class="equipment-row">
    <div class="slot">{{ itemSlot }}</div>
    <div class="item" v-if="item" v-html-safe="ansiToHtml(`L${item.level} ${item.colorName}`)"></div>
    <div class="item" v-if="!item">Nothing</div>
  </div>
</template>

<script setup>
import { defineProps, toRefs } from 'vue'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml } = useHelpers()

const props = defineProps(['item', 'itemSlot'])

const { item, itemSlot } = toRefs(props)

</script>

<style scoped lang="less">
.equipment-row {
  display: grid;
  grid-template-columns: 1.0fr 3.0fr;
  gap: 1em;
  padding-top: 5px;
  padding-bottom: 5px;
  cursor: pointer;

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