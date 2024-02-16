<template>
  <n-card :class="state.options.swapControls ? 'left' : 'right'" v-if="state.modals.mercModal && state.mercEid !== -1">
    <p class="close" v-on:click="closeModal()">x</p>
    <h3 class="bold-green" style="display: inline;margin-right: 10px"> {{mercEntity.name}} </h3>
    <span style="color: #aaa">Level</span> <span class="bold-cyan">{{ mercEntity.level }}</span>
    <n-progress v-if="!isNaN(getMercTNL())" class="exp-row" type="line" status="default" :percentage="getMercExpPercentage()">
      {{ getMercTNL() }} TNL
    </n-progress>

    <div class="affects">
      <n-tooltip trigger="hover" v-for="(affect, index) in affects" v-bind:key='index'>
        <template #trigger>
          <span v-html-safe="ansiToHtml(affect.shortFlag) + ' '"></span>
        </template>
        <span v-html-safe="ansiToHtml(affect.longFlag)" class="longflag"></span>
        <span v-if="affect.desc">:&nbsp;{{affect.desc}}</span>
      </n-tooltip>
    </div>
    <MiniStats :entity="mercVitals"></MiniStats>
    <n-collapse>
      <CharacterCollapse
          :character="mercEntity"
          :equipment="mercEquipment"
          :is-player="false"
      ></CharacterCollapse>
      <EffectsCollapse
          :affects="affects"
          :isPlayer="false"
      ></EffectsCollapse>
      <InventoryCollapse
          :character="mercEntity"
          :inventory="mercInventory"
          :affects="affects"
          :isPlayer="false"
      ></InventoryCollapse>
      <EquipmentCollapse
          :equipment="mercEquipment"
          :character="mercEntity"
          :isPlayer="false"
          :affects="affects"
      ></EquipmentCollapse>
      <SkillsCollapse
          :character="mercEntity"
          :skills="mercSkills"
          :isPlayer="false"
      ></SkillsCollapse>
    </n-collapse>
  </n-card>
</template>

<script setup>

import { watch, ref, onMounted } from 'vue'
import {NCard, NTooltip, NCollapse, NProgress} from 'naive-ui'
import CharacterCollapse from '@/components/side-menu/collapse-items/CharacterCollapse.vue'
import EffectsCollapse from '@/components/side-menu/collapse-items/EffectsCollapse.vue'
import EquipmentCollapse from '@/components/side-menu/collapse-items/EquipmentCollapse.vue'
import InventoryCollapse from '@/components/side-menu/collapse-items/InventoryCollapse.vue'
import MiniStats from '@/components/side-menu/MiniStats.vue'
import SkillsCollapse from '@/components/side-menu/collapse-items/SkillsCollapse.vue'

import { state } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml, getMerc } = useHelpers()

const mercVitals = ref({})
const mercEntity = ref({})
const affects = ref([])
const mercSkills = ref([])
const mercInventory = ref([])
const mercEquipment = ref({})

watch(() => state.gameState.party, function() {
  findAndSetMerc()
})

watch(state.gameState.charmies, function () {
  findAndSetMerc()
})

onMounted(() => {
  findAndSetMerc()
})

function closeModal() {	
  state.modals.mercModal = false
}

async function findAndSetMerc() {
  const merc = getMerc()

  if (!merc) {
      return
  }
  state.mercEid = merc.stats.eid
  mercEntity.value = merc.stats
  mercVitals.value = merc.stats
  mercSkills.value = Object.values(merc.skills)
  mercInventory.value = merc.items
  mercEquipment.value = merc.equipment

  setAffects(Object.values(merc.affects))
}

function getMercTNL () {
  return mercEntity.value.xpForNextLevel - mercEntity.value.xp
}

function getMercExpPercentage () {
  return (mercEntity.value.xp - mercEntity.value.xpForCurrentLevel) / (mercEntity.value.xpForNextLevel - mercEntity.value.xpForCurrentLevel) * 100
}

function setAffects(affectList) {
  const newAffects = []
  if (affectList) {
    affectList.map(affect => {
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
  width: 400px;
  margin-top: 62px;
  z-index: 2;
  max-height: 80vh;
  overflow-y: scroll;
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

.n-collapse {
  margin-top: 20px;
}

@media screen and (max-width: 1000px) {
  .n-card {
    width: 98%;
    margin-top: 5px;
    max-height: 95%;
  }
}
</style>
