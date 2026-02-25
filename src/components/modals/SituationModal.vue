<template>
  <NModal :show="true" :closable="false" :width="400">
    <NCard class="situation-card" :title="getSituationTitle()" size="medium">
      <div v-html="ansiToHtml(getSituationDescription())"></div>
      <div class="situation-option" v-for="(option, index) in getSituationOptions()" :key="index">
        <div v-html-safe="ansiToHtml(option)"></div>
        <NButton
          ghost
          type="success"
          @click="runCommand(`choose ${index + 1}`)"
        >Choose Option {{ index + 1 }}</NButton>
      </div>
    </NCard>
  </NModal>
</template>

<script setup>
import { NModal, NCard, NButton } from 'naive-ui'
import { state } from '@/static/state'
import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'

const { runCommand } = useWebSocket()
const { ansiToHtml } = useHelpers()

function getSituationTitle () {
  const { meta } = state.gameState.room
  if (!meta || !meta.situationTitle) {
    return 'Unknown Situation'
  }
  return meta.situationTitle
}

function getSituationDescription () {
  const { meta } = state.gameState.room
  if (!meta || !meta.situationDescription) {
    return 'Unknown Situation'
  }
  return meta.situationDescription
}

function getSituationOptions () {
  const { meta } = state.gameState.room
  if (!meta || !meta.situationOptions) {
    return []
  }
  return meta.situationOptions
}
</script>
<style lang="less" scoped>
.situation-card {
  .situation-option {
    margin-top: 20px;
  }
}
</style>