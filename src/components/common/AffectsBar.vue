<template>
  <NPopover trigger="hover" placement="top-start">
    <template #trigger>
      <div v-if="entity.dead" class="shortflags"><span class="red">D</span></div>
      <div v-else-if="entity.incapacitated" class="shortflags"><span class="bold-red">I</span></div>
      <div v-else class="shortflags" v-html-safe="getAffectFlags(entity, affects)" />
    </template>
    <div v-if="entity.dead">
      <div class="red">Dead</div>
    </div>
    <div v-else-if="entity.incapacitated">
      <div class="bold-red">Incapacitated</div>
    </div>
    <div v-else v-for="affectName in getAffectNames(entity, affects)" :key="affectName">
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

<style lang="less" scoped>
.shortflags {
  flex-grow: 1;
  text-align: left;
  height: 18px;
  display: flex;
  gap: 5px;
  overflow-x: hidden;
  cursor: help;
}
</style>