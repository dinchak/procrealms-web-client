<template>
  <NPopover trigger="hover" placement="top-start">
    <template #trigger>
      <div class="shortflags" v-html-safe="getAffectFlags(entity, affects)" />
    </template>
    <div v-for="affectName in getAffectNames(entity, affects)" :key="affectName">
      <div v-html-safe="affectName" />
    </div>
  </NPopover>
</template>

<script setup>
import { defineProps, toRefs } from 'vue'
import { useHelpers } from '@/composables/helpers'
import { NPopover } from 'naive-ui'
const { getAffectFlags, getAffectNames } = useHelpers()

const props = defineProps([
  'entity',
  'affects'
])

const { entity, affects } = toRefs(props)
</script>