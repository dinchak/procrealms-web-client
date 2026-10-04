<template>

  <NModal
    v-model:show="state.modals.loginModal"
    type="success"
    preset="dialog"
    title="Login"
    class="login-modal"
    :closable="!isSubmitting"
    :mask-closable="!isSubmitting"
    :close-on-esc="!isSubmitting"
    @after-enter="onOpenModal"
    @after-leave="onCloseModal"
  >

    <template #header>
      <div>Existing Player Login</div>
    </template>

    <NForm ref="formRef" :model="model" :rules="rules" size="large">

      <NFormItem path="name" label="Character Name">
        <NInput ref="nameInput" class="selectable" :disabled="isSubmitting" v-model:value="model.name" @keydown.enter="handleValidation" placeholder="What is your name?" @click="nameInput.select()"/>
      </NFormItem>

      <NFormItem path="password" label="Password">
        <NInput ref="passwordInput" class="selectable" :disabled="isSubmitting" v-model:value="model.password" type="password" @keydown.enter="handleValidation" placeholder="What is your password?" @click="passwordInput.select()"/>
      </NFormItem>

      <div v-if="error" class="bold-red" role="alert">{{ error }}</div>
    </NForm>

    <template #action>
      <NButton class="selectable" type="success" :loading="isSubmitting" :disabled="isSubmitting" ghost @click="handleValidation">Login</NButton>
    </template>

  </NModal>

</template>

<script setup>
// @ts-check
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'

import { NModal, NForm, NFormItem, NInput, NButton } from 'naive-ui'
import { state, prevMode, authenticationSuccess } from '@/static/state'

import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'
import { getAuthenticationError, requestAuthentication } from '@/composables/authentication_helpers'

const { sendWithResponse } = useWebSocket()
const { selectNearestElement, performSelectedElementAction } = useHelpers()

const formRef = ref(null)
const nameInput = ref(null)
const passwordInput = ref(null)
const isSubmitting = ref(false)
const error = ref('')

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
      trigger: ['input', 'blur'],
      message: "Password is required"
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
  selectedElement = performSelectedElementAction(selectedElement, '.login-modal')
  if (selectedElement) {
    selectedElement.focus()
  }
}

async function onOpenModal () {
  await nextTick()
  nameInput.value?.select()
}

function onCloseModal () {
  if (isSubmitting.value) {
    return
  }
  if (!state.modals.loginModal) {
    return
  }
  state.modals.loginModal = false
  prevMode('loginModal')
}

async function handleValidation (e) {
  e?.preventDefault()
  if (isSubmitting.value || !formRef.value) {
    return
  }
  isSubmitting.value = true
  error.value = ''
  try {
    await formRef.value.validate()
    const result = await requestAuthentication(sendWithResponse, 'login', {
      name: model.value.name,
      password: model.value.password,
      width: state.options.terminalWidth,
      height: state.options.terminalHeight,
      ttype: 'play.proceduralrealms.com'
    })
    authenticationSuccess(result)
  } catch (err) {
    if (err instanceof Error) {
      error.value = getAuthenticationError(err)
    }
  } finally {
    isSubmitting.value = false
  }
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
