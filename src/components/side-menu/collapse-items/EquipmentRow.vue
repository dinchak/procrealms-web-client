<template>
  <div class="equipment-row" :class="{'border-top' : isHead}">
    <div class="slot"> {{props.slot ? props.slot : props.type}}: </div>
    <div><span v-if="props.level">[{{props.level}}] </span><span class="equipment-item" v-html="ansiSpan(props.colorName)"></span></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { ansiSpan } from 'ansi-to-span'

const props = defineProps(['name', 'colorName', 'slot', 'type', 'level'])
const isHead =  props.slot !== 'head'
</script>

<style scoped lang="less">
.equipment-row {
  display: grid;
  grid-template-columns: 1.5fr 3fr;
  gap: 1em;
  padding-top: 5px;
  padding-bottom: 5px;
  cursor: pointer;

  .slot {
    text-transform: capitalize;
    display: flex;
    align-items: center;
    padding-left: 3px;
  }

  .remove {
    cursor: pointer;
  }
}

.border-top {
  border-top: 1px solid #333;
}
</style>