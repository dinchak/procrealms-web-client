<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <SplashScreen v-if="state.disconnected || !state.token"></SplashScreen>
    <LoginModal></LoginModal>
    <NewPlayerModal></NewPlayerModal>
    <router-view/>
  </n-config-provider>
</template>

<script setup>
import { onMounted } from 'vue'

import { NConfigProvider, darkTheme } from 'naive-ui'

import { useCookieHandler } from './composables/cookie_handler'
import { useEventHandler } from './composables/event_handler'
import { useWebSocket } from './composables/web_socket'
import { useWindowHandler } from './composables/window_handler'
import { constants } from './composables/constants/constants'

import SplashScreen from '@/components/SplashScreen.vue'
import LoginModal from './components/modals/LoginModal.vue'
import NewPlayerModal from './components/modals/NewPlayerModal.vue'

import { state, resetState } from './composables/state'

const themeOverrides = {
  Button: {
    fontSizeLarge: '20px'
  }
}

const { readCookie, clearCookie } = useCookieHandler()
const { onEvent } = useEventHandler()
const { initConnection, doTokenAuth } = useWebSocket()
useWindowHandler()

function onConnect () {
  try {
    state.connected = true
    if (state.disconnected) {
      return
    }

    let json = readCookie()
    if (json) {
      let prefs = JSON.parse(json)
      if (!prefs.name || !prefs.token) {
        return
      }

      state.token = prefs.token
      state.name = prefs.name

      doTokenAuth()
    }
  } catch (err) {
    clearCookie()
    console.log(err.stack)
  }
}

function doConnect () {
  if (state.connected) {
    return
  }

  initConnection({ onConnect, onClose, onEvent, url: process.env.VUE_APP_WEBSOCKET_URL })
}

function onClose () {
  if (state.token) {
    resetState()
    state.disconnected = true
  }

  state.connected = false
  setTimeout(() => doConnect(), 1000)
}

onMounted(doConnect)

setInterval(() => {
  clearCache(state.cache.itemCache)
  clearCache(state.cache.entityCache)
}, constants.CACHE_DELETE_INTERVAL)

function clearCache(object) {
  const now = Date.now()
  const objectKeys = Object.keys(object)

  objectKeys.map(key => {
    const date = object[key].date
    const difference = now - date

    if (difference > constants.CACHE_DELETE_TIME) {
      delete object[key]
    }
  })
}
</script>

<style lang="less">
@font-face {
  font-family: 'DOS';
  src: url('@/assets/WebPlus_IBM_VGA_8x16.woff') format('woff');
}

body, html {
  background-color: #181818;
  margin: 0;
  padding: 0;
  font-family: 'DOS';
  color: #fff;
  overflow-x: hidden;
  color-scheme: dark;
  line-height: 1.1;
}

::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  background: transparent;
}

.red, .ansi-red-fg { color: #c50f1f; }
.green, .ansi-green-fg { color: #13a10e }
.yellow, .ansi-yellow-fg { color: #c19c00 }
.blue, .ansi-blue-fg { color: #0037da }
.magenta, .ansi-magenta-fg { color: #881798 }
.cyan, .ansi-cyan-fg { color: #3a96dd }
.white, .ansi-white-fg { color: #cccccc }
.black, .ansi-bright-black-fg { color: #767676 }
.bold-red, .ansi-bright-red-fg { color: #e74856 }
.bold-green, .ansi-bright-green-fg { color: #16c60c }
.bold-yellow, .ansi-bright-yellow-fg { color: #f9f1a5 }
.bold-blue, .ansi-bright-blue-fg { color: #3b78ff }
.bold-magenta, .ansi-bright-magenta-fg { color: #b4009e }
.bold-cyan, .ansi-bright-cyan-fg { color: #61d6d6 }
.bold-white, .ansi-bright-white-fg { color: #f2f2f2 }

b {
  font-weight: normal !important;
}
</style>
