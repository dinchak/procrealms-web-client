<template>
  <GameModal
    v-model="state.modals.mailModal"
    title="Mail"
    modal-class="mail-modal"
    modal-key="mailModal"
    @opened="onModalOpened"
    @closed="onModalClosed"
  >
  <div class="mail-container">
    <h3>Mail</h3>
    <div class="no-mail" v-if="state.mail.count === 0">Your mailbox is empty.</div>
    <div class="mail-mass-actions" v-if="state.mail.count > 0">
      <NButton ghost @click="doGetAllMail()" type="warning">Get All</NButton>
      <NButton ghost @click="doOpenAllMail()" type="success">Open All</NButton>
    </div>
    <div v-if="state.mail.count > 0" class="mail-table">
      <div class="mail-header">
        <div class="mail-item-name">Item</div>
        <div class="mail-sender">From</div>
        <div class="mail-date">Received</div>
        <div class="mail-actions"></div>
      </div>
      <div
        class="mail-row"
        v-for="mailItem in state.mail.mailItems"
        :key="mailItem.iid"
      >
        <div class="mail-item-name">{{ mailItem.name }}</div>
        <div class="mail-sender">{{ mailItem.from }}</div>
        <div class="mail-date">{{ getRelativeTime(mailItem.sentAt) }} ago</div>
        <div class="mail-actions">
          <NButton size="small" @click="doGetMail(mailItem)">Get</NButton>
          <NButton size="small" @click="doOpenMail(mailItem)">Open</NButton>
        </div>
      </div>
    </div>
  </div>
  </GameModal>
</template>
<script setup>
import { state } from '@/static/state'
import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'

const { runCommand } = useWebSocket()
const { getRelativeTime } = useHelpers()

import GameModal from '@/components/modals/GameModal.vue'
import { NButton } from 'naive-ui'

async function doGetAllMail () {
  let cmd = 'mail get all'
  await runCommand(cmd, 'the_void')
  updateMailList()
}

async function doOpenAllMail () {
  let cmd = 'mail open all'
  await runCommand(cmd, 'the_void')
  updateMailList()
}

async function doGetMail (mailItem) {
  let cmd = `mail get iid:${mailItem.iid}`
  await runCommand(cmd, 'the_void')
  updateMailList()
}

async function doOpenMail (mailItem) {
  let cmd = `mail open iid:${mailItem.iid}`
  await runCommand(cmd, 'the_void')
  updateMailList()
}

function updateMailList () {
  let cmd = 'mail list'
  runCommand(cmd, 'the_void')
}

function onModalOpened () {
  updateMailList()
}

function onModalClosed () {
  state.modals.mailModal = false
}
</script>
<style lang="less" scoped>
.mail-container {
  max-width: 1200px;
  margin: 0 auto;

  .mail-mass-actions {
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;
    gap: 10px;
  }

  .mail-table {
    width: 100%;
    display: flex;
    flex-direction: column;

    .mail-row, .mail-header {
      display: flex;
      flex-direction: row;
      padding: 5px 0;
      border-bottom: 1px solid #444;
      align-items: center;

      > div:nth-child(1) {
        flex: 1 1 auto;

      }

      > div:nth-child(2) {
        width: 90px;
        flex: 0 0 auto;
      }

      > div:nth-child(3) {
        width: 120px;
        display: flex;
        flex-wrap: wrap;
        font-size: 0.8rem;
        @media (max-width: 600px) {
          width: 80px;
        }
      }

      > div:nth-child(4) {
        width: 100px;
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        @media (max-width: 600px) {
          width: 50px;
        }
      }
    }

    .mail-header {
      font-size: 0.8rem;
      color: #aaa;
    }
  }
}
</style>