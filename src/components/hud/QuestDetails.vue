<template>
  <div class="quest-details">
    <div class="name" v-html-safe="getQuestName()"></div>
    <div class="giver" v-if="quest.giver" v-html-safe="getGivenBy()"></div>

    <NProgress
      v-if="quest.amount"
      :status="quest.progress < quest.amount ? 'default' : 'success'"
      type="line"
      :percentage="getProgressPercentage()"
      :border-radius="0"
    >
      <span v-if="quest.progress < quest.amount">
        {{ quest.progress }} of {{ quest.amount }}
      </span>
      <span class="bold-yellow" v-if="quest.progress >= quest.amount">
        Complete
      </span>
    </NProgress>

    <div class="objective" v-if="quest.objective" v-html-safe="getObjective()"></div>
    <div class="objective" v-if="quest.extra" v-html-safe="getExtra()"></div>
    <div class="desc" v-if="quest.desc" v-html-safe="getDescription()"></div>

    <div class="actions" v-if="canWalk()">
      <NButton
        ghost
        size="tiny"
        class="selectable"
        :disabled="!canWalkInCurrentArea()"
        @click.stop="onWalk"
      >
        Walk
      </NButton>
    </div>
  </div>
</template>

<script setup>
import { NButton, NProgress } from 'naive-ui'

import { state } from '@/static/state'
import { ANSI } from '@/static/constants'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const props = defineProps({
  quest: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['close'])

const { ansiToHtml } = useHelpers()
const { runCommand } = useWebSocket()

function player () {
  return state.gameState.player || {}
}

function getQuestName () {
  return `L<span class="bold-white">${props.quest.level}</span> <span class="bold-yellow">${ansiToHtml(ANSI.reset + props.quest.name)}</span>`
}

function getGivenBy () {
  return `Given by <span class="bold-yellow">${ansiToHtml(ANSI.reset + (props.quest.giver.name || 'Unknown'))}</span>`
}

function getProgressPercentage () {
  if (!props.quest.amount) {
    return 0
  }

  return Math.min(100, Math.max(0, props.quest.progress / props.quest.amount * 100))
}

function getObjective () {
  return `Objective: ${ansiToHtml(ANSI.reset + props.quest.objective)}`
}

function getExtra () {
  return ansiToHtml(ANSI.reset + props.quest.extra)
}

function getDescription () {
  const playerName = player().name || ''
  return ansiToHtml(ANSI.reset + (props.quest.desc || '').replace(/@NAME/g, playerName))
}

function getWalkCoords () {
  return props.quest.location && props.quest.location.coords
    ? props.quest.location.coords
    : null
}

function canWalk () {
  return Boolean(getWalkCoords())
}

function canWalkInCurrentArea () {
  const coords = getWalkCoords()
  return Boolean(coords && state.gameState.room && coords.areaId === state.gameState.room.areaId)
}

function onWalk () {
  const coords = getWalkCoords()
  if (!coords || !canWalkInCurrentArea()) {
    return
  }

  emit('close')
  runCommand(`walk ${coords.x},${coords.y}`)
}
</script>

<style lang="less" scoped>
.quest-details {
  background: rgb(16, 18, 22);
  box-sizing: border-box;
  padding: 10px;
  width: 100%;

  .name {
    font-size: 1rem;
    margin-bottom: 4px;
  }

  .giver,
  .objective,
  .desc {
    margin-bottom: 6px;
  }

  .objective,
  .desc {
    white-space: pre-wrap;
  }

  .n-progress {
    margin: 8px 0;
    max-width: 320px;
  }

  .actions {
    display: flex;
    flex-direction: row;
    gap: 6px;
    margin-top: 8px;
  }
}
</style>
