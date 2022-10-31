<template>
  <div ref="picture" class="picture" v-html="state.picture"></div>
  <div class="login-controls" v-if="state.disconnected">
    You have been disconnected
  </div>
  <div class="login-controls" v-if="!state.connected">
    Connecting to server...
  </div>
  <div class="login-controls" v-if="state.connected">
    <n-button v-if="state.disconnected" type="info" size="large" @click="doTokenAuth">Reconnect</n-button>
    <n-button type="success" size="large" @click="state.showLogin = true">Login</n-button>
    <n-button type="warning" size="large" @click="state.showNewPlayer = true">New Player</n-button>
  </div>
</template>

<script setup>
import { NButton } from 'naive-ui'

import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'

const { doTokenAuth } = useWebSocket()
</script>

<style scoped lang="less">
.picture {
  user-select: none;
  min-height: 300px;
  font-size: 20px;
  line-height: 20px;
  white-space: pre;
  text-align: center;
}

.login-controls {
  position: relative;
  top: -225px;
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

@media screen and (max-width: 1000px) {
  .picture {
    font-size: 16px;
    line-height: 16px;
  }
  .login-controls {
    top: -175px;
  }
}

@media screen and (max-width: 800px) {
  .picture {
    font-size: 12px;
    line-height: 12px;
  }
  .login-controls {
    top: -125px;
  }
}

</style>
