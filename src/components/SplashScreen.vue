<template>
  <div class="splashscreen">

    <h1>Procedural Realms</h1>
    
    <div class="server-status" v-if="state.disconnected">
      You have been disconnected
    </div>

    <div class="server-status" v-if="!state.connected">
      Connecting to server...
    </div>

    <div class="login-controls" v-if="state.connected">
      <n-button
        v-for="name in options"
        :key="name"
        type="info"
        size="large"
        tabindex="0"
        class="selectable"
        @click="doTokenAuth(name)"
      >
        Login as {{ name }}
      </n-button>

      <n-button
        type="success"
        size="large"
        tabindex="0"
        class="selectable"
        @click="state.modals.loginModal = true"
      >
        Login
      </n-button>
      
      <n-button
        type="warning"
        size="large"
        tabindex="0"
        class="selectable"
        @click="state.modals.newPlayerModal = true"
      >
        New Player
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, onMounted, onBeforeUnmount } from "vue"
import { NButton } from 'naive-ui'

import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import { useCookieHandler } from '@/composables/cookie_handler'
import { useHelpers } from '@/composables/helpers'

const { doTokenAuth } = useWebSocket()
const { readTokensFromCookie } = useCookieHandler()
const { selectNearestElement } = useHelpers()

const options = reactive([])

function onConnected () {
  options.length = 0
  Object.keys(readTokensFromCookie())
    .forEach(name => options.push(name))
}

let selectedElement = null
function selectLoginItem (degree) {
  selectedElement = selectNearestElement(selectedElement, degree)
}

function performLoginAction () {
  if (!selectedElement) {
    return
  }
  selectedElement.click()
}

let unwatch = null
onMounted(() => {
  if (state.connected) {
    onConnected()
  }

  unwatch = watch(() => state.connected, onConnected)
  state.inputEmitter.on('selectLoginAction', selectLoginItem)
  state.inputEmitter.on('performLoginAction', performLoginAction)
})

onBeforeUnmount(() => {
  unwatch()
  state.inputEmitter.off('selectLoginAction', selectLoginItem)
  state.inputEmitter.off('performLoginAction', performLoginAction)
})

</script>

<style scoped lang="less">
.splashscreen {
  background-image: url('@/assets/bg.jpg');
  background-size: cover;
  height: calc(100vh - 100px);
  padding-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;

  h1 {
    font-family: 'Pixelify Sans', sans-serif;
    padding: 0 0 50px 0;
    margin: 0;
    width: 100vw;
    text-align: center;
    font-size: 72px;
    text-shadow: 0 0 10px rgba(255,255,120,0.5);
  }

  .server-status {
    font-size: 1.3rem;
    color: #ff9752;
    text-shadow: 0px 0px 6px #ff0000;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 5px 10px;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .login-controls {
    margin: 0 auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 300px;
    button {
      max-width: 300px;
      width: 100%;
      margin: 5px auto;
      &.selected {
        box-shadow: 0 0 5px #f8ff25;
        color: #f8ff25;
      }
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
