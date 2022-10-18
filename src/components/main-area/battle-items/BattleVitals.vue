<template>
  <div class="vitals">
    <n-progress type="line" status="success" aria-label="Health" :percentage="entity.hp" :show-indicator="false"></n-progress>
    <n-progress type="line" status="default" aria-label="Energy" :percentage="entity.en" :show-indicator="false"></n-progress>
    <n-progress type="line" status="warning" aria-label="Stamina" :percentage="entity.st" :show-indicator="false"></n-progress>
    <div class="status" v-html="ansiToHtml(entity.status)"></div>
  </div>
</template>
<script setup>
import { defineProps, toRefs } from 'vue'
import { NProgress } from 'naive-ui'

import { helpers } from '@/composables/helpers'

const { ansiToHtml } = helpers()

const props = defineProps({
  entity: Object,
})
const { entity } = toRefs(props)
</script>
<style lang="less">
</style>