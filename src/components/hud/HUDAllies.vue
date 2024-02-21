<template>
  <div class="allies">
    <HUDAlly
      v-for="row in getAllies()"
      :key="row.entity.id"
      :entity="row.entity"
      :affects="row.affects"
    >
    </HUDAlly>
  </div>
</template>

<script setup>
import { state } from '@/composables/state'

import HUDAlly from '@/components/hud/HUDAlly.vue'

function getAllies () {
  let entities = [{
    entity: state.gameState.player,
    affects: Object.values(state.gameState.affects).map(a => a.shortFlag)
  }]

  for (let eid in state.gameState.charmies) {
    let charmie = state.gameState.charmies[eid]

    if (entities.find(e => e.entity.eid == charmie.stats.eid)) {
      continue
    }

    entities.push({
      entity: charmie.stats,
      affects: Object.values(charmie.affects).map(a => a.shortFlag)
    })

    for (let subEid in charmie.charmies) {
      let subCharmie = charmie.charmies[subEid]

      if (entities.find(e => e.entity.eid == subCharmie.stats.eid)) {
        continue
      }

      entities.push({
        entity: subCharmie.stats,
        affects: Object.values(subCharmie.affects).map(a => a.shortFlag)
      })
    }
  }

  return entities
}

</script>

<style lang="less" scoped>
.allies {
  height: 130px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  margin-right: 10px;
  width: 250px;
  .overworld-ally-vitals {
    border-bottom: 1px solid #333;
    &:last-child {
      border-bottom: 0;
    }
  }
}
</style>