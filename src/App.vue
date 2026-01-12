<template>
  <n-config-provider :abstract="true" :theme="darkTheme" :theme-overrides="themeOverrides">
    <SplashScreen v-if="state.disconnected || !state.token" />
    <LoginModal />
    <NewPlayerModal />
    <InputHandler />
    <SoundHandler />
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

import { stopPlaying } from '@/static/sound'

import InputHandler from '@/components/InputHandler.vue'
import SplashScreen from '@/components/SplashScreen.vue'
import LoginModal from '@/components/modals/LoginModal.vue'
import NewPlayerModal from '@/components/modals/NewPlayerModal.vue'
import SoundHandler from '@/components/SoundHandler.vue'

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
  stopPlaying()
}

function clearCache (object) {
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
  state.inputEmitter.setMaxListeners(20)
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

body, html {
  margin: 0;
  padding: 0;
  font-family: 'Ubuntu Mono', monospace;
  color: #fff;
  color-scheme: dark;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  line-height: 1.1 !important;
}

::-webkit-scrollbar {
  background: transparent;
}

::-webkit-scrollbar:horizontal {
  height: 0 !important;
}

::-webkit-scrollbar:vertical {
  width: 0 !important;
}

#app {
  position: fixed;
  height: 100%;
  width: 100%;
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

.modal-close-button {
  margin: 0;
  padding: 5px;
  background-color: #18181b;
  border: 1px solid #18181b;
  border-radius: 4px;
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 32px;
  z-index: 2;
  line-height: 16px;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    border: 1px solid rgb(119 69 69);
    background-color: rgb(45 27 27 / 90%);
  }
}

.modal-keyboard-toggle {
  margin: 0 5px 0 0;
  padding: 5px;
  background-color: #18181b;
  border: 1px solid #18181b;
  border-radius: 4px;
  position: absolute;
  top: 10px;
  right: 44px;
  font-size: 32px;
  z-index: 2;
  line-height: 16px;
  cursor: pointer;
  transition: all 0.3s;
  &:hover, &.active {
    border: 1px solid rgb(69 119 69);
    background-color: rgb(27 45 27 / 90%);
  }
}

</style>
