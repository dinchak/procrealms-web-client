<template>
  <div class="aliases" v-if="state.options.showSideAliases">
    <div v-if="getAliases().length === 0">
      No aliases
    </div>
    <div class="alias" v-for="alias in getAliases()" :key="alias.alias">
      <n-button size="small" @click="runAlias(alias.alias)">{{ alias.alias }}</n-button>
    </div>
  </div>
</template>
<script setup>
import { state } from '@/static/state'
import { NButton } from 'naive-ui'
import { useWebSocket } from '@/composables/web_socket'

const { runCommand } = useWebSocket()

function runAlias (alias) {
  runCommand(alias)
}

function getAliases () {
  return state.gameState.aliases.filter(a => !a.isDefault && !a.isSlot)
}

</script>
<style lang="less">
.aliases {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 200px;
  align-items: center;
  justify-content: flex-end;
  align-content: flex-start;
  padding: 4px;

  .alias {
    display: inline-flex;
  }

  @media screen and (max-width: 900px) {
    .game.show-mobile-menu & {
      max-width: 100px;
    }
  }
  @media screen and (max-width: 600px) {
    max-width: 100px;
  }

  overflow-y: auto;
  .n-button {
    margin: 0;
  }
}
</style>