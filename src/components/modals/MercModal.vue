<template>
  <n-card :class="state.options.swapControls ? 'left' : 'right'" v-if="state.modals.mercModal && state.gameState.mercEid !== -1">
    <p class="close" v-on:click="closeModal()">x</p>
    <h3 class="bold-green"> {{mercEntity.name}} </h3>
    <div class="affects">
      <n-tooltip trigger="hover" v-for="(affect, index) in affects" v-bind:key='index'>
        <template #trigger>
          <span v-html="ansiToHtml(affect.shortFlag) + ' '"></span>
        </template>
        <span v-html="ansiToHtml(affect.longFlag)" class="longflag"></span>
        <span v-if="affect.desc">:&nbsp;{{affect.desc}}</span>
      </n-tooltip>
    </div>
    <QuickStats :entity="mercVitals"></QuickStats>
  </n-card>
</template>

<script setup>
// TODO This modal is not completed yet so the player does not have a way to show it yet
import { watch, ref, onMounted } from 'vue'
import { NCard, NTooltip } from 'naive-ui'

import { state } from '@/composables/state'
import { helpers } from '@/composables/helpers'

import QuickStats from '@/components/side-menu/QuickStats'

const { ansiToHtml } = helpers() 

const mercVitals = ref({})
const mercEntity = ref({})
const affects = ref([])

watch(() => state.gameState.party, function() {
  findAndSetMerc()
})

onMounted(() => {
  findAndSetMerc()
})

function closeModal() {	
  state.modals.mercModal = false
}

async function findAndSetMerc() {
  let merc = Object.values(state.gameState.charmies)
    .find(charmie => charmie && charmie.traits && charmie.traits.includes('mercenary'))
  if (!merc) {
    state.gameState.mercEid = -1
    return
  }

  mercEntity.value = merc
  state.gameState.mercEid = merc.eid
  mercVitals.value = merc

  setAffects()
  return
}

function setAffects() {
  const newAffects = []
  if (mercEntity.value.affects) {
    mercEntity.value.affects.map(affect => {
      if (!affect.shortFlag) {
        affect.shortFlag = "\u001b[1;37m" + affect.name.substring(0,2).toUpperCase()
      }
      if (!affect.longFlag) {
        affect.longFlag = "\u001b[1;37m" + affect.name
      }
      newAffects.push(affect)
    })
  }
  affects.value = newAffects
}

</script>

<style scoped>

.n-card {
  position: absolute;
  width: 25rem;
  margin-top: 35px;
  z-index: 2;
  max-height: 80vh;
}

.right {
  right: 5px;
}

.left {
  left: 5px;
}

.close {
  position: absolute;
  top: -10px;
  right: 10px;
  cursor: pointer;
  font-size: 1.4em;
}

.longflag {
  text-transform: capitalize;
}

@media screen and (max-width: 1000px) {
  .n-card {
    width: 98%;
    margin-top: 5px;
    max-height: 95%;
  }
}
</style>
