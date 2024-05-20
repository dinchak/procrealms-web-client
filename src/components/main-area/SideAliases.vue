<template>
  <div class="aliases" v-if="state.options.showSideAliases" :style="{ bottom: getBottom() }">
    <div v-if="getAliases().length == 0">
      No aliases
    </div>
    <div v-for="alias in getAliases()" :key="alias.alias">
      <n-button size="small" @click="runAlias(alias.alias)">{{ alias.alias }}</n-button>
    </div>
  </div>
</template>
<script setup>
import { state, showHUD, getHUDHeight, getPartyStatsHeight } from '@/static/state'
import { NButton } from 'naive-ui'
import { useWebSocket } from '@/composables/web_socket'

const { cmd } = useWebSocket()

function runAlias (alias) {
  cmd(alias)
}

function getAliases () {
  return state.gameState.aliases.filter(a => !a.isDefault && !a.isSlot)
}

function getBottom () {
  let bottomOffset = 40
  if (state.options.showSideMovement) {
    bottomOffset += 138
  }

  if (showHUD()) {
    bottomOffset += getHUDHeight()
  }

  if (state.options.showQuickSlots) {
    bottomOffset += 56
  }

  if (state.options.showPartyStats && !state.gameState.battle.active) {
    bottomOffset += getPartyStatsHeight()
  }

  return bottomOffset + 'px'
}

</script>
<style lang="less">
.aliases {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  max-width: 200px;
  .n-button {
    margin-left: 5px;
    margin-bottom: 5px;
  }
}
</style>