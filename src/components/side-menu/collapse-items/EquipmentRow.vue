<template>
  <div class="equipment-row" :class="{'border-top' : isHead}">
    <div class="slot">{{ props.slot }}</div>
    <div>
      <span class="equipment-level" v-if="props.level">L{{props.level}}</span>
      <span class="equipment-item" v-html="ansiToHtml(props.colorName)"></span></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { helpers } from '@/composables/helpers'

const { ansiToHtml } = helpers()

const props = defineProps(['slot', 'colorName', 'level'])
const isHead = props.slot !== 'head'
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
    font-size: 12px;
    text-transform: capitalize;
    display: flex;
    align-items: center;
    padding-left: 3px;
    justify-content: flex-end;
  }

  .remove {
    cursor: pointer;
  }

  div {
    .equipment-level {
      margin-right: 8px;
    }
  }
}

.border-top {
  border-top: 1px solid #333;
}
</style>