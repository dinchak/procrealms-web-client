<template>
  <div class="inventory-item">
      <n-popover trigger="hover" placement="top-start" :keep-alive-on-hover="false">
          <template #trigger >
              <div v-html-safe="`L${props.level} ${props.amount}x ${ansiToHtml(props.colorName)}`" class="item-name"></div>
          </template>
          <div v-html-safe="`${ansiToHtml(props.description)}`" class="tooltip"></div>
      </n-popover>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useHelpers } from '@/composables/helpers'
import { NPopover } from 'naive-ui'

const { ansiToHtml } = useHelpers()

const props = defineProps(['colorName', 'amount', 'level', 'description'])
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

  .tooltip {
    width: 200px;
  }

</style>