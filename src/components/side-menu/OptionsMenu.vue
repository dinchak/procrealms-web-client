<template>
  <div class="options-menu">
    <n-switch v-model:value="state.options.numPadMovement" aria-label="Enable Numpad Movement">
      <template #checked>
        Enable Numpad Movement
      </template>
      <template #unchecked>
        Disable Numpad Movement
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.wasdMovement" aria-label="Enable WASD Movement">
      <template #checked>
        Enable WASD Movement
      </template>
      <template #unchecked>
        Disable WASD Movement
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.fixedMap" aria-label="Fixed Mini Map">
      <template #checked>
        Fixed Minimap
      </template>
      <template #unchecked>
        Scrolling Minimap
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.commandHistoryButton" aria-label="Hide Mobile Buttons">
      <template #checked>
        Show Mobile Buttons
      </template>
      <template #unchecked>
        Hide Mobile Buttons
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.swapControls" aria-label="Menu On Left">
      <template #checked>
        Menu On Right
      </template>
      <template #unchecked>
        Menu On Left
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.chatInMain" aria-label="Chat In Main Output">
      <template #checked>
        Chat In Main Output
      </template>
      <template #unchecked>
        Chat Only In Tabs
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.showTabs" aria-label="Show Tabs">
      <template #checked>
        Show Tabs
      </template>
      <template #unchecked>
        Hide Tabs
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.showMapArea" aria-label="Show Map Area">
      <template #checked>
        Show Map Area
      </template>
      <template #unchecked>
        Hide Map Area
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.showQuickSlots" aria-label="Show Quick Slots">
      <template #checked>
        Show Quick Slots
      </template>
      <template #unchecked>
        Hide Quick Slots
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.showMobileMovement" aria-label="Show Mobile Movement">
      <template #checked>
        Show Mobile Movement
      </template>
      <template #unchecked>
        Hide Mobile Movement
      </template>
    </n-switch>

    <n-switch v-model:value="state.options.keepSentCommands" aria-label="Keep Sent Commands">
      <template #checked>
        Keep Sent Commands
      </template>
      <template #unchecked>
        Clear Sent Commands
      </template>
    </n-switch>

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
import { NSwitch, NButton, NRadioGroup, NRadioButton } from 'naive-ui'

import { state } from '@/composables/state'
import { watch, ref} from 'vue';

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

function goFullscreen () {
  let app = document.getElementById('app')
  app.requestFullscreen()
}

function setFont(value) {
    if (value) {
        document.getElementsByTagName('body')[0].style.fontFamily = 'Inconsolata, monospace'
    } else document.getElementsByTagName('body')[0].style.fontFamily = 'DOS, monospace'
}

function changeFontSize() {
    state.options.fontSize = selectedFontSize.value;
    document.getElementsByTagName('html')[0].style.fontSize = selectedFontSize.value;
}

</script>

<style lang="less">
.options-menu {
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  .n-switch, .n-button {
    margin-bottom: 10px;
    .n-switch__rail {
      width: 100%;
    }
  }

  .font-size-selector {
    align-self: center;
    margin-top: 5px;
    margin-bottom: 20px;
  }
}

</style>
