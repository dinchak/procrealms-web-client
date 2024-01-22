<template>
  <div class="overworld-ally-vitals">
    <h3 v-html-safe="getName()"></h3>
    <div class="ally-vitals">

      <div class="basic">
        <NProgress
          type="line" status="success" aria-label="Health" :height="4" :border-radius="0"
          :show-indicator="true"
          :percentage="entity.hp / entity.maxHp * 100"
        >
          <!-- <div class="pair">
            <div class="amount bold-green">{{ entity.hp }}</div>
          </div> -->
        </NProgress>

        <NProgress
          type="line" status="default" aria-label="Energy" :height="4" :border-radius="0"
          :show-indicator="true"
          :percentage="entity.energy / entity.maxEnergy * 100"
        >
          <!-- <div class="pair">
            <div class="amount bold-cyan">{{ entity.energy }}</div>
          </div> -->
        </NProgress>

        <NProgress
          type="line" status="warning" aria-label="Stamina" :height="4" :border-radius="0"
          :show-indicator="true"
          :percentage="entity.stamina / entity.maxStamina * 100" 
        >
          <!-- <div class="pair">
            <div class="amount bold-yellow">{{ entity.stamina }}</div>
          </div> -->
        </NProgress>
        <NProgress
          type="line" color="#838" aria-label="Experience" :height="4" :border-radius="0"
          :show-indicator="true"
          :percentage="getXPPercentage()" 
        >
          <!-- <div class="pair">
            <div class="amount bold-white">{{ getTNL() }}</div>
          </div> -->
        </NProgress>
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

// function getHungerPercentage () {
//   return 100 - Math.round(entity.value.food / entity.value.maxFood * 100)
// }

// function getHungerColor () {
//   let percentage = getHungerPercentage()
//   if (percentage > 85) {
//     return 'red'
//   } else if (percentage > 70) {
//     return 'bold-red'
//   } else if (percentage > 55) {
//     return 'bold-yellow'
//   } else if (percentage > 40) {
//     return 'yellow'
//   } else if (percentage > 25) {
//     return 'green'
//   } else {
//     return 'bold-green'
//   }
// }

// function getTNL () {
//   return entity.value.xpForNextLevel - entity.value.xp
// }

function getXPPercentage () {
  const { xp, xpForCurrentLevel, xpForNextLevel } = entity.value
  return Math.round((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel) * 100)
}
</script>

<style lang="less">
.overworld-ally-vitals {
  margin-bottom: 5px;
  max-width: 200px;

  h3 {
    font-size: 14px;
    font-weight: normal;
    margin: 0;
    line-height: 12px;
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
      .n-progress {
        width: 100%;
        height: 4px;
        margin-bottom: 1px;
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

@media screen and (max-width: 1200px) {
  .overworld-ally-vitals {
    max-width: 150px;
  }
}

</style>