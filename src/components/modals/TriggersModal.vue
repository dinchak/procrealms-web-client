<template>
  <n-modal
    v-model:show="state.modals.triggersModal"
    title="Triggers"
  >    
    <n-card
      title="Automation"
      closable
      @close="onCloseModal"
    >
    <n-tabs
      type="line"
      pane-class="automation-tab-pane"
    >
      <!-- Triggers section: -->
      <n-tab-pane name="Triggers">
        <n-grid x-gap="24" y-gap="24" :cols="3">
          <n-grid-item>
            <n-grid y-gap="12" :cols="1">
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
              <n-grid-item>
                <n-button :block="true" type="success" ghost @click="newTrigger">New</n-button>
              </n-grid-item>
            </n-grid>
          </n-grid-item>
          <n-grid-item :span="2">
            <n-grid x-gap="24" :cols="4">
              <n-grid-item :span="3">
                <n-form-item path="trigger-name" label="Name">
                  <n-input v-model:value="triggerModel.name" :disabled="triggerModel.key < 1"
                    :allow-input="onlyAlphaNumericMax50"
                    placeholder="Trigger name"
                  />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="Enabled">
                  <n-switch v-model:value="triggerModel.active" :disabled="triggerModel.key < 1" aria-label="Enabled" />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            <n-form-item path="pattern" label="Pattern">
              <n-input-group>
                <n-input v-model:value="triggerModel.pattern" :disabled="triggerModel.key < 1"
                placeholder="RegEx pattern (JavaScript)"/>
                <!-- <n-select :style="{ width: '35%' }" :disabled="triggerModel.key < 1" default-value="RegEx" :options="[{'label': 'Exact Match', 'value': 'substring'}, {'label': 'RegEx', 'value': 'regex'}]" /> -->
              </n-input-group>
            </n-form-item>
            <n-form-item path="commands" label="Commands">
              <n-scrollbar>
                <n-input v-model:value="triggerModel.commands" :disabled="triggerModel.key < 1" type="textarea"
                placeholder="Commands to send to the server. Use $1, $2, $3, ... for captured values. Use $MyVar for variables. Use $MyVar[0], $MyVar[1], $MyVar[2], ... for variables with multiple values."/>
              </n-scrollbar>
            </n-form-item>
            <n-checkbox v-model:checked="triggerModel.shared" :disabled="triggerModel.key < 1" aria-label="Share across characters" @update:checked="changeTriggerShared">
              Share across characters
            </n-checkbox>
            <n-space justify="end" style="margin-top: 1.5em;">
              <n-button type="error" ghost :disabled="triggerModel.key < 1" @click="deleteTrigger(triggerModel.key)">Delete</n-button>
              <n-button type="warning" ghost :disabled="triggerModel.key < 1" @click="saveTrigger">Save</n-button>
            </n-space>
          </n-grid-item>
        </n-grid>
      </n-tab-pane>
      <!-- Variables section: -->
      <n-tab-pane name="Variables">
        <n-grid x-gap="24" y-cap="24" :cols="3">
          <n-grid-item>
            <n-grid y-gap="12" :cols="1">
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
                <n-button :block="true" type="success" ghost @click="newVariable">New</n-button>
              </n-grid-item>
            </n-grid>
          </n-grid-item>
          <n-grid-item :span="2">
            <n-form-item path="variable-name" label="Name">
              <n-input v-model:value="variableModel.name" :disabled="variableModel.key < 1"
              :allow-input="onlyAlphaNumericMax50"
              placeholder="Variable name"/>
            </n-form-item>
            <n-form-item path="variable-value" label="Value">
              <n-scrollbar>
                <n-input v-model:value="variableModel.values" :disabled="variableModel.key < 1" type="textarea"
                placeholder="Value(s) on separate lines." style="height: 110px"/>
              </n-scrollbar>
            </n-form-item>
            <n-checkbox v-model:checked="variableModel.shared" :disabled="variableModel.key < 1" aria-label="Share across characters" @update:checked="changeVariableShared">
              Share across characters
            </n-checkbox>
            <n-space justify="end" style="margin-top: 1.5em">
              <n-button type="error" ghost :disabled="variableModel.key < 1" @click="deleteVariable(variableModel.key)">Delete
              </n-button>
              <n-button type="warning" ghost :disabled="variableModel.key < 1" @click="saveVariable">Save
              </n-button>
            </n-space>
          </n-grid-item>
        </n-grid>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</n-modal>

</template>

<script setup>
import {
  NButton,
  NCard,
  NCheckbox,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NInputGroup,
  NModal,
  NScrollbar,
  NSpace,
  NSwitch,
  NTabPane,
  NTabs,
  NTree
} from 'naive-ui'

import {prevMode, state} from '@/static/state'
import {onBeforeUnmount, onMounted, ref} from "vue"
import {getNextKey, loadSettingsByNameAndType, storeSettingsOfType} from "@/static/triggers"

const triggerModel = ref({ key: '-1', name: "", pattern: "", commands: "", active: false, shared: false })
const triggerTreeData = ref([])
const checkedTriggerKeys = ref([])
const selectedTriggerKeys = ref([])

const variableModel = ref({ key: '-1', name: "", values: "", shared: false })
const variableTreeData = ref([])
const selectedVariableKeys = ref([])

function updateCheckedTriggerKeys (keys) {
  Array.from(state.triggers.value.values()).forEach(t => t.active = false)

  for (let key of keys) {
    state.triggers.value.get(key).active = true
  }

  checkedTriggerKeys.value = keys
  storeSettingsOfType(state.triggers, 'triggers')
  updateSelectedTriggerKeys([triggerModel.value.key])
}

function updateSelectedTriggerKeys (keys) {
  if (keys.length === 1) {
    let key = keys[0]
    let trigger = state.triggers.value.get(key)

    selectedTriggerKeys.value = [key]

    triggerModel.value.key = key
    triggerModel.value.name = trigger.name
    triggerModel.value.pattern = trigger.patterns[0]
    triggerModel.value.commands = trigger.commands
    triggerModel.value.shared = trigger.shared
    triggerModel.value.active = trigger.active
  }
}

function updateSelectedVariableKeys (keys) {
  if (keys.length === 1) {
    let key = keys[0]
    let variable = state.variables.value.get(key)

    selectedVariableKeys.value = [key]

    variableModel.value.key = key
    variableModel.value.name = variable.name
    variableModel.value.values = variable.values
    variableModel.value.shared = variable.shared
  }
}

function onlyAlphaNumericMax50 (value) {
  return /^[a-zA-Z][a-zA-Z0-9]{0,50}$/.test(value) || !value
}

function changeTriggerShared (shared) {
  triggerModel.value.shared = shared
  storeSettingsOfType(state.triggers, 'triggers')
}

function changeVariableShared (shared) {
  variableModel.value.shared = shared
  storeSettingsOfType(state.variables, 'variables')
}

function newTrigger () {
  let key = getNextKey(state.triggers.value) + ''

  triggerModel.value = {
    key,
    name: 'NewTrigger',
    pattern: null,
    commands: null,
    active: false,
    shared: false
  }

  state.triggers.value.set(key, {
    name: 'NewTrigger',
    patterns: [''],
    commands: null,
    active: false,
    shared: false
  })

  updateTriggerTree()
  storeSettingsOfType(state.triggers, 'triggers')
}

function newVariable () {
  let key = getNextKey(state.variables.value) + ''

  variableModel.value = {
    key,
    name: 'NewVariable',
    values: null,
    shared: false
  }

  state.variables.value.set(key, {
    name: 'NewVariable',
    values: null,
    shared: false
  })

  updateVariableTree()
  storeSettingsOfType(state.variables, 'variables')
}

function saveTrigger (ev) {
  if (ev) {
    ev.preventDefault()
  }

  if (triggerModel.value.name && onlyAlphaNumericMax50(triggerModel.value.name)) {
    let trigger = state.triggers.value.get(triggerModel.value.key)
    trigger.name = triggerModel.value.name
    trigger.patterns[0] = triggerModel.value.pattern
    trigger.commands = triggerModel.value.commands
    trigger.shared = triggerModel.value.shared
    trigger.active = triggerModel.value.active
    updateTriggerTree()
    storeSettingsOfType(state.triggers, 'triggers')
  }
}

function saveVariable (ev) {
  if (ev) {
    ev.preventDefault()
  }

  if (variableModel.value.name && onlyAlphaNumericMax50(variableModel.value.name)) {
    let variable = state.variables.value.get(variableModel.value.key)
    variable.name = variableModel.value.name
    variable.values = variableModel.value.values
    variable.shared = variableModel.value.shared
    updateVariableTree()
    storeSettingsOfType(state.variables, 'variables')
  }
}

function deleteTrigger (key) {
  triggerModel.value = {
    key: '-1',
    name: '',
    pattern: '',
    commands: '',
    active: false,
    shared: false
  }

  state.triggers.value.delete(key)
  updateTriggerTree()
  storeSettingsOfType(state.triggers, 'triggers')
}

function deleteVariable (key) {
  variableModel.value = {
    key: '-1',
    name: '',
    values: '',
    shared: false
  }

  state.variables.value.delete(key)
  updateVariableTree()
  storeSettingsOfType(state.variables, 'variables')
}

function updateTriggerTree () {
  let triggers = state.triggers.value || new Map()

  triggerTreeData.value = []
  checkedTriggerKeys.value = []

  triggers.forEach((trigger, key) => {
    triggerTreeData.value.push({
      key,
      label: (trigger.shared ? '• ' : '') + trigger.name
    })

    if (trigger.active) {
      checkedTriggerKeys.value.push(key)
    }
  })

  selectedTriggerKeys.value = [triggerModel.value.key]
}

function updateVariableTree () {
  let variables = state.variables.value || new Map()

  variableTreeData.value = []

  variables.forEach((variable, key) => {
    variableTreeData.value.push({
      key,
      label: (variable.shared ? '• ' : '') + variable.name
    })
  })

  selectedVariableKeys.value = [variableModel.value.key]
}

function onCloseModal () {
  if (!state.modals.triggersModal) {
    return
  }
  state.modals.triggersModal = false
  prevMode()
}

function onStorage (event) {
  if (event.key === 'triggers') {
    loadSettingsByNameAndType(state.triggers, state.name, 'triggers')
    updateTriggerTree()
    if (state.triggers.value.get([triggerModel.value.key])) {
      updateSelectedTriggerKeys([triggerModel.value.key])
    } else {
      triggerModel.value = {
        key: '-1',
        name: '',
        pattern: '',
        commands: '',
        active: false,
        shared: false
      }
    }
  }

  if (event.key === 'variables') {
    loadSettingsByNameAndType(state.variables, state.name, 'variables')
    updateVariableTree()
    if (state.variables.value.get([variableModel.value.key])) {
      updateSelectedVariableKeys([variableModel.value.key])
    } else {
      variableModel.value = {
        key: '-1',
        name: '',
        values: '',
        shared: false
      }
    }
  }
}

onMounted(() => {
  updateTriggerTree()
  selectedTriggerKeys.value = []

  updateVariableTree()
  selectedVariableKeys.value = []

  state.inputEmitter.on('closeModal', onCloseModal)
  window.addEventListener('storage', onStorage)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', onCloseModal)
  window.removeEventListener('storage', onStorage)
})

</script>

<style scoped lang="less">

.n-card {
  position: absolute;
  margin-top: 35px;
  width: 800px;
  max-width: calc(100vw - 290px);
  z-index: 3;
  overflow-y: scroll;
  left: 0; /* align center */
  right: 0; /* align center */
  margin-left: auto; /* align center */
  margin-right: auto; /* align center */
}

.automation-tab-pane {
  margin-top: 1em;
}

.n-tree {
  height: 274px;
  border-radius: 3px;
  background-color: #303033
}

</style>
