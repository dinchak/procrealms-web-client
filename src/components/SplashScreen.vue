<template>
  <div ref="picture" class="picture" v-html-safe="state.picture"></div>
  <div class="login-controls" v-if="state.disconnected">
    You have been disconnected
  </div>
  <div class="login-controls" v-if="!state.connected">
    Connecting to server...
  </div>
  <div class="login-controls" v-if="state.connected">
    <n-dropdown
        placement="bottom"
        v-if="options.length > 0"
        trigger="click"
        size="large"
        type="info"
        :options="options"
        @select="doTokenAuth"
    >
      <n-button type="info" size="large">Reconnect</n-button>
    </n-dropdown>
    <n-button type="success" size="large" @click="state.showLogin = true">Login</n-button>
    <n-button type="warning" size="large" @click="state.showNewPlayer = true">New Player</n-button>
  </div>
</template>

<script setup>
import { NButton, NDropdown } from 'naive-ui'
import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import { useCookieHandler } from "@/composables/cookie_handler"
import { reactive, watch } from "vue"

const { doTokenAuth } = useWebSocket()
const { readTokensFromCookie } = useCookieHandler()

const options = reactive([])

watch(() => state.connected, () => {
  options.length = 0
  Object.keys(readTokensFromCookie())
      .forEach(name => options.push({label: name, key: name}))
})

</script>

<style scoped lang="less">
.picture {
  user-select: none;
  min-height: 300px;
  font-size: 16px;
  line-height: 16px;
  white-space: pre;
  text-align: center;
  font-family: 'Inconsolata', monospace;
}

.login-controls {
  position: relative;
  top: -300px;
  padding: 10px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-size: 22px;
  color: #ff9752;
  text-shadow: 0px 0px 6px #ff0000;
  button {
    margin: 0 5px;
  }
}

@media screen and (max-width: 800px) {
  .picture {
    font-size: 14px;
    line-height: 14px;
  }
}

</style>
