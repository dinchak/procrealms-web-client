<template>
  <div class="splashscreen">

    <h1>Procedural Realms</h1>
    
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
.splashscreen {
  background-image: url('@/assets/bg.jpg');
  background-size: cover;
  height: calc(100vh - 100px);
  padding-top: 100px;
  h1 {
    font-family: 'Pixelify Sans', sans-serif;
    padding: 0 0 100px 0;
    margin: 0;
    width: 100vw;
    text-align: center;
    font-size: 72px;
    text-shadow: 0 0 10px rgba(255,255,120,0.5);
  }
  .login-controls {
    margin: 0 auto;
    padding: 10px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    font-size: 1.3rem;
    color: #ff9752;
    text-shadow: 0px 0px 6px #ff0000;
    button {
      margin: 5px;
    }
  }
}

@media screen and (max-width: 700px) {
  .splashscreen {
    height: calc(100vh - 60px);
    padding-top: 60px;
    h1 {
      font-size: 48px;
    }
  } 
}

</style>
