<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <SplashScreen v-if="state.disconnected || !state.token"></SplashScreen>
    <LoginModal></LoginModal>
    <NewPlayerModal></NewPlayerModal>
    <InputHandler></InputHandler>
    <router-view/>
  </n-config-provider>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

import { NConfigProvider, darkTheme } from 'naive-ui'

import { state, resetState, resetMode } from './static/state'
import { useWebSocket } from '@/composables/web_socket'
import { useLocalStorageHandler } from './composables/local_storage_handler'
import { CACHE_DELETE_TIME, CACHE_DELETE_INTERVAL } from '@/static/constants'

import InputHandler from '@/components/InputHandler.vue'
import SplashScreen from '@/components/SplashScreen.vue'
import LoginModal from '@/components/modals/LoginModal.vue'
import NewPlayerModal from '@/components/modals/NewPlayerModal.vue'

const themeOverrides = {
  Button: {
    fontSizeLarge: '20px'
  }
}

const { initConnection } = useWebSocket()
const { loadOptions, loadInputMappings } = useLocalStorageHandler()

let cacheClearInterval = null

function doConnect () {
  if (state.connected) {
    return
  }

  initConnection({ onConnect, onClose, url: import.meta.env.VITE_WEBSOCKET_URL })
}

function onConnect () {
  state.connected = true
}

function onClose () {
  resetState()
  resetMode()
  state.disconnected = true
  state.connected = false
  setTimeout(() => doConnect(), 1000)
}

function clearCache(object) {
  const now = Date.now()
  const objectKeys = Object.keys(object)

  objectKeys.map(key => {
    const date = object[key].date
    const difference = now - date

    if (difference > CACHE_DELETE_TIME) {
      delete object[key]
    }
  })
}

onMounted(() => {
  loadOptions()
  loadInputMappings()

  doConnect()

  cacheClearInterval = setInterval(() => {
    clearCache(state.cache.itemCache)
    clearCache(state.cache.entityCache)
  }, CACHE_DELETE_INTERVAL)
})

onBeforeUnmount(() => {
  clearInterval(cacheClearInterval)
})

</script>

<style lang="less">
@import url('https://fonts.googleapis.com/css2?family=Inconsolata&family=Open+Sans&family=Pixelify+Sans&family=Source+Code+Pro&family=Ubuntu+Mono&family=VT323&display=swap');

@font-face {
  font-family: 'Consola Mono';
  src: url('@/assets/fonts/ConsolaMono-Book.ttf') format('truetype');
}

@font-face {
  font-family: 'Big Blue Terminal';
  src: url('@/assets/fonts/BigBlue_Terminal_437TT.TTF') format('truetype');
}

@font-face {
  font-family: 'DOS';
  src: url('@/assets/fonts/WebPlus_IBM_VGA_8x16.woff') format('woff');
}

:root, .n-form-item, .n-form-item-label, .n-button, .n-input, .n-dialog {
  --n-font-size: 16px;
  --n-label-font-size: 16px;
}

.selected {
  box-shadow: 0 0 5px #f8ff25;
  color: #f8ff25;
}

body, html {
  margin: 0;
  padding: 0;
  font-family: 'Ubuntu Mono', monospace;
  color: #fff;
  overflow-x: hidden;
  color-scheme: dark;
  line-height: 1.1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  background: transparent;
}

#app {
  height: 100vh;
  font-size: 16px;

  &.font-18 {
    font-size: 18px;
  }
  &.font-16 {
    font-size: 16px;
  }
  &.font-14 {
    font-size: 14px;
  }
}

.red, .ansi-red-fg { color: #c50f1f; }
.green, .ansi-green-fg { color: #13a10e }
.yellow, .ansi-yellow-fg { color: #c19c00 }
.blue, .ansi-blue-fg { color: #0037da }
.magenta, .ansi-magenta-fg { color: #c14cd2 }
.cyan, .ansi-cyan-fg { color: #3a96dd }
.white, .ansi-white-fg { color: #cccccc }
.black, .ansi-bright-black-fg { color: #767676 }
.bold-red, .ansi-bright-red-fg { color: #e74856 }
.bold-green, .ansi-bright-green-fg { color: #2aeb1f }
.bold-yellow, .ansi-bright-yellow-fg { color: #f9f1a5 }
.bold-blue, .ansi-bright-blue-fg { color: #3b78ff }
.bold-magenta, .ansi-bright-magenta-fg { color: #e66ff3 }
.bold-cyan, .ansi-bright-cyan-fg { color: #61d6d6 }
.bold-white, .ansi-bright-white-fg { color: #f2f2f2 }

b {
  font-weight: normal !important;
}
</style>
