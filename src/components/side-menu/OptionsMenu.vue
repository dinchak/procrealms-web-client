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
      <label for="option-chat-tabs">Chat In Main Output</label>
      <n-switch id="option-chat-tabs" v-model:value="state.options.chatInMain" aria-label="Chat In Main Output"></n-switch>
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

    <p>Fonts</p>

    <n-switch v-model:value="state.options.fontFamily" aria-label="Font Family" @update:value="setFont">
      <template #checked>
          Inconsolata
      </template>
      <template #unchecked>
          DOS
      </template>
    </n-switch>

    <n-radio-group v-model:value="selectedFontSize" name="radiobuttongroup1" class="font-size-selector">
      <n-radio-button
              v-for="fontSize in fontSizes"
              :key="fontSize.value"
              :value="fontSize.value"
              :label="fontSize.label"
              @change="changeFontSize"
      />
    </n-radio-group>

    <n-button type="info" @click="state.modals.triggersModal = !state.modals.triggersModal" ghost>Triggers</n-button>
    <n-button type="success" @click="goFullscreen()" ghost>Full Screen</n-button>
    <n-button type="warning" @click="state.showHelp = !state.showHelp" ghost>Help</n-button>
    <n-button type="error" @click="state.showLogout = true" ghost>Logout</n-button>
  </div>
</template>

<script setup>
import { watch, ref } from 'vue'

import { NSwitch, NButton, NRadioGroup, NRadioButton } from 'naive-ui'

import { state } from '@/composables/state'
import { useWindowHandler } from '@/composables/window_handler'

const { triggerResize } = useWindowHandler()

const fontSizes = [
    {
        value: '14px',
        label: 'Small'
    },
    {
        value: '16px',
        label: 'Medium'
    },
    {
        value: '18px',
        label: 'Large'
    }
]

const selectedFontSize = ref(state.options.fontSize)

watch(state.options, () => localStorage.setItem('options', JSON.stringify(state.options)))

async function goFullscreen () {
  let app = document.getElementById('app')
  await app.requestFullscreen()
  triggerResize()
}

function setFont (value) {
  if (value) {
    document.getElementsByTagName('body')[0].style.fontFamily = 'Inconsolata, monospace'
  } else {
    document.getElementsByTagName('body')[0].style.fontFamily = 'DOS, monospace'
  }
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
  // .n-switch, .n-button {
    // margin-bottom: 10px;
    // .n-switch__rail {
    //   width: 100%;
    // }
  // }

  .option {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .font-size-selector {
    align-self: center;
    margin-top: 5px;
    margin-bottom: 20px;
  }
}

</style>
