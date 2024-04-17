<template>
  <div class="room-info">
    <div class="room-title" v-html-safe="getRoomTitle()"></div>
    <div class="area-title yellow">{{ state.gameState.room.area }}</div>
    <div class="entities">
      <div
        class="entity"
        v-for="entity in getRoomEntities()"
        v-bind:key="entity.eid"
        v-html-safe="ansiToHtml(entity.name)"
      ></div>
    </div>
    <div class="items">
      <div
        class="item"
        v-for="item in getRoomItems()"
        v-bind:key="item.iid"
        v-html-safe="ansiToHtml(item.name)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { state } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml, ansi } = useHelpers()

function getRoomEntities () {
  return state.gameState.room.entities.filter(en => 
    !Object.keys(state.gameState.party).find(eid => eid == en.eid)
  )
}

function getRoomItems () {
  return state.gameState.room.items
}

function getRoomTitle () {
  const { room } = state.gameState
  return ansiToHtml(`${ansi.reset}L${ansi.boldWhite}${room.level} ${ansi.boldMagenta}${room.x}${ansi.reset}, ${ansi.boldMagenta}${room.y} ${ansi.boldBlack}| ${room.name}`)
}

</script>

<style lang="less" scoped>
.room-info {
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  height: 130px;
  min-width: 250px;
  width: 100%;
}
</style>