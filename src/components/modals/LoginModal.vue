<template>

  <NModal
    v-model:show="state.modals.loginModal"
    type="success"
    preset="dialog"
    title="Login"
    class="login-modal"
    @after-enter="onOpenModal"
    @after-leave="onCloseModal"
  >

    <template #header>
      <div>Existing Player Login</div>
    </template>

    <NForm ref="formRef" :model="model" :rules="rules" size="large">

      <NFormItem path="name" label="Character Name">
        <NInput ref="nameInput" class="selectable" v-model:value="model.name" @keydown.enter="handleValidation" placeholder="What is your name?" @click="nameInput.select()"/>
      </NFormItem>

      <NFormItem path="password" label="Password">
        <NInput ref="passwordInput" class="selectable" v-model:value="model.password" type="password" @keydown.enter="handleValidation" placeholder="What is your password?" @click="passwordInput.select()"/>
      </NFormItem>

    </NForm>

    <template #action>
      <NButton class="selectable" type="success" ghost @click="handleValidation">Login</NButton>
    </template>

  </NModal>

</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'

import { NModal, NForm, NFormItem, NInput, NButton } from 'naive-ui'
import { state, prevMode, authenticationSuccess } from '@/static/state'

import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'

const { sendWithResponse } = useWebSocket()
const { selectNearestElement } = useHelpers()

const formRef = ref(null)
const nameInput = ref(null)
const passwordInput = ref(null)

const model = ref({
  name: null,
  password: null
})

const rules = {
  name: [
    {
      required: true,
      trigger: ['input', 'blur'],
      validator (rule, value) {
        if (!value) {
          return new Error('Name is required')
        } else if (value.length < 3) {
          return new Error('Name is too short')
        } else if (value.length > 15) {
          return new Error('Name is too long')
        } else if (!/^[a-zA-Z]+$/.test(value)) {
          return new Error('Name can only contain letters')
        }
      }
    }
  ],

  password: [
    {
      required: true,
      trigger: ['password-input', 'blur'],
      message: "Password is required"
    },
    {
      message: 'Invalid name or password',
      asyncValidator: () => {
        return new Promise((resolve, reject) => {
          sendWithResponse('login', {
            name: model.value.name,
            password: model.value.password,
            width: state.options.terminalWidth,
            height: state.options.terminalHeight,
            ttype: 'play.proceduralrealms.com'
          }).then((cmd, msg) => {
            if (cmd == 'login.validationFailed') {
              reject(new Error('Invalid character name'))
            } else if (cmd == 'login.fail') {
              reject(new Error('Failed to create character'))
            } else if (cmd == 'token.success') {
              authenticationSuccess(msg)
              resolve()
            }
          }).catch(e => {
            reject(e)
          })
        })
      }
    }
  ],
}

let selectedElement = null
function selectModalAction (degree) {
  selectedElement = selectNearestElement(selectedElement, degree)
  if (selectedElement) {
    selectedElement.focus()
  }
}

function performModalAction () {
  if (selectedElement) {
    selectedElement.click()
  }
}

async function onOpenModal () {
  await nextTick()
  nameInput.value.select()
}

function onCloseModal () {
  if (!state.modals.loginModal) {
    return
  }
  state.modals.loginModal = false
  prevMode()
}

function handleValidation (e) {
  e.preventDefault()
  formRef.value?.validate()
}

onMounted(() => {
  state.inputEmitter.on('closeModal', onCloseModal)
  state.inputEmitter.on('selectModalAction', selectModalAction)
  state.inputEmitter.on('performModalAction', performModalAction)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', onCloseModal)
  state.inputEmitter.off('selectModalAction', selectModalAction)
  state.inputEmitter.off('performModalAction', performModalAction)
})
</script>

<style lang="less">
</style>
