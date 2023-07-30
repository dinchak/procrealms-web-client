<template>

  <n-modal
    v-model:show="state.showLogout"
    preset="dialog"
    title="Logout"
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
import { NModal, NButton } from 'naive-ui'
import { state } from '@/composables/state'

import { useCookieHandler } from '@/composables/cookie_handler'
import { useWebSocket } from '@/composables/web_socket'

const { removeTokenFromCookie } = useCookieHandler()
const { cmd } = useWebSocket()

function logout () {
  cmd('quit')
  state.showLogout = false
  state.token = ''
  removeTokenFromCookie(state.name)
}

</script>

<style lang="less">
</style>
