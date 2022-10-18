<template>
  <div class="caret" v-if="entity.isActing">{{ caret }}</div>
  <div class="caret" v-if="!entity.isActing"></div>
</template>
<script setup>
import { defineProps, toRefs } from 'vue'

const props = defineProps({
  entity: Object,
  caret: String
})
const { entity } = toRefs(props)
</script>
<style lang="less">
</style>