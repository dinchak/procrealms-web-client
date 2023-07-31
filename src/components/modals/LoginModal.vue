<template>

  <n-modal
    v-model:show="state.showLogin"
    type="success"
    preset="dialog"
    title="Login"
  >

    <template #header>
      <div>Existing Player Login</div>
    </template>

    <n-form ref="formRef" :model="model" :rules="rules" size="large">

      <n-form-item path="name" label="Character Name">
        <n-input v-model:value="model.name" @keydown.enter="handleValidation" placeholder="What is your name?"/>
      </n-form-item>

      <n-form-item path="password" label="Password">
        <n-input v-model:value="model.password" type="password" @keydown.enter="handleValidation" placeholder="What is your password?"/>
      </n-form-item>

    </n-form>

    <template #action>
      <n-button type="success" ghost @click="handleValidation">Login</n-button>
    </template>

  </n-modal>

</template>

<script setup>
import { ref } from 'vue'

import { NModal, NForm, NFormItem, NInput, NButton } from 'naive-ui'
import { state } from '@/composables/state'

import { useWebSocket } from '@/composables/web_socket'
import { loadSettingsByNameAndType } from "@/composables/triggers"

const { send } = useWebSocket()

const formRef = ref(null)

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
    },
    {
      message: 'Invalid name or password',
      validator: () => {
        return new Promise((resolve, reject) => {
          state.loginResolve = resolve
          state.loginReject = reject
          loadSettingsByNameAndType(state.triggers, model.value.name, 'triggers')
          loadSettingsByNameAndType(state.variables, model.value.name, 'variables')
          send('login', { name: model.value.name, password: model.value.password, width: 80, height: 24, ttype: 'play.proceduralrealms.com' })
        })
      }
    }
  ],
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
