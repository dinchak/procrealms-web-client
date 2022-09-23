<template>

  <n-modal
    v-model:show="state.showNewPlayer"
    preset="dialog"
    title="New Player"
  >

    <template #header>
      <div>New Player</div>
    </template>

    <n-form ref="formRef" :model="model" :rules="rules" size="large">

      <n-form-item path="name" label="Character Name">
        <n-input v-model:value="model.name" @keydown.enter="handleValidation" />
      </n-form-item>

      <n-form-item path="password" label="Password">
        <n-input v-model:value="model.password" type="password" @keydown.enter="handleValidation"/>
      </n-form-item>

      <n-form-item path="repeatPassword" label="Repeat Password">
        <n-input v-model:value="model.repeatPassword" type="password" @keydown.enter="handleValidation"/>
      </n-form-item>

      <n-form-item path="tutorial" label="Start Tutorial">
        <n-switch v-model:value="model.tutorial" />
      </n-form-item>

    </n-form>

    <template #action>
      <n-button type="success" ghost @click="handleValidation">Create</n-button>
    </template>

  </n-modal>

</template>

<script setup>
import { ref } from 'vue'

import { NModal, NForm, NFormItem, NInput, NButton, NSwitch } from 'naive-ui'
import { state } from '@/composables/state'

import { useWebSocket } from '@/composables/web_socket'
const { send } = useWebSocket()

const formRef = ref(null)

const model = ref({
  name: '',
  password: '',
  repeatPassword: '',
  tutorial: true
})

function validatePasswordSame(rule, value) {
  return value === model.value.password;
}

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
    },
    {
      message: 'Name is already taken, please choose another',
      trigger: ['blur'],
      validator: () => {
        return new Promise((resolve, reject) => {
          state.nameExistsResolve = resolve
          state.nameExistsReject = reject
          send('nameExists', { name: model.value.name })
        })
      }
    }
  ],

  password: [
    {
      required: true,
      message: "Password is required",
      trigger: ['password-input', 'blur'],
    }
  ],

  repeatPassword: [
    {
      required: true,
      message: "Repeat Password is required",
      trigger: ['password-input', 'blur'],
    },

    {
      validator: validatePasswordSame,
      message: 'Password is not same as re-entered password!',
      trigger: ['password-input', 'blur'],
    },

    {
      message: 'Invalid character name',
      validator: () => {
        return new Promise((resolve, reject) => {
          state.loginResolve = resolve
          state.loginReject = reject
          send('create', {
            name: model.value.name,
            password: model.value.password,
            width: 100,
            height: 24,
            tutorial: model.value?.tutorial ? 'Y' : 'N',
            ttype: 'play.proceduralrealms.com'
          })
        })
      }
    }
  ]
}

function handleValidation (e) {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (errors) {
      return
    }
  })
}
</script>

<style lang="less">
</style>
