<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <router-view/>
    <LoginModal></LoginModal>
    <NewPlayerModal></NewPlayerModal>
  </n-config-provider>
</template>

<script setup>
import { onMounted } from 'vue'

import { NConfigProvider, darkTheme } from 'naive-ui'

import { useCookieHandler } from './composables/cookie_handler'
import { useEventHandler } from './composables/event_handler'
import { useWebSocket } from './composables/web_socket'
import { useWindowHandler } from './composables/window_handler'

import LoginModal from './components/LoginModal.vue'
import NewPlayerModal from './components/NewPlayerModal.vue'

import { state } from './composables/state'

const themeOverrides = {
  Button: {
    fontSizeLarge: '20px'
  }
}

const { readCookie, clearCookie } = useCookieHandler()
const { onEvent } = useEventHandler()
const { initConnection, send } = useWebSocket()
useWindowHandler()

function onConnect () {
  try {
    state.connected = true
    let json = readCookie()
    if (json) {
      let prefs = JSON.parse(json)
      if (!prefs.name || !prefs.token) {
        return
      }

      state.token = prefs.token
      state.name = prefs.name

      send('token', { name: state.name, token: state.token, width: 70, height: 24, ttype: 'play.proceduralrealms.com' })
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

  let url = 'ws://localhost:8001'
  if (process.env.NODE_ENV == 'production') {
    url = 'ws://proceduralrealms.com:8000'
  }

  initConnection({ onConnect, onClose, onEvent, url })
}

function onClose () {
  state.connected = false
  console.log('connection closed')
  setTimeout(doConnect, 2000)
}

onMounted(doConnect)
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

.red { color: #c50f1f }
.green { color: #13a10e }
.yellow { color: #c19c00 }
.blue { color: #0037da }
.magenta { color: #881798 }
.cyan { color: #3a96dd }
.white { color: #cccccc }
.black { color: #767676 }
.bold-red { color: #e74856 }
.bold-green { color: #16c60c }
.bold-yellow { color: #f9f1a5 }
.bold-blue { color: #3b78ff }
.bold-magenta { color: #b4009e }
.bold-cyan { color: #61d6d6 }
.bold-white { color: #f2f2f2 }

b {
  font-weight: normal !important;
}
</style>
