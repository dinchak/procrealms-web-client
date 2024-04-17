<template>
  <div class="aliases" v-if="state.options.showSideAliases" :style="{ bottom: getBottom() }">
    <div v-if="getAliases().length == 0">
      No aliases defined
    </div>
    <div v-for="alias in getAliases()" :key="alias.alias">
      <n-button size="small" @click="runAlias(alias.alias)">{{ alias.alias }}</n-button>
    </div>
  </div>
</template>
<script setup>
import { state, showHUD } from '@/composables/state'
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
    bottomOffset += 140
  }

  if (state.options.showQuickSlots) {
    bottomOffset += 56
  }

  if (state.options.showPartyStats) {
    bottomOffset += 55
  }

  return bottomOffset + 'px'
}

</script>
<style lang="less">
.aliases {
  z-index: 4;
  max-width: 200px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-right: 8px;
  .n-button {
    margin-left: 5px;
    margin-bottom: 5px;
  }
}
</style>