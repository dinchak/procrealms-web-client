<template>
  <div>
    <div v-html-safe="ansiToHtml(state.gameState.prompt)"></div>
  </div>
</template>
<script setup>
import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
const { ansiToHtml } = useHelpers()
</script>
<style lang="less" scoped>
</style>