<template>
  <div class="battle-controls">
    <div class="battle-buttons">
      <n-button type="error" ghost :disabled="!state.gameState.battle.myTurn" @click="cmd('attack')" :aria-label="state.gameState.battle.myTurn ? 'Attack My Turn' : 'Attack Not My Turn'">[<span class="bold-yellow">A</span>]ttack</n-button>
      <n-button type="success" ghost :disabled="!state.gameState.battle.myTurn" @click="cmd('defend')" :aria-label="state.gameState.battle.myTurn ? 'Defend My Turn' : 'Defend Not My Turn'">[<span class="bold-yellow">D</span>]efend</n-button>
      <n-button type="warning" ghost :disabled="!state.gameState.battle.myTurn" @click="cmd('flee')" :aria-label="state.gameState.battle.myTurn ? 'Flee My Turn' : 'Flee Not My Turn'">[<span class="bold-yellow">F</span>]lee</n-button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

import { NButton } from 'naive-ui'

import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/composables/state'

const { cmd } = useWebSocket()

function attack () {
  cmd('attack')
}

function defend () {
  cmd('defend')
}

function flee () {
  cmd('flee')
}

onMounted(() => {
  state.inputEmitter.on('attack', attack)
  state.inputEmitter.on('defend', defend)
  state.inputEmitter.on('flee', flee)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('attack', attack)
  state.inputEmitter.off('defend', defend)
  state.inputEmitter.off('flee', flee)
})
</script>

<style lang="less">
.battle-controls {
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  .battle-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
  .battle-skills {
    margin-top: 5px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    .n-button {
      margin: 1px;
    }
  }
}
</style>
