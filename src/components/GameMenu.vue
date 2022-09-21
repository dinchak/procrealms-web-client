<template>
  <n-menu
    v-model:value="activeKey"
    :options="menuOptions"
    :on-update:value="onUpdate"
  >
  </n-menu>
</template>

<script setup>
import { h, ref } from 'vue'

import { NIcon, NMenu } from 'naive-ui'

import { state } from '@/composables/state'

// import TreasureMapIcon from '@/assets/icons/treasure-map.svg'
import ExitDoorIcon from '@/assets/icons/exit-door.svg'

const activeKey = ref(null)

function onUpdate (key) {
  if (key == 'logout') {
    state.showLogout = true
  }
}

function renderIcon (icon) {
  return () => h(NIcon, null, { default: () => h('img', { src: icon } ) } )
}

const menuOptions = [
  {
    label: 'Logout',
    key: 'logout',
    icon: renderIcon(ExitDoorIcon)
  }
]
</script>

<style lang="less">

</style>
