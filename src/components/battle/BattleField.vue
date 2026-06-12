<template>
  <div class="battlefield">
    <div
      v-for="position in range(0, 10)"
      :key="position"
      @click="onPositionClick(position)"
      class="battlefield-column"
    >
      <div
        class="battlefield-position bold-red"
        v-html-safe="getPositionLabel(position)"
      ></div>

      <div class="battlefield-entity-container">
        <div
          v-for="participant in getParticipants(position)"
          class="battlefield-entity"
          :class="{
    'acting': participant.isActing,
    'my-target': isMyTarget(participant),
  }"
          :key="participant.tag"
          @click="setTarget($event, participant.eid)"
          v-html-safe="ansiToHtml(getTag(participant))"
        ></div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { state } from '@/static/state'

import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const { range, ansiToHtml } = useHelpers()
const { runCommand } = useWebSocket()

function getPositionLabel(position) {
  if (state.options.battleRelativePositions) {
    let me = state.gameState.battle.participants[state.gameState.player.eid]
    return position - me.position
  }

  return position
}
function getTag(participant) {
  let me = state.gameState.battle.participants[state.gameState.player.eid]
  if (me.eid === participant.eid) {
    return "You"
  }
  return participant.tag
}

function isMyTarget(participant) {
  let me = state.gameState.battle.participants[state.gameState.player.eid]
  return me.targetEid === participant.eid
}

function getParticipants (position) {
  let participants = Object.values(state.gameState.battle.participants)
    .filter(p => p.position === position)

  participants.sort((a, b) => -(a.tag).localeCompare(b.tag))
  return participants
}

function setTarget ($event, targetEid) {
  $event.stopPropagation()
  runCommand(`target eid:${targetEid}`)
}

function onPositionClick (position) {
  runCommand(`move ${position}`)
}
</script>

<style lang="less" scoped>
.battlefield {
  background-color: #180000;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: stretch;
  border-top: 1px solid #e88080;
  border-bottom: 1px solid #e88080;

  .battlefield-column {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex: 1;
    border-left: 1px solid #e88080;
    transition: all 0.3s;

    &:hover {
      background-color: #2e0808;
      cursor: pointer;
      .battlefield-position {
        color: #f9f1a5;
      }
    }
    &:last-child {
      border-right: 1px solid #e88080;
    }

    .battlefield-position {
      background-color: #2e0808;
      flex-grow: 0;
      flex-shrink: 0;;
      width: 30px;
      height: 26px;
      display: flex;
      align-items: center;
      align-self: center;
      justify-content: center;
      font-weight: bold;
      transition: all 0.3s;
    }

    .battlefield-entity-container {
      display: flex;
      flex-direction: row;
      flex: 1;
      flex-wrap: wrap;
      justify-content: space-around;
    }

    .battlefield-entity {
      padding: 0 2px;
      border: 1px solid transparent;
      border-bottom: none;
      &.my-target {
        background-color: rgba(240, 210, 52, 0.1);
        border-color: rgba(240, 210, 52, 0.3);
      }
      //&.acting {
      //  background-color: rgba(240, 210, 52, 0.2);
      //}
      &:hover {
        background-color: rgba(52, 240, 210, 0.2);
        border-color: rgba(52, 240, 210, 0.3);
        cursor: pointer;
      }
    }
  }
}

</style>