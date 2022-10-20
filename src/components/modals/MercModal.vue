<template>
  <n-card :class="state.options.swapControls ? 'left' : 'right'" v-if="state.modals.mercModal">
    <p class="close" v-on:click="closeModal()">x</p>
    <h3 class="bold-green"> {{merc.name}} </h3>
    <div class="affects">
      <span v-for="(affect, index) in affects" 
            v-html="ansiToHtml(affect) + ' '" 
            v-bind:key='index'></span>
    </div>
    <QuickStats :entity="merc"></QuickStats>
  </n-card>
</template>

<script setup>
// TODO This modal is not completed yet so the player does not have a way to show it yet
import { watch, ref, onMounted } from 'vue'
import { NCard } from 'naive-ui'
import { state } from '@/composables/state'
import { helpers } from '@/composables/helpers'

import QuickStats from '@/components/side-menu/QuickStats.vue'

const { ansiToHtml } = helpers() 
const merc = ref({})
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

function findAndSetMerc() {
  if (state.gameState.party) {
    state.gameState.party.map(entity => {
      if (entity.name.includes(" the ")) {
        merc.value = entity
      }
    })
  }
  // Some of the affects will just be null, filtering those out
  const newAffects = []
  if (merc.value.affects) {
    merc.value.affects.map(affect => {
      if (affect !== null) {
        newAffects.push(affect)
      }
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

@media screen and (max-width: 1000px) {
  .n-card {
    width: 98%;
    margin-top: 5px;
    max-height: 95%;
  }
}
</style>
