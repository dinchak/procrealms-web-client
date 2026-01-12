<template>
  <NModal
    v-model:show="state.modals.errorModal"
    preset="dialog"
    title="Error"
    :content="state.errorMessage"
    :closable="true"
    type="error"
    :on-after-leave="onModalClosed"
  >
  </NModal>
</template>
<script setup>
import { state, prevMode } from '@/static/state'
import { NModal } from 'naive-ui'

function onModalClosed () {
  state.errorMessage = ''
  state.modals.errorModal = false
  prevMode()
}
</script>