<template>
  <div class="scroll-container">
    <NGrid class="options" cols="1 800:2">
      <NGi>Options</NGi>
    </NGrid>
  </div>
</template>

<script setup>
// import { ref } from 'vue'
// import { NGrid, NGi, NProgress } from 'naive-ui'
// import { state } from '@/composables/state'
// import { useHelpers } from '@/composables/helpers'

// const { ansiToHtml } = useHelpers()

</script>
<style lang="less" scoped>
.scroll-container {
  height: calc(100vh - 225px);
  overflow-y: scroll;
}
</style>