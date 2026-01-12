<template>
  <GameModal
    v-model="state.modals.auctionModal"
    title="Auction"
    modal-class="auction-modal"
    modal-key="auctionModal"
    @opened="onModalOpened"
    @closed="onModalClosed"
  >
    <NTabs
      v-model:value="state.auction.pane"
      type="card"
      ref="tabs"
    >
      <NTabPane name="browse" tab="Browse">
        <AuctionBrowse></AuctionBrowse>
      </NTabPane>

      <NTabPane name="sell" tab="Sell">
        <AuctionSell></AuctionSell>
      </NTabPane>
    </NTabs>
  </GameModal>
</template>
<script setup>
import { state } from '@/static/state'
import { NTabs, NTabPane } from 'naive-ui'

import GameModal from '@/components/modals/GameModal.vue'
import AuctionBrowse from '@/components/auction-modal/AuctionBrowse.vue'
import AuctionSell from '@/components/auction-modal/AuctionSell.vue'

function onModalOpened () {
}

function onModalClosed () {
  state.modals.auctionModal = false
}
</script>