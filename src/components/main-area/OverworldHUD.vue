<template>
  <div class="bottom-hud">
    <div class="minimap-container" v-if="state.options.showOverlayMinimap">
      <MiniMap></MiniMap>
    </div>

    <div class="center-hud">
      <div class="top-center-hud">
        <QuickVitals
          v-for="row in getVitalEntities()"
          :key="row.entity.id"
          :entity="row.entity"
          :name="row.name" 
        >
        </QuickVitals>
        <!-- <QuickVitals :entity="state.gameState.player" :name="state.gameState.player.name"></QuickVitals>
        <QuickVitals
          v-for="charmie in Object.values(state.gameState.charmies)"
          :key="charmie.id"
          :entity="charmie.stats"
          :name="charmie.stats.name"
        ></QuickVitals> -->
      </div>
    </div>

    <MobileInputControls v-if="state.options.hudCommandControls"></MobileInputControls>

    <div class="movement-controls-container" v-if="state.options.hudMovementControls">
      <MobileMovement></MobileMovement>
    </div>
  </div>
</template>

<script setup>
import { state } from '@/composables/state'

// import KeyboardInput from '@/components/main-area/KeyboardInput.vue'
import MiniMap from '@/components/side-menu/MiniMap.vue'
import MobileMovement from '@/components/main-area/MobileMovement.vue'
import QuickVitals from '@/components/main-area/QuickVitals.vue'
import MobileInputControls from '@/components/main-area/MobileInputControls.vue'

function getVitalEntities () {
  let entities = [{
    entity: state.gameState.player,
    name: state.gameState.player.name
  }]
  for (let charmie of Object.values(state.gameState.charmies)) {
    entities.push({
      entity: charmie.stats,
      name: charmie.stats.name
    })
    for (let subCharmie of Object.values(charmie.charmies)) {
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
  align-items: center;
  height: 140px;
  .minimap-container {
    margin-left: 10px;
  }
  .movement-controls-container {
    margin-right: 5px;
  }
  .center-hud {
    display: flex;
    flex-direction: column;
    height: 130px;
    padding-top: 5px;
    flex-basis: 100%;
    .top-center-hud {
      padding-right: 10px;
      overflow-y: scroll;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      height: 100%;
      justify-content: space-between;
    }
  }
}
</style>