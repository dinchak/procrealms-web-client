<template>
  <div :class="getScrollContainerClass()">
    <div class="row">
      <template v-for="(options, title) in configurableOptions" :key="title">
        <NGrid class="options" cols="1">
          <NGi>
            <h3>{{ title }}</h3>
          </NGi>

          <NGi v-for="(option, label) in options" :key="label">
            <div class="option">
              <label :for="'option-' + option">{{ label }}</label>
              <NSwitch :id="'option-' + option" v-model:value="state.options[option]" aria-label="{{ label }}"/>
            </div>
          </NGi>
        </NGrid>
      </template>
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
          <NButton style="margin-top: 30px" class="menu-button selectable" type="info" @click="openTriggersModal()"
                   ghost>Triggers
          </NButton>
        </NGi>
        <NGi style="text-align: center">
          <NButton class="menu-button selectable" type="success" @click="toggleFullscreen()"
                   :ghost="!state.isFullscreen">Full Screen
          </NButton>
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
import { state, setMode, configurableOptions } from '@/static/state'
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
    'mini-output-enabled': miniOutputEnabled.value,
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