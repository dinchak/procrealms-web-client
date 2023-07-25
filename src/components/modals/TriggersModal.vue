<template>
  <n-card title="Triggers" :class="getSideClass()" v-if="state.modals.triggersModal">
    <p class="close" v-on:click="state.modals.triggersModal = false ">x</p>

    <n-grid :cols="3" :x-gap="16">
      <n-grid-item>
        <n-tree
            block-line
            checkable
            virtual-scroll
            :data="data"
            :default-checked-keys="defaultCheckedKeys"
            :selected-keys="selectedKeys"
            @update:checked-keys="updateCheckedKeys"
            @update:selected-keys="updateSelectedKeys"
        />
      </n-grid-item>

      <n-grid-item :span="2">
        <n-form-item path="name" label="Trigger name">
          <n-input v-model:value="model.name" :allow-input="onlyAlphaNumericMax50" placeholder="Trigger name"/>
        </n-form-item>
        <n-form-item path="pattern" label="Pattern">
          <n-input v-model:value="model.pattern" placeholder="RegEx pattern (JavaScript)"/>
        </n-form-item>
        <n-form-item path="commands" label="Commands">
          <n-scrollbar>
            <n-input v-model:value="model.commands" type="textarea"
                     placeholder="Commands to send to the server. Use $1, $2, $3, ... for captured values."/>
          </n-scrollbar>
        </n-form-item>
      </n-grid-item>

      <n-grid-item>
        <n-button type="info" ghost @click="newTrigger" style="margin-right: 8px;">New</n-button>
      </n-grid-item>

      <n-grid-item :span="2">
        <n-button type="success" ghost @click="saveTrigger" style="margin-right: 8px;">Save</n-button>
        <n-button type="error" ghost @click="deleteTrigger(model.id)">Delete</n-button>
      </n-grid-item>
    </n-grid>

  </n-card>
</template>

<script setup>
import {NButton, NCard, NFormItem, NGrid, NGridItem, NInput, NScrollbar, NTree} from 'naive-ui'
import {state} from '@/composables/state'
import {useKeyHandler} from '@/composables/key_handler'
import {onMounted, ref} from "vue";

const { onKeydown, keyState } = useKeyHandler()

const model = ref({ id: '0', name: "", pattern: "", commands: "", active: false })
const data = ref([])
const defaultCheckedKeys = ref([])
const selectedKeys = ref([])

function getSideClass() {
  return state.options.swapControls ? 'triggers-modal-right' : 'triggers-modal-left'
}

const updateCheckedKeys = (keys) => {
  Array.from(state.triggers.value.values()).forEach(t => t.active = false)
  keys.forEach(key => state.triggers.value.get(key).active = true)
  storeTriggers()
}

const updateSelectedKeys = (keys) => {
  if (keys.length === 1) {
    let id = keys[0];
    selectedKeys.value = [id]
    let trigger = state.triggers.value.get(id);
    model.value.id = id
    model.value.name = trigger.name
    model.value.pattern = trigger.pattern
    model.value.commands = trigger.commands
  }
}

function onlyAlphaNumericMax50(value) {
  return /^[a-zA-Z0-9]{0,50}$/.test(value)
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
  let idsAsNumbers = [...state.triggers.value.keys()].map(k => Number(k));
  let id = 1 + (state.triggers.value.size ? Math.max(...idsAsNumbers) : 0);
  model.value = { id: '' + id, name: 'NewTrigger', pattern: null, commands: null, active: false }
  saveTrigger(null)
}

function saveTrigger(e) {
  e?.preventDefault()
  if (onlyAlphaNumericMax50(model.value.name)) {
    let trigger = { name: model.value.name, pattern: model.value.pattern, commands: model.value.commands, active: false }
    state.triggers.value.set(model.value.id, trigger)
    updateTriggerList()
    storeTriggers();
  }
}

function deleteTrigger(id) {
  state.triggers.value.delete(id)
  model.value = { id: null, name: "", pattern: "", commands: "", active: false }
  updateTriggerList()
  storeTriggers();
}

function updateTriggerList() {
  data.value = []
  defaultCheckedKeys.value = []

  state.triggers.value.forEach((trigger, id) => {
    data.value.push({ key: "" + id, label: trigger.name})
    if (trigger.active) {
      defaultCheckedKeys.value.push("" + id)
    }
  })

  selectedKeys.value = [model.value.id]
}

function storeTriggers() {
  localStorage.setItem('triggers', JSON.stringify(Array.from(state.triggers.value.entries())))
}

onMounted(() => {

  try {
    const triggers = new Map(JSON.parse(localStorage.getItem('triggers')))
    if (triggers !== null) {
      state.triggers.value = triggers
    }
  } catch (err) {
    localStorage.setItem('triggers', '[]')
  }

  updateTriggerList()
  selectedKeys.value = []
})

</script>

<style scoped lang="less">

.n-card {
  position: absolute;
  margin-top: 125px;
  max-width: calc(100vw - 710px);
  z-index: 3;
}

.n-tree {
  height: 275px;
  border-radius: 3px;
  background-color: #303033
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
