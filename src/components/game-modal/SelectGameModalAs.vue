<template>
  <div class="select-game-modal-as" v-if="getGameModalAsOptions().length > 1">
    <NDropdown
      trigger="click"
      v-model:value="state.gameModalAs"
      :options="getGameModalAsOptions()"
      :render-label="renderOption"
    >
      <NButton class="selectable">Select character</NButton>
    </NDropdown>
  </div>
</template>

<script setup>
import { h } from 'vue'
import { NDropdown, NButton } from 'naive-ui'
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

function renderOption (option) {
  return h('div', { class: 'selectable' }, option.label)
}
</script>

<style lang="less">
.n-dropdown-option-body__label {
  .selected {
    color: #3F3;
  }
}
.select-game-modal-as {
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  .label {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }
  .n-button {
    &.selected {
      background: #121;
    }
  }
}
</style>