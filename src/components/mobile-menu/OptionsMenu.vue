<template>
  <div class="options-menu">
    <template v-for="(options, title) in configurableOptions" :key="title">
      <h3>{{ title }}</h3>

      <div class="option" v-for="(option, label) in options" :key="label">
        <label :for="'option-' + option">{{ label }}</label>
        <n-switch :id="'option-' + option" v-model:value="state.options[option]" aria-label="{{ label }}" />
      </div>
    </template>

    <h3 class="pad-top">Font Settings</h3>

    <n-select
      class="font-selector"
      v-model:value="selectedFontFamily"
      placeholder="Select Font"
      :options="FONT_OPTIONS"
      aria-label="Select Font"
      @update:value="onSetFontFamily"
    />

    <n-radio-group v-model:value="selectedFontSize" name="radiobuttongroup1" class="font-size-selector">
      <n-radio-button
        v-for="fontSize in FONT_SIZES"
        :key="fontSize.value"
        :value="fontSize.value"
        :label="fontSize.label"
        @change="onSetFontSize"
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
import { state, setMode, configurableOptions } from '@/static/state'
import { useWindowHandler } from '@/composables/window_handler'
import { FONT_OPTIONS, FONT_SIZES } from '@/static/constants'

const { triggerResize, setFontSize, setFontFamily } = useWindowHandler()

const selectedFontSize = ref(state.options.fontSize)
const selectedFontFamily = ref(state.options.fontFamily)

function onSetFontSize () {
  setFontSize(selectedFontSize.value)
}

function onSetFontFamily () {
  setFontFamily(selectedFontFamily.value)
}

async function goFullscreen () {
  let app = document.getElementById('app')
  await app.requestFullscreen()
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
