<template>
  <div class="overworld-ally-vitals">
    <div class="vitals">
      <div class="bold-green">
        {{ entity.hp }}
      </div>
      <div class="bold-cyan">
        {{ entity.energy }}
      </div>
      <div class="bold-yellow">
        {{ entity.stamina }}
      </div>
    </div>
    <div class="summary">
      <h3 v-html-safe="getName()"></h3>
      <div class="short-affects" v-html-safe="ansiToHtml(getShortAffects())"></div>

      <div class="statuses">
        <div :class="'status ' + getHungerColor()" v-if="getHungerPercentage() >= 50">
          {{ getHungerDescription() }}
        </div>

        <div :class="'status ' + getHappinessColor()" v-if="entity.happiness !== false && entity.happiness <= 5">
          {{ getHappinessDescription() }}
        </div>

        <div class="status red" v-if="entity.dead">
          Dead
        </div>

        <div class="status bold-red" v-if="entity.incapacitated && !entity.dead">
          Incapacitated
        </div>

        <div class="status" v-if="entity.rage > 0">
          <span class="value bold-red">{{ entity.rage }}</span>
          <span class="label red">Rage</span>
        </div>
      </div>

    </div>

  </div>

</template>

<script setup>
import { defineProps, toRefs } from 'vue'
// import { NProgress } from 'naive-ui'

// import { state } from '@/composables/state'

import { useHelpers } from '@/composables/helpers'

const { ansiToHtml, ansi } = useHelpers()

const props = defineProps({
  entity: Object,
  affects: Array
})

const { entity, affects } = toRefs(props)

function getName() {
  return ansiToHtml(`${ansi.reset}L${ansi.boldWhite}${entity.value.level} ${entity.value.colorName}`)
}

function getShortAffects () {
  return ansi.reset + affects.value.join(' ')
}

function getHungerPercentage () {
  return 100 - Math.round(entity.value.food / entity.value.maxFood * 100)
}

function getHungerDescription () {
  let percentage = getHungerPercentage()
  if (percentage >= 90) {
    return 'Starving'
  } else if (percentage >= 80) {
    return 'Famished'
  } else if (percentage >= 65) {
    return 'Hungry'
  } else {
    return 'Peckish'
  }
}

function getHungerColor () {
  let percentage = getHungerPercentage()
  if (percentage >= 90) {
    return 'red'
  } else if (percentage >= 80) {
    return 'bold-red'
  } else if (percentage >= 65) {
    return 'bold-yellow'
  } else {
    return 'yellow'
  }
}

function getHappinessColor () {
  if (entity.value.happiness <= 1) {
    return 'red'
  } else if (entity.value.happiness <= 2) {
    return 'bold-red'
  } else if (entity.value.happiness <= 4) {
    return 'bold-yellow'
  } else {
    return 'yellow'
  }
}

function getHappinessDescription () {
  if (entity.value.happiness <= 1) {
    return 'Miserable'
  } else if (entity.value.happiness <= 2) {
    return 'Unhappy'
  } else if (entity.value.happiness <= 4) {
    return 'Agitated'
  } else {
    return 'Discontent'
  }
}

// function getTNL () {
//   return entity.value.xpForNextLevel - entity.value.xp
// }

// function getXPPercentage () {
//   const { xp, xpForCurrentLevel, xpForNextLevel } = entity.value
//   return Math.round((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel) * 100)
// }

</script>

<style lang="less">
.overworld-ally-vitals {
  padding-bottom: 2px;
  margin-bottom: 2px;
  margin-right: 5px;
  display: flex;
  flex-direction: row;

  .vitals {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 16px;
  }

  .summary {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 10px;
    h3 {
      font-size: 18px;
      font-weight: normal;
      margin: 0;
      line-height: 16px;
    }

    .short-affects {
      font-size: 18px;
      line-height: 16px;
    }

    .statuses {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      font-size: 18px;
      line-height: 16px;
      .status {
        padding: 0;
        margin-right: 5px;
        text-align: right;
        .value {
          margin-right: 5px;
        }
      }      
    }
  }
}

@media screen and (max-width: 450px) {
  .overworld-ally-vitals {
    width: 150px;
  }
}

</style>