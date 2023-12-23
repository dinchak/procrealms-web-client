<template>
  <div class="bottom-hud">
    <div class="minimap-container" v-if="state.options.showOverlayMinimap">
      <MiniMap></MiniMap>
    </div>

    <div class="center-hud">
      <div class="top-center-hud">
        <OverworldAllyVitals
          v-for="row in getAllies()"
          :key="row.entity.id"
          :entity="row.entity"
          :name="row.name" 
        >
        </OverworldAllyVitals>
      </div>
    </div>

    <div class="movement-controls-container" v-if="state.options.hudMovementControls">
      <MobileMovement></MobileMovement>
    </div>
  </div>
</template>

<script setup>
import { state } from '@/composables/state'

import MiniMap from '@/components/side-menu/MiniMap.vue'
import MobileMovement from '@/components/main-area/MobileMovement.vue'
import OverworldAllyVitals from '@/components/main-area/OverworldAllyVitals.vue'

function getAllies () {
  let entities = [{
    entity: state.gameState.player,
    name: state.gameState.player.name
  }]

  for (let charmie of Object.values(state.gameState.charmies)) {
    if (entities.find(e => e.entity.eid == charmie.stats.eid)) {
      continue
    }

    entities.push({
      entity: charmie.stats,
      name: charmie.stats.name
    })

    for (let subCharmie of Object.values(charmie.charmies)) {
      if (entities.find(e => e.entity.eid == subCharmie.stats.eid)) {
        continue
      }

      entities.push({
        entity: subCharmie.stats,
        name: subCharmie.stats.name
      })
    }
  }

  return entities
}
</script>

<style scoped lang="less">
.bottom-hud {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  height: 140px;
  .minimap-container {
    margin-left: 10px;
  }
  .movement-controls-container {
    margin-right: 3px;
  }
  .center-hud {
    display: flex;
    flex-direction: column;
    height: 130px;
    padding-top: 5px;
    flex-basis: 100%;
    .top-center-hud {
      padding-left: 10px;
      padding-right: 10px;
      overflow-y: scroll;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      height: 100%;
    }
  }
}
</style>