<template>
  <div class="action">
    <n-progress type="circle" status="error" :percentage="entity.nextAction / 40 * 100" :show-indicator="false"></n-progress>
  </div>
</template>
<script setup>
import { defineProps, toRefs } from 'vue'
import { NProgress } from 'naive-ui'

const props = defineProps({
  entity: Object,
})
const { entity } = toRefs(props)
</script>
<style lang="less">
</style>