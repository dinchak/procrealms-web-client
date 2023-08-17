<template>
  <n-card :class="getSideClass()" v-if="state.modals.triggersModal">
    <p class="close" v-on:click="state.modals.triggersModal = false ">x</p>

    <n-grid :cols="5" :x-gap="12">
      <n-grid-item :span="3">
        <h3>Triggers</h3>
        <hr style="margin-bottom: 12px"/>
      </n-grid-item>
      <n-grid-item :span="2">
        <h3>Variables</h3>
        <hr/>
      </n-grid-item>

      <n-grid-item>
        <n-tree
            block-line
            checkable
            virtual-scroll
            :data="triggerTreeData"
            :checked-keys="checkedTriggerKeys"
            :selected-keys="selectedTriggerKeys"
            @update:checked-keys="updateCheckedTriggerKeys"
            @update:selected-keys="updateSelectedTriggerKeys"
        />
      </n-grid-item>

      <n-grid-item :span="2">
        <n-grid :cols="2" :x-gap="12">
          <n-grid-item>
            <n-form-item path="trigger-name" label="Name">
              <n-input v-model:value="triggerModel.name" :disabled="triggerModel.key < 1" :allow-input="onlyAlphaNumericMax50"
                       placeholder="Trigger name"/>
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-switch class="triggerSharedSwitch" v-model:value="triggerModel.shared" :disabled="triggerModel.key < 1" aria-label="Shared" @update:value="changeTriggerShared">
              <template #checked>
                Shared across characters
              </template>
              <template #unchecked>
                {{ state.name }}'s trigger
              </template>
            </n-switch>
          </n-grid-item>
        </n-grid>
        <n-form-item path="pattern" label="Pattern">
          <n-input v-model:value="triggerModel.pattern" :disabled="triggerModel.key < 1" placeholder="RegEx pattern (JavaScript)"/>
        </n-form-item>
        <n-form-item path="commands" label="Commands">
          <n-scrollbar>
            <n-input v-model:value="triggerModel.commands" :disabled="triggerModel.key < 1" type="textarea"
                     placeholder="Commands to send to the server. Use $1, $2, $3, ... for captured values. Use $MyVar for variables. Use $MyVar[0], $MyVar[1], $MyVar[2], ... for variables with multiple values."/>
          </n-scrollbar>
        </n-form-item>
      </n-grid-item>

      <n-grid-item>
        <n-tree
            block-line
            virtual-scroll
            :data="variableTreeData"
            :selected-keys="selectedVariableKeys"
            @update:selected-keys="updateSelectedVariableKeys"
        />
      </n-grid-item>

      <n-grid-item>
        <n-switch class="variableSharedSwitch" v-model:value="variableModel.shared" :disabled="variableModel.key < 1" aria-label="Shared" @update:value="changeVariableShared">
          <template #checked>
            Shared across characters
          </template>
          <template #unchecked>
            {{ state.name }}'s variable
          </template>
        </n-switch>
        <n-form-item path="variable-name" label="Name">
          <n-input v-model:value="variableModel.name" :disabled="variableModel.key < 1" :allow-input="onlyAlphaNumericMax50"
                   placeholder="Variable name"/>
        </n-form-item>
        <n-form-item path="variable-value" label="Value">
          <n-scrollbar>
            <n-input v-model:value="variableModel.values" :disabled="variableModel.key < 1" type="textarea"
                     placeholder="Value(s) on separate lines." style="height: 110px"/>
          </n-scrollbar>
        </n-form-item>
      </n-grid-item>

      <n-grid-item>
        <n-button type="success" ghost @click="newTrigger">New</n-button>
      </n-grid-item>

      <n-grid-item :span="2">
        <n-button type="warning" ghost @click="saveTrigger" style="margin-right: 8px;">Save</n-button>
        <n-button type="error" ghost @click="deleteTrigger(triggerModel.key)">Delete</n-button>
      </n-grid-item>

      <n-grid-item>
        <n-button type="success" ghost @click="newVariable" style="float: right">New</n-button>
      </n-grid-item>

      <n-grid-item>
        <n-button type="error" ghost @click="deleteVariable(variableModel.key)" style="float: right">Delete</n-button>
        <n-button type="warning" ghost @click="saveVariable" style="margin-right: 8px; float: right">Save</n-button>
      </n-grid-item>
    </n-grid>

  </n-card>
</template>

<script setup>
import { NButton, NCard, NFormItem, NGrid, NGridItem, NInput, NScrollbar, NSwitch, NTree } from 'naive-ui'
import { state } from '@/composables/state'
import { useKeyHandler } from '@/composables/key_handler'
import { onMounted, ref } from "vue"
import { getNextKey, loadSettingsByNameAndType, storeSettingsOfType } from "@/composables/triggers"

const { onKeydown, keyState } = useKeyHandler()

const triggerModel = ref({ key: '-1', name: "", pattern: "", commands: "", active: false, shared: false })
const triggerTreeData = ref([])
const checkedTriggerKeys = ref([])
const selectedTriggerKeys = ref([])

const variableModel = ref({ key: '-1', name: "", values: "", shared: false })
const variableTreeData = ref([])
const selectedVariableKeys = ref([])

function getSideClass() {
  return state.options.swapControls ? 'triggers-modal-right' : 'triggers-modal-left'
}

const updateCheckedTriggerKeys = (keys) => {
  Array.from(state.triggers.value.values()).forEach(t => t.active = false)
  keys.forEach(key => {
    state.triggers.value.get(key).active = true
  })
  checkedTriggerKeys.value = keys
  storeSettingsOfType(state.triggers, 'triggers')
}

const updateSelectedTriggerKeys = (keys) => {
  if (keys.length === 1) {
    let key = keys[0]
    selectedTriggerKeys.value = [key]
    let trigger = state.triggers.value.get(key)
    triggerModel.value.key = key
    triggerModel.value.name = trigger.name
    triggerModel.value.pattern = trigger.patterns[0]
    triggerModel.value.commands = trigger.commands
    triggerModel.value.shared = trigger.shared
  }
}

const updateSelectedVariableKeys = (keys) => {
  if (keys.length === 1) {
    let key = keys[0]
    selectedVariableKeys.value = [key]
    let variable = state.variables.value.get(key)
    variableModel.value.key = key
    variableModel.value.name = variable.name
    variableModel.value.values = variable.values.join('\n')
    variableModel.value.shared = variable.shared
  }
}

function onlyAlphaNumericMax50(value) {
  return /^[a-zA-Z][a-zA-Z0-9]{0,50}$/.test(value) || !value
}

function changeTriggerShared(shared) {
  triggerModel.value.shared = shared
  storeSettingsOfType(state.triggers, 'triggers')
}

function changeVariableShared(shared) {
  variableModel.value.shared = shared
  storeSettingsOfType(state.variables, 'variables')
}

onKeydown((ev) => {
  if (keyState.alt || keyState.ctrl) {
    return false
  }

  if (state.mode === 'input') {
    return false
  }

  if (ev.code === 'KeyT' && !state.modals.triggersModal) {
    state.modals.triggersModal = true
    return true
  }

  if (ev.code === 'Escape' && state.modals.triggersModal) {
    state.modals.triggersModal = false
    return true
  }
})

function newTrigger() {
  let key = getNextKey(state.triggers.value) + ''
  triggerModel.value = { key, name: 'NewTrigger', pattern: null, commands: null, active: false, shared: false }
  state.triggers.value.set(key, { name: 'NewTrigger', patterns: [''], commands: null, active: false, shared: false })
  updateTriggerTree()
  storeSettingsOfType(state.triggers, 'triggers')
}

function newVariable() {
  let key = getNextKey(state.variables.value) + ''
  variableModel.value = { key, name: 'NewVariable', values: null, shared: false }
  state.variables.value.set(key, { name: 'NewVariable', values: null, shared: false })
  updateVariableTree()
  storeSettingsOfType(state.variables, 'variables')
}

function saveTrigger(e) {
  e?.preventDefault()
  if (triggerModel.value.name && onlyAlphaNumericMax50(triggerModel.value.name)) {
    let trigger = state.triggers.value.get(triggerModel.value.key)
    trigger.name = triggerModel.value.name
    trigger.patterns[0] = triggerModel.value.pattern
    trigger.commands = triggerModel.value.commands
    trigger.shared = triggerModel.value.shared
    updateTriggerTree()
    storeSettingsOfType(state.triggers, 'triggers')
  }
}

function saveVariable(e) {
  e?.preventDefault()
  if (variableModel.value.name && onlyAlphaNumericMax50(variableModel.value.name)) {
    let variable = state.variables.value.get(variableModel.value.key)
    variable.name = variableModel.value.name
    variable.values = variableModel.value.values
    variable.shared = variableModel.value.shared
    updateVariableTree()
    storeSettingsOfType(state.variables, 'variables')
  }
}
function deleteTrigger(key) {
  state.triggers.value.delete(key)
  triggerModel.value = { key: '-1', name: "", pattern: "", commands: "", active: false, shared: false }
  updateTriggerTree()
  storeSettingsOfType(state.triggers, 'triggers')
}

function deleteVariable(key) {
  state.variables.value.delete(key)
  variableModel.value = { key: '-1', name: "", values: "", shared: false }
  updateVariableTree()
  storeSettingsOfType(state.variables, 'variables')
}

function updateTriggerTree() {
  triggerTreeData.value = []
  checkedTriggerKeys.value = []

  state.triggers.value.forEach((trigger, key) => {
    triggerTreeData.value.push({ key, label: (trigger.shared ? '• ' : '') + trigger.name })
    if (trigger.active) {
      checkedTriggerKeys.value.push(key)
    }
  })

  selectedTriggerKeys.value = [triggerModel.value.key]
}

function updateVariableTree() {
  variableTreeData.value = []
  state.variables.value.forEach((variable, key) => {
    variableTreeData.value.push({ key, label: (variable.shared ? '• ' : '') + variable.name })
  })
  selectedVariableKeys.value = [variableModel.value.key]
}

onMounted(() => {
  updateTriggerTree()
  selectedTriggerKeys.value = []
  updateVariableTree()
  selectedVariableKeys.value = []
})

window.onstorage = (event) => {
  if (event.key === 'triggers') {
    loadSettingsByNameAndType(state.triggers, state.name, 'triggers')
    updateTriggerTree()
    updateSelectedTriggerKeys([triggerModel.value.key])
  }
  if (event.key === 'variables') {
    loadSettingsByNameAndType(state.variables, state.name, 'variables')
    updateVariableTree()
    updateSelectedVariableKeys([variableModel.value.key])
  }
}

</script>

<style scoped lang="less">

.n-card {
  position: absolute;
  margin-top: 125px;
  max-width: calc(100vw - 290px);
  z-index: 3;
}

.n-tree {
  height: 274px;
  border-radius: 3px;
  background-color: #303033
}

.triggerSharedSwitch {
  width: 100%;
  margin-top: 32px;
}

.variableSharedSwitch {
  width: 100%;
  margin-top: 16px;
  margin-bottom: 16px;
}

.triggers-modal-left {
  left: 8px
}

.triggers-modal-right {
  right: 8px;
}

.close {
  position: absolute;
  top: -10px;
  right: 10px;
  cursor: pointer;
  font-size: 1.4em;
}
</style>
