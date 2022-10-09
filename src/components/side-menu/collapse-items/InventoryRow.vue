<template>
  <div class="inventory-item">
    <div v-html="props.amount + 'x ' + ansiSpan(props.colorName)" class="item-name"></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { ansiSpan } from 'ansi-to-span'

const props = defineProps(['colorName', 'amount'])
</script>

<style scoped lang="less">
  .inventory-item {
    padding-bottom: 5px;
    .item-name {
      cursor: pointer;
    }
  }

  .actions {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 10px 0;
    .action {
      margin: 2px 2px;
      text-transform: capitalize;
    }
  }

</style>