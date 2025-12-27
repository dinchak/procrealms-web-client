<template>
  <GameModal
    v-model="state.modals.auctionModal"
    title="Auction"
    modal-class="auction-modal"
    modal-key="auctionModal"
    @opened="onModalOpened"
    @closed="onModalClosed"
  >
    <div class="auction-container">
      <h3>Auction</h3>
    </div>
  </GameModal>
</template>
<script setup>
import { state } from '@/static/state'

import GameModal from '@/components/modals/GameModal.vue'

function onModalOpened () {
}

function onModalClosed () {
}
</script>
<style lang="less" scoped>
.auction-container {
  max-width: 850px;
  margin: 0 auto;

  .n-select {
    max-width: 300px;
  }

  .recipe-row {
    width: 100%;
    .recipe {
      width: 100%;
      .name {
        padding: 5px 10px;
        cursor: pointer;
        &.selected {
          background: #121;
        }

        &:hover, &.selected {
          background: #121;
        }
      }
    }
  }

}
</style>