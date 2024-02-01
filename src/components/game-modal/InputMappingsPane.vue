<template>
<div :class="getScrollContainerClass()">
  <NGrid class="input-mappings" cols="1 400:2 800:3 1200:4">
    <NGi
      v-for="mapping in state.inputMappings"
      :key="mapping.event"
      class="mapping"
    >
      <div class="mapping-label">{{ mapping.label }}</div>
      <div class="bindings">
        <div class="binding" v-for="binding in mapping.bindings" :key="binding">

          <div class="keycode" v-if="hasBindingType(binding, 'keyCode')">

            <div class="binding-summary">
              <div class="label">Keycode</div>
              <div class="modes">{{ binding.modes.join(', ') }}</div>
            </div>

            <div class="binding-value">
              <div class="meta-keys" v-if="binding.ctrl || binding.shift || binding.alt">
                <span v-if="binding.ctrl">Ctrl+</span>
                <span v-if="binding.shift">Shift+</span>
                <span v-if="binding.alt">Alt+</span>
              </div>
              <div class="value">{{ binding.keyCode }}</div>
            </div>
          </div>

          <div class="keycode" v-if="hasBindingType(binding, 'gamepadButton')">
            <div class="binding-summary">
              <div class="label">Gamepad Button</div>
              <div class="modes">{{ binding.modes.join(', ') }}</div>
            </div>

            <div class="binding-value">
              <div class="value">{{ binding.gamepadButton }}</div>
            </div>
          </div>

          <div class="keycode" v-if="hasBindingType(binding, 'gamepadButtonReleased')">
            <div class="binding-summary">
              <div class="label">Gamepad Button Released</div>
              <div class="modes">{{ binding.modes.join(', ') }}</div>
            </div>

            <div class="binding-value">
              <div class="value">{{ binding.gamepadButtonReleased }}</div>
            </div>
          </div>

          <div class="keycode" v-if="hasBindingType(binding, 'gamepadAxis')">
            <div class="binding-summary">
              <div class="label">Gamepad Axis</div>
              <div class="modes">{{ binding.modes.join(', ') }}</div>
            </div>

            <div class="binding-value">
              <div class="value">{{ binding.gamepadAxis }}</div>
            </div>
          </div>

          <!-- <pre>{{ binding }}</pre> -->
        </div>
      </div>
    </NGi>
  </NGrid>
</div>
</template>

<script setup>
import { defineProps, toRefs } from 'vue'
import { NGrid, NGi } from 'naive-ui'
import { state } from '@/composables/state'

const props = defineProps(['miniOutputEnabled'])
const { miniOutputEnabled } = toRefs(props)

function hasBindingType (binding, type) {
  return typeof binding[type] != 'undefined'
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

  .input-mappings {
    .mapping {
      padding: 10px;
      margin: 10px;
      .mapping-label {
        font-weight: bold;
        margin-bottom: 10px;
        background-color: #242;
        padding: 5px 10px;
      }
      .bindings {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        .binding {
          border: 1px solid #333;
          width: 100%;
          padding: 5px 10px;
          .keycode {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            .binding-summary {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              .label, .modes {
                font-size: 14px;
              }
            }

            .binding-value {
              display: flex;
              flex-direction: column;
              justify-content: center;
              .value {
                font-size: 18px;
                font-weight: bold;
              }
            }
          }
        }
      }
    }
  }
}
</style>