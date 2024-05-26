<template>
  <div class="aliases" v-if="state.options.showSideAliases">
    <div v-if="getAliases().length === 0">
      No aliases
    </div>
    <div v-for="alias in getAliases()" :key="alias.alias">
      <n-button size="small" @click="runAlias(alias.alias)">{{ alias.alias }}</n-button>
    </div>
  </div>
</template>
<script setup>
import { state } from '@/static/state'
import { NButton } from 'naive-ui'
import { useWebSocket } from '@/composables/web_socket'

const { cmd } = useWebSocket()

function runAlias (alias) {
  cmd(alias)
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
  max-width: 200px;
  max-height: 133px;
  justify-content: center;
  align-content: flex-start;

  overflow-y: scroll;
  .n-button {
    margin-left: 5px;
    margin-bottom: 5px;
  }
}
</style>