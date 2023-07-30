<template>
  <n-card title="Triggers" :class="getSideClass()" v-if="state.modals.triggersModal">
    <p class="close" v-on:click="state.modals.triggersModal = false ">x</p>

    <n-grid :cols="3" :x-gap="12">
      <n-grid-item>
        <n-tree
            block-line
            checkable
            virtual-scroll
            :data="data"
            :checked-keys="checkedKeys"
            :selected-keys="selectedKeys"
            @update:checked-keys="updateCheckedKeys"
            @update:selected-keys="updateSelectedKeys"
        />
      </n-grid-item>

      <n-grid-item :span="2">
        <n-grid :cols="3" :x-gap="12">
          <n-grid-item :span="2">
            <n-form-item path="name" label="Name">
              <n-input v-model:value="model.name" :disabled="model.key < 1" :allow-input="onlyAlphaNumericMax50"
                       placeholder="Trigger name"/>
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-switch v-model:value="model.shared" :disabled="model.key < 1" aria-label="Shared" @update:value="changeShared">
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
          <n-input v-model:value="model.pattern" :disabled="model.key < 1" placeholder="RegEx pattern (JavaScript)"/>
        </n-form-item>
        <n-form-item path="commands" label="Commands">
        <n-scrollbar>
            <n-input v-model:value="model.commands" :disabled="model.key < 1" type="textarea"
                     placeholder="Commands to send to the server. Use $1, $2, $3, ... for captured values."/>
          </n-scrollbar>
        </n-form-item>
      </n-grid-item>

      <n-grid-item>
        <n-button type="success" ghost @click="newTrigger" style="margin-right: 8px;">New</n-button>
      </n-grid-item>

      <n-grid-item :span="2">
        <n-button type="warning" ghost @click="saveTrigger" style="margin-right: 8px;">Save</n-button>
        <n-button type="error" ghost @click="deleteTrigger(model.key)">Delete</n-button>
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

const model = ref({ key: '-1', name: "", pattern: "", commands: "", active: false, shared: false })
const data = ref([])
const checkedKeys = ref([])
const selectedKeys = ref([])

function getSideClass() {
  return state.options.swapControls ? 'triggers-modal-right' : 'triggers-modal-left'
}

const updateCheckedKeys = (keys) => {
  Array.from(state.triggers.value.values()).forEach(t => t.active = false)
  keys.forEach(key => {
    state.triggers.value.get(key).active = true
  })
  checkedKeys.value = keys
  storeTriggers()
}

const updateSelectedKeys = (keys) => {
  if (keys.length === 1) {
    let key = keys[0]
    selectedKeys.value = [key]
    let trigger = state.triggers.value.get(key)
    model.value.key = key
    model.value.name = trigger.name
    model.value.pattern = trigger.pattern
    model.value.commands = trigger.commands
    model.value.shared = trigger.shared
  }
}

function onlyAlphaNumericMax50(value) {
  return /^[a-zA-Z0-9]{0,50}$/.test(value)
}

function changeShared(shared) {
  model.value.shared = shared
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
  model.value = { key, name: 'NewTrigger', pattern: null, commands: null, active: false, shared: false }
  state.triggers.value.set(key, { name: 'NewTrigger', pattern: null, commands: null, active: false, shared: false })
  updateTriggerTree()
  storeTriggers()
}

function saveTrigger(e) {
  e?.preventDefault()
  if (model.value.name && onlyAlphaNumericMax50(model.value.name)) {
    let trigger = state.triggers.value.get(model.value.key)
    trigger.name = model.value.name
    trigger.pattern = model.value.pattern
    trigger.commands = model.value.commands
    trigger.shared = model.value.shared
    updateTriggerTree()
    storeTriggers()
  }
}

function deleteTrigger(key) {
  state.triggers.value.delete(key)
  model.value = { key: '-1', name: "", pattern: "", commands: "", active: false, shared: false }
  updateTriggerTree()
  storeTriggers()
}

function updateTriggerTree() {
  data.value = []
  checkedKeys.value = []

  state.triggers.value.forEach((trigger, key) => {
    data.value.push({ key, label: (trigger.shared ? '• ' : '') + trigger.name })
    if (trigger.active) {
      checkedKeys.value.push(key)
    }
  })

  selectedKeys.value = [model.value.key]
}

onMounted(() => {
  updateTriggerTree()
  selectedKeys.value = []
})

window.onstorage = (event) => {
  if (event.key === 'triggers') {
    loadTriggers(state.name)
    updateTriggerTree()
    updateSelectedKeys([model.value.key])
  }
}

</script>

<style scoped lang="less">

.n-card {
  position: absolute;
  margin-top: 125px;
  max-width: calc(100vw - 710px);
  z-index: 3;
}

.n-tree {
  height: 274px;
  border-radius: 3px;
  background-color: #303033
}

.n-switch {
  margin-left: 16px;
  margin-top: 32px;
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
