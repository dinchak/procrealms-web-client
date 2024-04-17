<template>
<div :class="getScrollContainerClass()">
  <div class="instructions">
    <NCollapse>
      <NCollapseItem title="Instructions" name="instructions">
        <p>
          To map a new input, click the <span class="bold-yellow">Add</span> <NIcon :style="{ height: '12px' }"><AddOutlined></AddOutlined></NIcon> button next to the input you want to map. Then press the key or button you want to map to that input. You can also select the modes that the input will be active in. If you want the input to only be active in battle, check the <span class="bold-red">Only In Battle</span> checkbox. If you want the input to only be active outside of battle, check the <span class="bold-green">Only Outside Battle</span> checkbox.
        </p>
        <p>
          To remove a binding, click the <span class="bold-red">Delete</span> <NIcon :style="{ height: '12px' }"><DeleteOutlined></DeleteOutlined></NIcon> button next to the binding you want to remove.
        </p>
        <p>
          To reset all input mappings, click the <span class="bold-yellow">Reset All Mappings</span> button at the bottom.
        </p>
        <p>
          <span class="bold-cyan">Mode reference:</span>
          <ul>
            <li>
              login - Controls are active on the login page
            </li>
            <li>
              hotkey - Controls are active when the main text input is not focused
            </li>
            <li>
              input - Controls are active when the main text input is focused
            </li>
            <li>
              modal - Controls are active when the game modal is open and the main text input is not focused
            </li>
            <li>
              modal-input - Controls are active when the game modal is open and the mini text input is focused
            </li>
            <li>
              radial - Controls are active when the radial menu is open
            </li>
          </ul>
        </p>
      </NCollapseItem>
    </NCollapse>
  </div>
  <NGrid class="input-mappings-grid" cols="1 350:2 700:3 1050:4">
    <NGi
      v-for="mapping in state.inputMappings"
      :key="mapping.event"
      class="mapping-cell"
    >
      <div class="mapping-label">
        <div class="label">
          {{ mapping.label }}
        </div>
        <NButton @click="addBinding(mapping)">
          <NIcon>
            <AddOutlined />
          </NIcon>
        </NButton>
      </div>

      <div v-if="mapNextInput && selectedMapping.event == mapping.event">
        <div class="binding">
          <span class="bold-magenta">* </span>
          <span class="bold-yellow">Waiting For Input</span>
          <span class="bold-magenta"> *</span>
        </div>
        <div class="button-container">
          <NButton type="warning" ghost @click="mapNextInput = false">Cancel</NButton>
        </div>
      </div>

      <div class="new-binding" v-if="newBinding && selectedMapping.event == mapping.event">
        <div class="binding" v-if="newBindingType == 'keyCode'">
          <span class="black">[</span>
          <span class="bold-magenta">Keycode</span>
          <span class="black">] </span>

          <span v-if="newBinding.ctrl" class="yellow">Ctrl+</span>
          <span v-if="newBinding.shift" class="yellow">Shift+</span>
          <span v-if="newBinding.alt" class="yellow">Alt+</span>

          <span class="bold-yellow">{{ newBinding.keyCode }}</span>
        </div>

        <div class="binding" v-if="newBindingType == 'gamepadButtonPressed'">
          <span class="black">[</span>
          <span class="bold-magenta">Button Press</span>
          <span class="black">] </span>

          <span class="bold-yellow">{{ newBinding.gamepadButton }}</span>
        </div>

        <div class="binding" v-if="newBindingType == 'gamepadButtonReleased'">
          <span class="black">[</span>
          <span class="bold-magenta">Button Release</span>
          <span class="black">] </span>

          <span class="bold-yellow">{{ newBinding.gamepadButtonReleased }}</span>
        </div>

        <div class="binding" v-if="newBindingType == 'gamepadAxis'">
          <span class="black">[</span>
          <span class="bold-magenta">Gamepad Axis</span>
          <span class="black">] </span>

          <span class="bold-yellow">{{ newBinding.gamepadAxis }}</span>
        </div>

        <NButton
          v-if="newBindingType == 'gamepadButtonPressed'"
          @click="setButtonReleased()"
          type="warning"
          ghost
        >Set To Button Release</NButton>

        <NButton
          v-if="newBindingType == 'gamepadButtonReleased'"
          @click="setButtonPressed()"
          type="warning"
          ghost
        >Set To Button Press</NButton>

        <NSelect
          v-model:value="newBinding.modes"
          placeholder="Select Modes"
          multiple
          :options="getModeOptions()"
          aria-label="Select Modes"
        ></NSelect>

        <NCheckbox v-model:checked="onlyInBattle">
          Only In Battle
        </NCheckbox>

        <NCheckbox v-model:checked="onlyOutsideBattle">
          Only Outside Battle
        </NCheckbox>

        <div class="button-container" v-if="newBinding.modes.length > 0">
          <NButton type="success" ghost @click="saveNewBinding()">Save</NButton>
          <NButton type="warning" ghost @click="newBinding = false">Cancel</NButton>
        </div>
      </div>

      <div class="mappings">
        <div class="mapping" v-for="binding in mapping.bindings" :key="binding">

          <div class="binding-container">
            <div class="binding" v-if="hasBindingType(binding, 'keyCode')">
              <span class="black">[</span>
              <span class="bold-magenta">Keycode</span>
              <span class="black">] </span>

              <span v-if="binding.ctrl" class="yellow">Ctrl+</span>
              <span v-if="binding.shift" class="yellow">Shift+</span>
              <span v-if="binding.alt" class="yellow">Alt+</span>

              <span class="bold-yellow">{{ binding.keyCode }}</span>
            </div>

            <div class="binding" v-if="hasBindingType(binding, 'gamepadButton')">
              <span class="black">[</span>
              <span class="bold-magenta">Button Press</span>
              <span class="black">] </span>

              <span class="bold-yellow">{{ binding.gamepadButton }}</span>
            </div>

            <div class="binding" v-if="hasBindingType(binding, 'gamepadButtonReleased')">
              <span class="black">[</span>
              <span class="bold-magenta">Button Release</span>
              <span class="black">] </span>

              <span class="bold-yellow">{{ binding.gamepadButtonReleased }}</span>
            </div>

            <div class="binding" v-if="hasBindingType(binding, 'gamepadAxis')">
              <span class="black">[</span>
              <span class="bold-magenta">Gamepad Axis</span>
              <span class="black">] </span>

              <span class="bold-yellow">{{ binding.gamepadAxis }}</span>
            </div>

            <div class="modes">
              <span class="black">[</span>
              <span class="bold-cyan">Modes</span>
              <span class="black">] </span>
              
              <span class="bold-white"></span>{{ binding.modes.join(', ') }}
            </div>

            <div class="battle" v-if="mapping.hasOwnProperty('inBattle') && mapping.inBattle === true">
              <span class="black">[</span>
              <span class="bold-red">In Battle Only</span>
              <span class="black">]</span>
            </div>

            <div class="battle" v-if="mapping.hasOwnProperty('inBattle') && mapping.inBattle === false">
              <span class="black">[</span>
              <span class="bold-green">Outside Battle Only</span>
              <span class="black">]</span>
            </div>

            <div class="button-container" v-if="bindingToRemove == binding">
              <NButton type="error" ghost @click="confirmRemoveBinding(binding, mapping)">Delete</NButton>
              <NButton type="warning" ghost @click="bindingToRemove = false">Cancel</NButton>
            </div>
          </div>

          <NButton @click="removeBinding(binding)">
            <NIcon>
              <DeleteOutlined />
            </NIcon>
          </NButton>
        </div>
      </div>
    </NGi>
  </NGrid>

  <div class="reset-button-container">
    <NButton v-if="!confirmResetInputMappings" type="warning" ghost @click="confirmResetInputMappings = true">Reset All Mappings</NButton>
    <NButton v-if="confirmResetInputMappings" type="error" ghost @click="doResetInputMappings()">Confirm Reset</NButton>
    <NButton v-if="confirmResetInputMappings" type="warning" ghost @click="confirmResetInputMappings = false">Cancel</NButton>
  </div>

</div>

</template>

<script setup>
import { defineProps, toRefs, onMounted, onBeforeUnmount, ref } from 'vue'
import { NGrid, NGi, NButton, NIcon, NSelect, NCheckbox, NCollapse, NCollapseItem } from 'naive-ui'
import { state, resetInputMappings } from '@/composables/state'

import AddOutlined from '@vicons/material/AddCircleOutlined'
import DeleteOutlined from '@vicons/material/DeleteOutlined'

const props = defineProps(['miniOutputEnabled'])
const { miniOutputEnabled } = toRefs(props)

const mapNextInput = ref(false)
const selectedMapping = ref({})
const newBinding = ref(false)
const newBindingType = ref('keyCode')
const onlyInBattle = ref(false)
const onlyOutsideBattle = ref(false)
const bindingToRemove = ref(false)
const confirmResetInputMappings = ref(false)

function hasBindingType (binding, type) {
  return typeof binding[type] != 'undefined'
}

function getScrollContainerClass () {
  return {
    'scroll-container': true,
    'mini-output-enabled': miniOutputEnabled.value
  }
}

function getModeOptions () {
  return state.validModes.map(m => {
    return {
      label: m,
      value: m
    }
  })
}

function addBinding (mapping) {
  selectedMapping.value = mapping
  mapNextInput.value = true
}

function setButtonPressed () {
  newBindingType.value = 'gamepadButtonPressed'
  newBinding.value.gamepadButton = newBinding.value.gamepadButtonReleased
  delete newBinding.value.gamepadButtonReleased
}

function setButtonReleased () {
  newBindingType.value = 'gamepadButtonReleased'
  newBinding.value.gamepadButtonReleased = newBinding.value.gamepadButton
  delete newBinding.value.gamepadButton
}

function onKeyCode (keyCode) {
  // console.log(state.metaKeyState)
  // console.log(`onKeyCode keyCode=${keyCode}`)

  if (mapNextInput.value && selectedMapping.value.type != 'degree') {
    newBinding.value = {
      keyCode: keyCode,
      modes: []
    }

    newBindingType.value = 'keyCode'

    if (state.metaKeyState.ctrl) {
      newBinding.value.ctrl = true
    }

    if (state.metaKeyState.shift) {
      newBinding.value.shift = true
    }

    if (state.metaKeyState.alt) {
      newBinding.value.alt = true
    }

    mapNextInput.value = false
  }
}

function onGamepadButtonPressed (button) {
  // console.log(`onGamepadButtonPressed button=${button}`)

  if (mapNextInput.value && selectedMapping.value.type != 'degree') {
    newBinding.value = {
      gamepadButton: button,
      modes: []
    }

    newBindingType.value = 'gamepadButtonPressed'

    mapNextInput.value = false
  }
}

function onGamepadButtonReleased (button) {
  // console.log(`onGamepadButtonReleased button=${button}`)

  if (mapNextInput.value && selectedMapping.value.type != 'degree') {
    newBinding.value = {
      gamepadButtonReleased: button,
      modes: []
    }

    newBindingType.value = 'gamepadButtonReleased'

    mapNextInput.value = false
  }
}

function onGamepadAxis ({ axis }) {
  // console.log(`onGamepadAxis axis=${axis} degree=${degree}`)
  // console.log(selectedMapping.value)

  if (mapNextInput.value && selectedMapping.value.type == 'degree') {
    newBinding.value = {
      gamepadAxis: axis,
      modes: []
    }

    newBindingType.value = 'gamepadAxis'

    mapNextInput.value = false
  }
}

function removeBinding (binding) {
  bindingToRemove.value = binding
}

function confirmRemoveBinding (binding, mapping) {
  state.inputMappings = state.inputMappings.map(m => {
    if (m.event == mapping.event) {
      m.bindings = m.bindings.filter(b => b != binding)
    }
    return m
  })
  bindingToRemove.value = false
}

function saveNewBinding () {
  newBinding.value.inBattle = onlyInBattle.value
  newBinding.value.outsideBattle = onlyOutsideBattle.value

  selectedMapping.value.bindings.push(newBinding.value)

  newBinding.value = false
  onlyInBattle.value = false
  onlyOutsideBattle.value = false

  localStorage.setItem('inputMappings', JSON.stringify(state.inputMappings))
}

function doResetInputMappings () {
  state.inputMappings = resetInputMappings()
  confirmResetInputMappings.value = false
  localStorage.setItem('inputMappings', JSON.stringify(state.inputMappings))
}

onMounted(() => {
  state.inputEmitter.on('keyCode', onKeyCode)
  state.inputEmitter.on('gamepadButtonPressed', onGamepadButtonPressed)
  state.inputEmitter.on('gamepadButtonReleased', onGamepadButtonReleased)
  state.inputEmitter.on('gamepadAxis', onGamepadAxis)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('keyCode', onKeyCode)
  state.inputEmitter.off('gamepadButtonPressed', onGamepadButtonPressed)
  state.inputEmitter.off('gamepadButtonReleased', onGamepadButtonReleased)
  state.inputEmitter.off('gamepadAxis', onGamepadAxis)
})
</script>

<style lang="less">
.scroll-container {
  height: calc(100vh - 75px);
  overflow-y: scroll;
  max-width: 1200px;
  margin: 0 auto;

  .instructions {
    padding: 0 20px;
    margin-top: 20px;
    margin-bottom: 10px;

    .n-collapse {
      .n-collapse-item {
        .n-collapse-item__content-wrapper {
          .n-collapse-item__content-inner {
            padding-top: 0;
            p {
              margin: 0;
              padding: 5px 10px;
              background-color: #111;
              color: #fff;
              ul {
                padding-left: 20px;
                margin-bottom: 0;
                li {
                  margin: 5px 0;
                }
              }
            }
          }
        }
      }
    }
  }

  .button-container {
    display: flex;
    flex-direction: row;
    padding: 5px 0;
    .n-button {
      margin-right: 10px;
    }
  }

  &.mini-output-enabled {
    height: calc(100vh - 225px);
  }

  .reset-button-container {
    display: flex;
    flex-direction: row;
    padding: 0 20px;
    margin-bottom: 30px;
    .n-button {
      margin-right: 10px;
    }
  }

  .input-mappings-grid {
    .mapping-cell {
      padding: 10px;
      margin: 10px;
      .mapping-label {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 3px 0px 3px 10px;
        background-color: #222;
      }
      .new-binding {
        display: flex;
        flex-direction: column;
        padding: 10px;

        .binding, .n-select, .n-checkbox, .n-button {
          margin: 5px;
        }
      }
      .mappings {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        .mapping {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          border-bottom: 1px solid #333;
          width: 100%;
          padding: 4px 0;
          &:last-child {
            border-bottom: none;
          }
          .binding-container {
            display: flex;
            flex-direction: column;
          }
        }
      }
    }
  }
}
</style>