<template>
  <div class="battle-controls">
    <div class="battle-buttons">
      <n-button type="error" ghost :disabled="!state.gameState.battle.myTurn" @click="cmd('attack')" :aria-label="state.gameState.battle.myTurn ? 'Attack My Turn' : 'Attack Not My Turn'">[<span class="bold-yellow">A</span>]ttack</n-button>
      <n-button type="success" ghost :disabled="!state.gameState.battle.myTurn" @click="cmd('defend')" :aria-label="state.gameState.battle.myTurn ? 'Defend My Turn' : 'Defend Not My Turn'">[<span class="bold-yellow">D</span>]efend</n-button>
      <n-button type="warning" ghost :disabled="!state.gameState.battle.myTurn" @click="cmd('flee')" :aria-label="state.gameState.battle.myTurn ? 'Flee My Turn' : 'Flee Not My Turn'">[<span class="bold-yellow">F</span>]lee</n-button>
    </div>
    <div class="battle-skills" v-show="getSkills().size">
      <n-button :disabled="!state.gameState.battle.myTurn" type="default" ghost v-for="{ skill, command } in getSkills().values()" :key="skill" @click="cmd(command)" :aria-label="state.gameState.battle.myTurn ? command + ' My Turn' : command + ' Not My Turn'">{{ skill }}</n-button>
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

  if (ev.code == 'KeyA') {
    cmd('attack')
    return true
  } else if (ev.code == 'KeyD') {
    cmd('defend')
    return true
  } else if (ev.code == 'KeyF') {
    cmd('flee')
    return true
  }

  if (ev.code.startsWith('Key') && ev.code.length == 4) {
    let key = [...ev.code][3].toLowerCase()
    let skillsByKey = getSkills()
    if (skillsByKey.has(key)) {
      cmd(skillsByKey.get(key).command)
      return true
    }
  }

  return false
})

function getSkills () {
  let skillsByKey = new Map([['a', 0], ['d', 0], ['f', 0]])

  if (!state.gameState.battle.active) {
    return []
  }

  function addSkill(skill, command, skillsByKey) {
    let key = [...skill].find(char => !skillsByKey.has(char))
    if (key) {
      let skillObj = {
        skill: skill.replace(key, `[${key.toUpperCase()}]`),
        command: command
      }
      skillsByKey.set(key, skillObj)
    }
  }

  for (let skill of state.gameState.battle.actions.skills) {
    addSkill(skill, skill, skillsByKey)
  }

  for (let spell of state.gameState.battle.actions.spells) {
    addSkill(spell, `cast '${spell}'`, skillsByKey)
  }

  skillsByKey.delete('a')
  skillsByKey.delete('d')
  skillsByKey.delete('f')
  return skillsByKey
}

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
