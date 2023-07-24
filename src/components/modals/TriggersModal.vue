<template>
  <n-card title="Triggers" :class="getSideClass()" v-if="state.modals.triggersModal">
    <p class="close" v-on:click="state.modals.triggersModal = false ">x</p>

    <n-grid :cols="3" :x-gap="16">
      <n-grid-item>
        <n-tree
            block-line
            checkable
            virtual-scroll
            style="height: 300px"
            :data="data"
            :default-checked-keys="defaultCheckedKeys"
            @update:checked-keys="updateCheckedKeys"
            @update:selected-keys="updateSelectedKeys"
        />
      </n-grid-item>

      <n-grid-item :span="2">
        <n-form ref="formRef" :model="model" :rules="rules" size="large">
          <n-form-item path="name" label="Trigger name">
            <n-input v-model:value="model.name" placeholder="Trigger name"/>
          </n-form-item>
          <n-form-item path="pattern" label="Pattern">
            <n-input v-model:value="model.pattern" placeholder="RegEx pattern"/>
          </n-form-item>
          <n-form-item path="commands" label="Commands">
            <n-scrollbar>
              <n-input v-model:value="model.commands" type="textarea" placeholder="Commands to send to the server"/>
            </n-scrollbar>
          </n-form-item>
        </n-form>
      </n-grid-item>

      <n-grid-item>
        <n-button type="info" ghost @click="newTrigger" style="margin-right: 8px;">New</n-button>
      </n-grid-item>

      <n-grid-item :span="2">
        <n-button type="success" ghost @click="saveTrigger" style="margin-right: 8px;">Save</n-button>
        <n-button type="error" ghost @click="deleteTrigger(model.name)">Delete</n-button>
      </n-grid-item>
    </n-grid>

  </n-card>
</template>

<script setup>
import {NButton, NCard, NForm, NFormItem, NGrid, NGridItem, NInput, NScrollbar, NTree} from 'naive-ui'
import { state} from '@/composables/state'
import { useKeyHandler} from '@/composables/key_handler'
import { onMounted, ref} from "vue";

const { onKeydown, keyState } = useKeyHandler()

const formRef = ref(null)

const model = ref({
  name: null,
  pattern: null,
  commands: null
})

const data = ref([])
const defaultCheckedKeys = ref([])

const updateCheckedKeys = (keys) => {
  Array.from(state.triggers.values()).forEach(t => t.active = false)
  keys.forEach(key => state.triggers.get(key).active = true)
}

const updateSelectedKeys = (keys) => {

  if (keys.length === 1) {
    let trigger = state.triggers.get(keys[0]);
    model.value.name = trigger.name
    model.value.pattern = trigger.pattern
    model.value.commands = trigger.commands
  }
}

const rules = {
  name: [
    {
      required: true,
      trigger: ['blur'],
      validator (rule, value) {
        if (!value) {
          return new Error('Name is required')
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          return new Error('Name can only contain letters and numbers')
        }
      }
    }
  ]}

function getSideClass() {
  return state.options.swapControls ? 'triggers-modal-right' : 'triggers-modal-left'
}

onKeydown((ev) => {
  if (keyState.alt || keyState.ctrl) {
    return false
  }

  if (state.mode === 'input') {
    return false
  }

  if (ev.code === 'KeyT') {
    state.modals.triggersModal = !state.modals.triggersModal
    return true
  }
})

function newTrigger() {
  model.value = { name: null, pattern: null, commands: null, active: false }
}

function saveTrigger(e) {
  e.preventDefault()
  if (model.value.name) {
    let trigger = {name: model.value.name, pattern: model.value.pattern, commands: model.value.commands, active: false}

    state.triggers.set(trigger.name, trigger)
    updateTriggerList()
    storeTriggers();
  }
}

function deleteTrigger(name) {
  state.triggers.delete(name)
  model.value = { name: null, pattern: null, commands: null }
  updateTriggerList()
  storeTriggers();
}

function updateTriggerList() {
  let triggers = Array.from(state.triggers.values());
  data.value = triggers.map(t => {
    return { label: t.name, key: t.name }
  })
  defaultCheckedKeys.value = triggers.filter(t => t.active).map(t => t.name)
}

function storeTriggers() {
  console.log('SAVING ' + JSON.stringify(Array.from(state.triggers.entries())))
  localStorage.setItem('triggers', JSON.stringify(Array.from(state.triggers.entries())))
}

onMounted(() => {

  try {
    const triggers = new Map(JSON.parse(localStorage.getItem('triggers')))
    if (triggers !== null) {
      state.triggers = triggers
    }
  } catch (err) {
    console.log(err.stack)
    localStorage.setItem('triggers', '[]')
  }

  updateTriggerList()
})

</script>

<style scoped lang="less">

.n-card {
  position: absolute;
  margin-top: 125px;
  max-width: calc(100vw - 710px);
  z-index: 3;
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
