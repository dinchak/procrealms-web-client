<template>
  <div class="inventory-item">
    <div v-html-safe="`L${props.level} ${props.amount}x ${ansiToHtml(props.colorName)}`" class="item-name"></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { helpers } from '@/composables/helpers'

const { ansiToHtml } = helpers()

const props = defineProps(['colorName', 'amount', 'level'])
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