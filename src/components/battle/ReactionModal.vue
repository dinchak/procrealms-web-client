<template>
  <NModal :show="true" :closable="false" :width="400">
    <NCard class="reaction-card" title="Choose Reaction" size="medium">
      <div>How do you react to <span v-html-safe="ansiToHtml(getActorName())"></span>'s {{ getReactionType() }}?</div>
      <div class="valid-reactions">
        <NButton
          ghost
          type="success"
          v-for="reaction in getValidReactions()"
          :key="reaction"
          @click="runCommand(reaction)"
        >{{ reaction }}</NButton>
        <NButton
          ghost
          type="warning"
          @click="runCommand('pass')"
        >Pass</NButton>
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

function getActorName () {
  const { battle } = state.gameState
  if (!battle.pendingReaction) {
    return 'Unknown'
  }

  let actor = battle.pendingReaction.actor
  let participant = battle.participants[actor]
  if (participant) {
    return participant.tag + ' ' + participant.name
  }
  return 'Unknown'
}

function getReactionType () {
  const { battle } = state.gameState
  if (!battle.pendingReaction) {
    return 'Unknown Action'
  }
  return battle.pendingReaction.type
}

function getValidReactions () {
  const { battle } = state.gameState
  if (!battle.pendingReaction) {
    return []
  }
  return battle.pendingReaction.validReactions || []
}

</script>
<style lang="less" scoped>
</style>