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
            <n-switch class="triggerSharedSwitch" v-model:value="triggerModel.shared" :disabled="triggerModel.key < 1" aria-label="Shared" @update:value="changeShared">
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
                     placeholder="Commands to send to the server. Use $1, $2, $3, ... for captured values."/>
          </n-scrollbar>
        </n-form-item>
      </n-grid-item>

      <n-grid-item>
        <n-tree
            block-line
            virtual-scroll
            :data="variableTreeData"
            :selected-keys="selectedVariablesKeys"
            @update:selected-keys="updateSelectedVariablesKeys"
        />
      </n-grid-item>

      <n-grid-item>
        <n-switch class="variableSharedSwitch" v-model:value="variableModel.shared" :disabled="variableModel.key < 1" aria-label="Shared" @update:value="changeShared">
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
            <n-input v-model:value="variableModel.commands" :disabled="variableModel.key < 1" type="textarea"
                     placeholder="Value(s)" style="height: 110px"/>
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
        <n-button type="success" ghost @click="newTrigger" style="float: right">New</n-button>
      </n-grid-item>

      <n-grid-item>
        <n-button type="error" ghost @click="deleteTrigger(variableModel.key)" style="float: right">Delete</n-button>
        <n-button type="warning" ghost @click="saveTrigger" style="margin-right: 8px; float: right">Save</n-button>
      </n-grid-item>
    </n-grid>

  </n-card>
</template>

<script setup>
import { NButton, NCard, NFormItem, NGrid, NGridItem, NInput, NScrollbar, NSwitch, NTree } from 'naive-ui'
import { state } from '@/composables/state'
import { useKeyHandler } from '@/composables/key_handler'
import { onMounted, ref } from "vue"
import { getNextKey, loadTriggers, storeTriggers } from "@/composables/triggers"

const { onKeydown, keyState } = useKeyHandler()

const triggerModel = ref({ key: '-1', name: "", pattern: "", commands: "", active: false, shared: false })
const triggerTreeData = ref([])
const checkedTriggerKeys = ref([])
const selectedTriggerKeys = ref([])

const variableModel = ref({ key: '-1', name: "", value: "", shared: false })
const variableTreeData = ref([])
// const selectedVariableKeys = ref([])

function getSideClass() {
  return state.options.swapControls ? 'triggers-modal-right' : 'triggers-modal-left'
}

const updateCheckedTriggerKeys = (keys) => {
  Array.from(state.triggers.value.values()).forEach(t => t.active = false)
  keys.forEach(key => {
    state.triggers.value.get(key).active = true
  })
  checkedTriggerKeys.value = keys
  storeTriggers()
}

const updateSelectedTriggerKeys = (keys) => {
  if (keys.length === 1) {
    let key = keys[0]
    selectedTriggerKeys.value = [key]
    let trigger = state.triggers.value.get(key)
    triggerModel.value.key = key
    triggerModel.value.name = trigger.name
    triggerModel.value.pattern = trigger.pattern
    triggerModel.value.commands = trigger.commands
    triggerModel.value.shared = trigger.shared
  }
}

function onlyAlphaNumericMax50(value) {
  return /^[a-zA-Z0-9]{0,50}$/.test(value)
}

function changeShared(shared) {
  triggerModel.value.shared = shared
  storeTriggers()
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
  let key = getNextKey()
  triggerModel.value = { key, name: 'NewTrigger', pattern: null, commands: null, active: false, shared: false }
  state.triggers.value.set(key, { name: 'NewTrigger', pattern: null, commands: null, active: false, shared: false })
  updateTriggerTree()
  storeTriggers()
}

function saveTrigger(e) {
  e?.preventDefault()
  if (triggerModel.value.name && onlyAlphaNumericMax50(triggerModel.value.name)) {
    let trigger = state.triggers.value.get(triggerModel.value.key)
    trigger.name = triggerModel.value.name
    trigger.pattern = triggerModel.value.pattern
    trigger.commands = triggerModel.value.commands
    trigger.shared = triggerModel.value.shared
    updateTriggerTree()
    storeTriggers()
  }
}

function deleteTrigger(key) {
  state.triggers.value.delete(key)
  triggerModel.value = { key: '-1', name: "", pattern: "", commands: "", active: false, shared: false }
  updateTriggerTree()
  storeTriggers()
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

onMounted(() => {
  updateTriggerTree()
  selectedTriggerKeys.value = []
})

window.onstorage = (event) => {
  if (event.key === 'triggers') {
    loadTriggers(state.name)
    updateTriggerTree()
    updateSelectedTriggerKeys([triggerModel.value.key])
  }
}

</script>

<style scoped lang="less">

.n-card {
  position: absolute;
  margin-top: 125px;
  max-width: calc(100vw - 610px);
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
  left: 45px
}

.triggers-modal-right {
  right: 45px;
}

.close {
  position: absolute;
  top: -10px;
  right: 10px;
  cursor: pointer;
  font-size: 1.4em;
}
</style>
