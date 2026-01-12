<template>
  <div class="splashscreen">
    <h1>Procedural Realms</h1>

    <div class="server-status" v-if="state.disconnected">
      You have been disconnected
    </div>

    <div class="server-status" v-if="!state.connected">
      Connecting to server...
    </div>

    <div class="server-status" v-if="error">
      {{ error }}
    </div>

    <div class="login-controls" v-if="state.connected">
      <div class="token" v-for="token in tokens" :key="token.name">
        <NButton
          type="info"
          size="large"
          tabindex="0"
          class="selectable"
          @click="doTokenAuth(token.name, token.token)"
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
        @click="openLoginModal"
      >
        Login
      </NButton>

      <NButton
        type="warning"
        size="large"
        tabindex="0"
        class="selectable"
        @click="openNewPlayerModal"
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

import { state, setMode, authenticationSuccess } from '@/static/state'

import { useLocalStorageHandler } from '@/composables/local_storage_handler'
import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'

const { sendWithResponse } = useWebSocket()
const { selectNearestElement } = useHelpers()
const { getTokens, deleteToken } = useLocalStorageHandler()

let tokens = ref([])
let error = ref('')

function doTokenAuth (name, token) {
  error.value = ''
  sendWithResponse('token', {
    name,
    token,
    width: state.options.terminalWidth,
    height: state.options.terminalHeight,
    ttype: 'play.proceduralrealms.com'
  }).then(({ cmd, msg }) => {
    if (cmd == 'login.validationFailed') {
      error.value = 'Token validation failed'
    } else if (cmd == 'login.fail') {
      error.value = 'Login failed'
    } else if (cmd == 'token.fail') {
      error.value = 'Token login failed'
    } else if (cmd == 'token.success') {
      authenticationSuccess(msg)
    } else {
      error.value = 'Unexpected response from server'
    }
  })
}

function onConnected () {
  tokens.value = getTokens()
}

let selectedElement = null
function selectLoginAction (degree) {
  selectedElement = selectNearestElement(selectedElement, degree)
}

function doDeleteToken (name) {
  deleteToken(name)
  tokens.value = getTokens()
}

function openLoginModal () {
  setMode('modal')
  state.modals.loginModal = true
}

function openNewPlayerModal () {
  setMode('modal')
  state.modals.newPlayerModal = true
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
  state.inputEmitter.on('selectLoginAction', selectLoginAction)
  state.inputEmitter.on('performLoginAction', performLoginAction)
})

onBeforeUnmount(() => {
  unwatch()
  state.inputEmitter.off('selectLoginAction', selectLoginAction)
  state.inputEmitter.off('performLoginAction', performLoginAction)
})

</script>

<style scoped lang="less">
.splashscreen {
  background: url('@/assets/bg.png') no-repeat center center fixed;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;

  h1 {
    font-family: 'Pixelify Sans', sans-serif;
    padding: 20px 0 20px 0;
    margin: 0;
    width: 100vw;
    text-align: center;
    font-size: 80px;
    text-shadow: 0 0 20px #0099ff;
    color: #fff;
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

@media screen and (max-height: 600px) {
  .splashscreen {
    h1 {
      font-size: 48px;
      padding-top: 100px;
      padding-bottom: 25px;
    }
  }
}

@media screen and (max-width: 900px) {
  .splashscreen {
    h1 {
      font-size: 74px;
      padding-top: 100px;
    }
  }
}

@media screen and (max-width: 700px) {
  .splashscreen {
    h1 {
      font-size: 48px;
      padding-top: 100px;
    }
  }
}

</style>
