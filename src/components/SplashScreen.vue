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
      <div class="token" v-for="token in tokens" :key="token.name">
        <NButton
          type="info"
          size="large"
          tabindex="0"
          class="selectable"
          @click="doTokenAuth(token.name)"
        >
          Login as {{ token.name }}
        </NButton>
        <NButton class="delete" @click="doDeleteToken(token.name)">
          <NIcon>
            <DeleteFilled />
          </NIcon>
        </NButton>
      </div>

      <NButton
        type="success"
        size="large"
        tabindex="0"
        class="selectable"
        @click="state.modals.loginModal = true"
      >
        Login
      </NButton>
      
      <NButton
        type="warning"
        size="large"
        tabindex="0"
        class="selectable"
        @click="state.modals.newPlayerModal = true"
      >
        New Player
      </NButton>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue"
import { NButton, NIcon } from 'naive-ui'

import DeleteFilled from '@vicons/material/DeleteFilled'

import { state } from '@/composables/state'

import { useTokenHandler } from '@/composables/token_handler'
import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'

const { doTokenAuth } = useWebSocket()
const { selectNearestElement } = useHelpers()
const { getTokens, deleteToken } = useTokenHandler()

let tokens = ref([])

function onConnected () {
  tokens.value = getTokens()
}

let selectedElement = null
function selectLoginItem (degree) {
  selectedElement = selectNearestElement(selectedElement, degree)
}

function doDeleteToken (name) {
  deleteToken(name)
  tokens.value = getTokens()
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
    .token {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 5px 0;
      width: 300px;
      .delete {
        margin-left: 10px;
        padding: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #ff0000;
        color: #fff;
        &:hover {
          background-color: #ff3333;
        }
      }

      .selectable {
        cursor: pointer;
      }
    }
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
