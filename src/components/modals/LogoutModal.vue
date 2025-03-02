<template>

  <n-modal
    v-model:show="state.modals.logoutModal"
    preset="dialog"
    title="Logout"
    @after-leave="closeModal"
  >

    <template #header>
      <div>Logout</div>
    </template>

    Are you sure you want to logout?

    <template #action>
      <n-button class="selectable" type="success" ghost @click="logout">Logout</n-button>
    </template>

  </n-modal>

</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { NModal, NButton } from 'naive-ui'
import { state, prevMode } from '@/static/state'

import { useLocalStorageHandler } from '@/composables/local_storage_handler'
import { useWebSocket } from '@/composables/web_socket'

const { runCommand } = useWebSocket()
const { deleteToken } = useLocalStorageHandler()

function closeModal () {
  if (!state.modals.logoutModal) {
    return
  }
  state.modals.logoutModal = false
  prevMode()
}

function logout () {
  closeModal()
  runCommand('quit')
  state.token = ''
  deleteToken(state.name)
}

onMounted(() => {
  state.inputEmitter.on('closeModal', closeModal)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', closeModal)
})

</script>

<style lang="less">
</style>
