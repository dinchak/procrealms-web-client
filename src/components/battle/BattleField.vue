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
      >{{ position }}</div>

      <div class="battlefield-entity-container">
        <div
          v-for="tag in getBattleTags(position)"
          class="battlefield-entity"
          :key="tag"
          v-html-safe="ansiToHtml(tag)"
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

function getBattleTags (position) {
  let tags = Object.values(state.gameState.battle.participants)
    .filter(p => p.position === position)
    .map(p => p.tag)

  tags.sort((a, b) => -a.localeCompare(b))
  return tags
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
  margin: 0 5px;
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
      // border-bottom: 1px solid #640000;
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
      .battlefield-entity {

      }
    }
  }
}

</style>