<template>
  <div class="select-game-modal-as" v-if="getGameModalAsOptions().length > 1">
    <div class="label">Select character</div>
    <NSelect v-model:value="state.gameModalAs" :options="getGameModalAsOptions()"></NSelect>
  </div>
</template>

<script setup>
import { NSelect } from 'naive-ui'
import { state } from '@/static/state'

function getGameModalAsOptions () {
  let values = [{
    label: state.gameState.player.name,
    value: ''
  }]
  .concat(Object.values(state.gameState.charmies)
    .filter(charmie => charmie.traits.includes('mercenary'))
    .map(merc => {
      return {
        label: merc.stats.name,
        value: merc.stats.eid
      }
    })
  )

  return values
}
</script>

<style lang="less">
.select-game-modal-as {
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  .label {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }
  .n-select {
    max-width: 200px;
  }
}
</style>