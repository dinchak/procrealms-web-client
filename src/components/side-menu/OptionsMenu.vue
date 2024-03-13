<template>
  <div class="options-menu">

    <h3>Sidebar</h3>

    <div class="option">
      <label for="option-show-map-area">Show Map Area</label>
      <n-switch id="option-show-map-area" v-model:value="state.options.showMobileMenuMap" aria-label="Show Map Area"></n-switch>
    </div>

    <div class="option">
      <label for="option-fixed-minimap">Fixed Minimap</label>
      <n-switch id="option-fixed-minimap" v-model:value="state.options.fixedMobileMenuMap" aria-label="Fixed Mini Map"></n-switch>
    </div>

    <div class="option">
      <label for="option-swap-menu-side">Swap Menu Side</label>
      <n-switch id="option-swap-menu-side" v-model:value="state.options.swapMobileMenuSide" aria-label="Swap Menu Side"></n-switch>
    </div>

    <h3>General</h3>

    <div class="option">
      <label for="option-minimap-in-room-description">Minimap In Room Description</label>
      <n-switch id="option-minimap-in-room-description" v-model:value="state.options.roomDescriptionMinimap" aria-label="Minimap In Room Description"></n-switch>
    </div>

    <div class="option">
      <label for="option-chat-in-main-output">Chat In Main Output</label>
      <n-switch id="option-chat-in-main-output" v-model:value="state.options.chatInMain" aria-label="Chat In Main Output"></n-switch>
    </div>

    <div class="option">
      <label for="option-keep-sent-commands">Keep Sent Commands</label>
      <n-switch id="option-keep-sent-commands" v-model:value="state.options.keepSentCommands" aria-label="Keep Sent Commands"></n-switch>
    </div>

    <div class="option">
      <label for="option-text-input-always-focused">Text Input Always Focused</label>
      <n-switch id="option-text-input-always-focused" v-model:value="state.options.textInputAlwaysFocused" aria-label="Text Input Always Focused"></n-switch>
    </div>

    <h3 class="pad-top">Font Settings</h3>

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

    <h3 v-if="Object.values(state.gamepads).length > 0">Connected Gamepads</h3>
    <ul v-bind:key="idx" v-for="(gamepad, idx) in state.gamepads">
      <li>{{ gamepad }}</li>
    </ul>

    <n-button style="margin-top: 30px" class="menu-button" type="info" @click="openTriggersModal()" ghost>Triggers</n-button>
    <n-button class="menu-button" type="success" @click="goFullscreen()" ghost>Full Screen</n-button>
    <n-button class="menu-button" type="warning" @click="openHelpModal()" ghost>Help</n-button>
    <n-button class="menu-button" type="error" @click="openLogoutModal()" ghost>Logout</n-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NSwitch, NButton, NRadioGroup, NRadioButton, NSelect } from 'naive-ui'
import { state, setMode } from '@/composables/state'
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

const fontOptions = [
{
  label: 'Big Blue Terminal',
  value: 'Big Blue Terminal, monospace'
},
{
  label: 'Consola Mono',
  value: 'Consola Mono, monospace'
},
{
  label: 'DOS',
  value: 'DOS, monospace'
},
{
  label: 'Inconsolata',
  value: 'Inconsolata, monospace'
},
{
  label: 'Monofonto',
  value: 'Monofonto, monospace'
},
{
  label: 'Source Code Pro',
  value: 'Source Code Pro, monospace'
},
{
  label: 'Ubuntu Mono',
  value: 'Ubuntu Mono, monospace'
},
{
  label: 'VT323',
  value: '"VT323", monospace'
}
]

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

function openTriggersModal () {
  setMode('modal')
  state.modals.triggersModal = true
}

function openHelpModal () {
  setMode('modal')
  state.modals.helpModal = true
}

function openLogoutModal () {
  setMode('modal')
  state.modals.logoutModal = true
}

</script>

<style lang="less">
.options-menu {
  padding: 0 10px;
  display: flex;
  flex-direction: column;

  .pad-top {
    padding-top: 20px;
  }

  h3 {
    padding: 0;
    margin: 5px 0 5px 0;
    font-weight: normal;
    text-decoration: underline;
  }

  ul {
    margin: 0;
    list-style: none;
    padding: 0 0 0 10px;
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
    margin-bottom: 10px;
  }

  .menu-button {
    margin-bottom: 10px;
    &:first-child {
      margin-top: 10px;
    }
  }
}

</style>
