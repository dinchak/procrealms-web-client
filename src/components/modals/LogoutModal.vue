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
      <n-button type="success" ghost @click="logout">Logout</n-button>
    </template>

  </n-modal>

</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { NModal, NButton } from 'naive-ui'
import { state, prevMode } from '@/composables/state'

import { useCookieHandler } from '@/composables/cookie_handler'
import { useWebSocket } from '@/composables/web_socket'

const { removeTokenFromCookie } = useCookieHandler()
const { cmd } = useWebSocket()

function closeModal () {
  if (!state.modals.logoutModal) {
    return
  }
  state.modals.logoutModal = false
  prevMode()
}

function logout () {
  closeModal()
  cmd('quit')
  state.token = ''
  removeTokenFromCookie(state.name)
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
