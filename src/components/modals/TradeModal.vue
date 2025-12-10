<template>
  <GameModal
    v-model="state.modals.tradeModal"
    title="Trade Menu"
    modal-class="trade-modal"
    modal-key="tradeModal"
  >
    <div>Trade Modal!</div>
  </GameModal>
</template>

<script setup>
import { state } from '@/static/state'
import GameModal from '@/components/modals/GameModal.vue'

</script>
<style lang="less">
</style>