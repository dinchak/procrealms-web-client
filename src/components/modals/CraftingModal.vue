<template>
  <GameModal
    v-model="state.modals.craftingModal"
    title="Crafting"
    modal-class="crafting-modal"
    modal-key="craftingModal"
    @opened="onModalOpened"
    @closed="onModalClosed"
  >
    <div class="crafting-container">

    </div>
  </GameModal>
</template>
<script setup>
import { state } from '@/static/state'

function onModalOpened () {
}

function onModalClosed () {
}
</script>
<style lang="less" scoped>
.crafting-container {
  max-width: 850px;
  margin: 0 auto;
}
</style>