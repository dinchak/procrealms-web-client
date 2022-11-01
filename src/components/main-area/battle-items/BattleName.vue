<template>
  <div class="name-container" @click="target(entity)">
    <div class="name" v-html="ansiToHtml(`${ansi.boldBlack}L${ansi.boldWhite}${entity.level}${ansi.reset} ${entity.name}`)"></div>
    <div class="affects" v-html="getAffects(entity)"></div>
    <div v-if="entity.targetName" class="targeting" v-html="'Target: ' + ansiToHtml(entity.targetName)"></div>
    <div v-if="!entity.targetName" class="targeting">No target</div>
  </div>
</template>
<script setup>
import { defineProps, toRefs } from 'vue'
import stripAnsi from 'strip-ansi'

import { helpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const { ansiToHtml, ansi } = helpers()
const { cmd } = useWebSocket()

const props = defineProps({
  entity: Object,
})
const { entity } = toRefs(props)

function target (entity) {
  cmd(`target ${stripAnsi(entity.tag)}`)
}

function getAffects (entity) {
  if (!entity.affects.length) {
    return 'No affects'
  }
  return ansiToHtml(entity.affects.join(' '))
}
</script>
<style lang="less">
</style>