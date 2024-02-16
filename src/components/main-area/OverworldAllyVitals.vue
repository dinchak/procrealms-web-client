<template>
  <div class="overworld-ally-vitals">
    <h3 v-html-safe="getName()"></h3>
    <div class="ally-vitals">
      <div class="basic">
        <NProgress
          type="line" status="success" aria-label="Health" :height="4" :border-radius="0"
          :show-indicator="false"
          :percentage="entity.hp / entity.maxHp * 100"
        ></NProgress>

        <NProgress
          type="line" status="default" aria-label="Energy" :height="4" :border-radius="0"
          :show-indicator="false"
          :percentage="entity.energy / entity.maxEnergy * 100"
        ></NProgress>

        <NProgress
          type="line" status="warning" aria-label="Stamina" :height="4" :border-radius="0"
          :show-indicator="false"
          :percentage="entity.stamina / entity.maxStamina * 100" 
        ></NProgress>

        <!-- <NProgress
          type="line" color="#838" aria-label="Experience" :height="4" :border-radius="0"
          :show-indicator="false"
          :percentage="getXPPercentage()" 
        ></NProgress>
 -->
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

  </div>

</template>

<script setup>
import { defineProps, toRefs } from 'vue'
import { NProgress } from 'naive-ui'

import { useHelpers } from '@/composables/helpers'

const { ansiToHtml, ansi } = useHelpers()

const props = defineProps({
  entity: Object
})

const { entity } = toRefs(props)

function getName() {
  return ansiToHtml(`${ansi.reset}L${ansi.boldWhite}${entity.value.level} ${entity.value.colorName}`)
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
  margin-bottom: 5px;
  width: 200px;
  margin-right: 5px;

  h3 {
    font-size: 14px;
    font-weight: normal;
    margin: 0;
    line-height: 14px;
  }

  .ally-vitals {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    font-size: 16px;

    .basic {
      display: flex;
      flex-direction: column;
      width: 100%;

      .statuses {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        .status {
          font-size: 12px;
          line-height: 12px;
          padding: 0;
          margin: 0;
          text-align: right;
          .value {
            margin-right: 5px;
          }
        }
      }

      .n-progress {
        width: 100%;
        height: 4px;
        // margin-bottom: 1px;
        font-size: 10px;
        .n-progress-content {
          div {
            .n-progress-custom-content {
              font-size: 10px;
              line-height: 10px;
              padding: 0;
              margin: 0;
              text-align: right;
              .pair {
                display: flex;
                flex-direction: row;
                .amount {
                  width: 35px;
                  text-align: left;
                  margin-left: 4px;
                }
                .label {
                  width: 15px;
                  text-align: right;
                }
              }
            }
          }
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