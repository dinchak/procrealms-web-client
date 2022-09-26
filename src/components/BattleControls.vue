<template>
  <div class="battle-controls">
    <div class="battle-buttons">
      <n-button type="error" ghost :disabled="!state.gameState.battle.myTurn" @click="cmd('attack')">[<span class="bold-yellow">A</span>]ttack</n-button>
      <n-button type="success" ghost :disabled="!state.gameState.battle.myTurn" @click="cmd('defend')">[<span class="bold-yellow">D</span>]efend</n-button>
      <n-button type="warning" ghost :disabled="!state.gameState.battle.myTurn" @click="cmd('flee')">[<span class="bold-yellow">F</span>]lee</n-button>
    </div>
    <div class="battle-skills" v-show="getSkills().length">
      <n-button :disabled="!state.gameState.battle.myTurn" type="default" ghost v-for="{ skill, command } in getSkills()" :key="skill" @click="cmd(command)">{{ skill }}</n-button>
    </div>
  </div>
</template>

<script setup>

import { NButton } from 'naive-ui'

import { useKeyHandler } from '@/composables/key_handler'
import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/composables/state'

const { onKeydown, keyState } = useKeyHandler()
const { cmd } = useWebSocket()

onKeydown((ev) => {
  if (keyState.alt || keyState.ctrl) {
    return false
  }

  if (state.mode == 'input') {
    return false
  }

  if (!state.gameState.battle.active) {
    return false
  }

  // if (ev.key == '`') {
  //   let json = JSON.stringify(state.gameState, null, 2)
  //   let lines = json.split('\n')
  //   for (let line of lines) {
  //     state.output.push(line)
  //   }
  //   return true
  // }

  if (ev.key == 'A' || ev.key == 'a') {
    cmd('attack')
    return true
  } else if (ev.key == 'D' || ev.key == 'd') {
    cmd('defend')
    return true
  } else if (ev.key == 'F' || ev.key == 'f') {
    cmd('flee')
    return true
  }

  return false
})

function getSkills () {
  let skills = []

  if (!state.gameState.battle.active) {
    return []
  }

  for (let skill of state.gameState.battle.actions.skills) {
    skills.push({ skill, command: skill })
  }

  for (let spell of state.gameState.battle.actions.spells) {
    skills.push({ skill: spell, command: `cast '${spell}'` })
  }

  return skills
}

</script>

<style lang="less">
.battle-controls {
  display: flex;
  flex-direction: column;
  margin-top: 15px;
  .battle-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
  .battle-skills {
    margin-top: 15px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    .n-button {
      margin: 1px;
    }
  }
}
</style>
