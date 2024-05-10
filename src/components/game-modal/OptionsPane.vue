<template>
  <div :class="getScrollContainerClass()">
    <div class="row">
      <NGrid class="options" cols="1">
        <NGi>
          <h3>Sidebar</h3>
        </NGi>

        <NGi>
          <div class="option">
            <label for="option-show-map-area">Show Map Area</label>
            <NSwitch id="option-show-map-area" v-model:value="state.options.showMobileMenuMap" aria-label="Show Map Area" class="selectable"></NSwitch>
          </div>
        </NGi>

        <NGi>
          <div class="option">
            <label for="option-fixed-minimap">Fixed Minimap</label>
            <NSwitch id="option-fixed-minimap" v-model:value="state.options.fixedMobileMenuMap" aria-label="Fixed Mini Map" class="selectable"></NSwitch>
          </div>
        </NGi>

        <NGi>
          <div class="option">
            <label for="option-swap-menu-side">Swap Menu Side</label>
            <NSwitch id="option-swap-menu-side" v-model:value="state.options.swapMobileMenuSide" aria-label="Swap Menu Side" class="selectable"></NSwitch>
          </div>
        </NGi>
      </NGrid>

      <NGrid class="options" cols="1">
        <NGi>
          <h3>General</h3>
        </NGi>

        <NGi>
          <div class="option">
            <label for="option-minimap-in-room-description">Minimap In Room Description</label>
            <NSwitch id="option-minimap-in-room-description" v-model:value="state.options.roomDescriptionMinimap" aria-label="Minimap In Room Description" class="selectable"></NSwitch>
          </div>
        </NGi>

        <NGi>
          <div class="option">
            <label for="option-chat-in-main-output">Chat In Main Output</label>
            <NSwitch id="option-chat-in-main-output" v-model:value="state.options.chatInMain" aria-label="Chat In Main Output" class="selectable"></NSwitch>
          </div>
        </NGi>

        <NGi>
          <div class="option">
            <label for="option-keep-sent-commands">Keep Sent Commands</label>
            <NSwitch id="option-keep-sent-commands" v-model:value="state.options.keepSentCommands" aria-label="Keep Sent Commands" class="selectable"></NSwitch>
          </div>
        </NGi>

        <NGi>
          <div class="option">
            <label for="option-text-input-always-focused">Text Input Always Focused</label>
            <NSwitch id="option-text-input-always-focused" v-model:value="state.options.textInputAlwaysFocused" aria-label="Text Input Always Focused" class="selectable"></NSwitch>
          </div>
        </NGi>

      </NGrid>
    </div>

    <div class="row">
      <NGrid class="options" cols="1">
        <NGi>
          <h3 class="pad-top">Fonts</h3>
        </NGi>

        <NGi style="text-align: center; margin-bottom: 20px;">
          <NSelect
            class="font-selector selectable"
            v-model:value="state.options.fontFamily"
            placeholder="Select Font"
            :options="FONT_OPTIONS"
            aria-label="Select Font"
            @update:value="onSetFontFamily"
          />
        </NGi>
        <NGi style="text-align: center">
          <NRadioGroup v-model:value="selectedFontSize" name="radiobuttongroup1" class="font-size-selector">
            <NRadioButton
              v-for="fontSize in FONT_SIZES"
              :key="fontSize.value"
              :value="fontSize.value"
              :label="fontSize.label"
              @change="onSetFontSize"
              class="selectable"
            />
          </NRadioGroup>
        </NGi>
      </NGrid>

      <NGrid class="options" cols="1">
        <NGi>
          <h3>Gamepad</h3>
        </NGi>
        <NGi>
          <ul v-bind:key="idx" v-for="(gamepad, idx) in state.gamepads">
            <li>{{ gamepad }}</li>
          </ul>
        </NGi>
        <NGi>
          <div style="text-align: center" v-if="Object.values(state.gamepads).length === 0">No gamepads connected.</div>
        </NGi>
      </NGrid>

      <NGrid class="options" cols="1">
        <NGi style="text-align: center">
          <NButton style="margin-top: 30px" class="menu-button selectable" type="info" @click="openTriggersModal()" ghost>Triggers</NButton>
        </NGi>
        <NGi style="text-align: center">
          <NButton class="menu-button selectable" type="success" @click="toggleFullscreen()" :ghost="!state.isFullscreen">Full Screen</NButton>
        </NGi>
        <NGi style="text-align: center">
          <NButton class="menu-button selectable" type="error" @click="openLogoutModal()" ghost>Logout</NButton>
        </NGi>
      </NGrid>
    </div>

  </div>
</template>

<script setup>
import { ref, defineProps, toRefs } from 'vue'
import { NGrid, NGi, NSwitch, NRadioGroup, NRadioButton, NSelect, NButton } from 'naive-ui'
import { state, setMode } from '@/static/state'
import { useWindowHandler } from '@/composables/window_handler'
import { FONT_OPTIONS, FONT_SIZES } from '@/static/constants'

const props = defineProps(['miniOutputEnabled'])
const { miniOutputEnabled } = toRefs(props)

const { setFontFamily, setFontSize, toggleFullscreen } = useWindowHandler()

const selectedFontSize = ref(state.options.fontSize)
const selectedFontFamily = ref(state.options.fontFamily)

function onSetFontSize () {
  setFontSize(selectedFontSize.value)
}

function onSetFontFamily () {
  setFontFamily(selectedFontFamily.value)
}

function openTriggersModal () {
  setMode('modal')
  state.modals.triggersModal = true
}

function openLogoutModal () {
  setMode('modal')
  state.modals.logoutModal = true
}

function getScrollContainerClass () {
  return {
    'scroll-container': true,
    'mini-output-enabled': miniOutputEnabled.value
  }
}
</script>
<style lang="less" scoped>
.scroll-container {
  height: calc(100vh - 75px);
  overflow-y: scroll;
  max-width: 1200px;
  margin: 0 auto;

  &.mini-output-enabled {
    height: calc(100vh - 225px);
  }

  .row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: wrap;
    justify-content: center;
    .options {
      display: flex;
      flex-direction: column;
      flex-basis: 300px;
      h3 {
        text-align: center;
      }
      .option {
        max-width: 250px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        &.selected {
          background: #121;
        }

        label {
          display: block;
          width: 100%;
          text-align: right;
          margin-right: 20px;
        }

        .n-switch {
          &.selected {
            box-shadow: 0 0 5px #f8ff25;
            color: #f8ff25;
            background-color: #ff0;
          }
        }
      }

      .n-button, .n-select {
        &.selected {
          box-shadow: 0 0 5px #f8ff25;
          color: #f8ff25;            
        }
      }

      .n-radio-button {
        &.selected {
          box-shadow: 0 0 5px #f8ff25;
          color: #f8ff25;
          // background-color: #ff0;
        }
      }

      .menu-button {
        margin-bottom: 10px;
        width: 200px;
        &:first-child {
          margin-top: 10px;
        }
      }

    }
  }
}
</style>