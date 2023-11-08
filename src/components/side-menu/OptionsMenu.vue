<template>
  <div class="options-menu">
    <div class="option">
      <label for="option-show-mobile-buttons">Mobile Input Controls</label>
      <n-switch id="option-show-mobile-buttons" v-model:value="state.options.commandHistoryButton" aria-label="Mobile Input Controls"></n-switch>
    </div>

    <div class="option">
      <label for="option-show-mobile-movement">Mobile Movement Controls</label>
      <n-switch id="option-show-mobile-movement" v-model:value="state.options.showMobileMovement" aria-label="Show Mobile Movement"></n-switch>
    </div>

    <div class="option">
      <label for="option-chat-tabs">Chat Tabs</label>
      <n-switch id="option-chat-tabs" v-model:value="state.options.showTabs" aria-label="Chat Tabs"></n-switch>
    </div>

    <div class="option">
      <label for="option-chat-in-main-output">Chat In Main Output</label>
      <n-switch id="option-chat-in-main-output" v-model:value="state.options.chatInMain" aria-label="Chat In Main Output"></n-switch>
    </div>

    <div class="option">
      <label for="option-show-map-area">Show Map Area</label>
      <n-switch id="option-show-map-area" v-model:value="state.options.showMapArea" aria-label="Show Map Area"></n-switch>
    </div>

    <div class="option">
      <label for="option-fixed-minimap">Fixed Minimap</label>
      <n-switch id="option-fixed-minimap" v-model:value="state.options.fixedMap" aria-label="Fixed Mini Map"></n-switch>
    </div>

    <div class="option">
      <label for="option-show-quick-slots">Show Quick Slots</label>
      <n-switch id="option-show-quick-slots" v-model:value="state.options.showQuickSlots" aria-label="Show Quick Slots"></n-switch>
    </div>

    <div class="option">
      <label for="option-numpad-movement">Numpad Movement</label>
      <n-switch id="option-movement-option" v-model:value="state.options.numPadMovement" aria-label="Numpad Movement"></n-switch>
    </div>

    <div class="option">
      <label for="option-wasd-movement">WASD Movement</label>
      <n-switch id="option-wasd-movement" v-model:value="state.options.wasdMovement" aria-label="WASD Movement"></n-switch>
    </div>
    
    <div class="option">
      <label for="option-keep-sent-commands">Keep Sent Commands</label>
      <n-switch id="option-keep-sent-commands" v-model:value="state.options.keepSentCommands" aria-label="Keep Sent Commands"></n-switch>
    </div>

    <div class="option">
      <label for="option-swap-menu-side">Swap Menu Side</label>
      <n-switch id="option-swap-menu-side" v-model:value="state.options.swapControls" aria-label="Swap Menu Side"></n-switch>
    </div>

    <h3>Font Settings</h3>

    <n-select
      class="font-selector"
      v-model:value="state.options.fontFamily"
      placeholder="Select Font"
      :options="fontOptions"
      aria-label="Select Font"
      @update:value="setFont"
    />

    <n-radio-group v-model:value="selectedFontSize" name="radiobuttongroup1" class="font-size-selector">
      <n-radio-button
        v-for="fontSize in fontSizes"
        :key="fontSize.value"
        :value="fontSize.value"
        :label="fontSize.label"
        @change="changeFontSize"
      />
    </n-radio-group>

    <n-button class="menu-button" type="info" @click="state.modals.triggersModal = !state.modals.triggersModal" ghost>Triggers</n-button>
    <n-button class="menu-button" type="success" @click="goFullscreen()" ghost>Full Screen</n-button>
    <n-button class="menu-button" type="warning" @click="state.showHelp = !state.showHelp" ghost>Help</n-button>
    <n-button class="menu-button" type="error" @click="state.showLogout = true" ghost>Logout</n-button>
  </div>
</template>

<script setup>
import { watch, ref } from 'vue'

import { NSwitch, NButton, NRadioGroup, NRadioButton, NSelect } from 'naive-ui'

import { state } from '@/composables/state'
import { useWindowHandler } from '@/composables/window_handler'

const { triggerResize } = useWindowHandler()

const fontSizes = [{
  value: '14px',
  label: 'Small'
}, {
  value: '16px',
  label: 'Medium'
}, {
  value: '18px',
  label: 'Large'
}]

const selectedFontSize = ref(state.options.fontSize)

const fontOptions = [{
  label: 'Consola Mono',
  value: 'Consola Mono, monospace'
}, {
  label: 'DOS',
  value: 'DOS, monospace'
}, {
  label: 'F25 Bank Printer',
  value: 'F25 Bank Printer, monospace'
}, {
  label: 'Inconsolata',
  value: 'Inconsolata, monospace'
}, {
  label: 'Monofonto',
  value: 'Monofonto, monospace'
}, {
  label: 'Source Code Pro',
  value: 'Source Code Pro, monospace'
}, {
  label: 'Ubuntu Mono',
  value: 'Ubuntu Mono, monospace'
}]

watch(state.options, () => localStorage.setItem('options', JSON.stringify(state.options)))

async function goFullscreen () {
  let app = document.getElementById('app')
  await app.requestFullscreen()
  triggerResize()
}

function setFont () {
  document.getElementsByTagName('body')[0].style.fontFamily = state.options.fontFamily
  triggerResize()
}

function changeFontSize () {
  state.options.fontSize = selectedFontSize.value
  document.getElementsByTagName('html')[0].style.fontSize = selectedFontSize.value
  triggerResize()
}

</script>

<style lang="less">
.options-menu {
  padding: 0 10px;
  display: flex;
  flex-direction: column;

  h3 {
    padding: 0;
    margin: 20px 0 5px 0;
  }

  .option {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .font-selector {
    align-self: center;
    margin-bottom: 10px;
  }

  .font-size-selector {
    align-self: center;
    margin-bottom: 40px;
  }

  .menu-button {
    margin-bottom: 10px;
  }
}

</style>
