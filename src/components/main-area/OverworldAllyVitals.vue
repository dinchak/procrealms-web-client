<template>
  <div class="overworld-ally-vitals">
    <h3 v-html-safe="getName()"></h3>
    <div class="ally-vitals">

      <div class="row">
        <div class="vital">
          <div class="amount bold-green">{{ entity.hp }}</div>
          <NProgress
            type="line" status="success" aria-label="Health" :height="4" :show-indicator="false" :border-radius="0"
            :percentage="entity.hp / entity.maxHp * 100"
          ></NProgress>
        </div>

        <div class="vital">
          <div class="amount bold-cyan">{{ entity.energy }}</div>
          <NProgress
            type="line" status="default" aria-label="Energy" :height="4" :show-indicator="false" :border-radius="0"
            :percentage="entity.energy / entity.maxEnergy * 100"
          ></NProgress>
        </div>

        <div class="vital">
          <div class="amount bold-yellow">{{ entity.stamina }}</div>
          <NProgress
            type="line" status="warning" aria-label="Stamina" :height="4" :show-indicator="false" :border-radius="0"
            :percentage="entity.stamina / entity.maxStamina * 100" 
          ></NProgress>
        </div>

        <div class="vital narrow">
          <div class="amount"><span class="bold-blue">{{ getXPPercentage() }}</span>%</div>
          <div class="label bold-blue">Level</div>
        </div>

        <div class="vital narrow">
          <div class="amount"><span :class="getHungerColor()">{{ getHungerPercentage() }}</span>%</div>
          <div :class="'label ' + getHungerColor()">Hunger</div>
        </div>

        <div class="vital narrow" v-show="entity.rage > 0">
          <div class="amount bold-red">{{ entity.rage }}</div>
          <div class="label bold-red">Rage</div>
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
  return ansiToHtml(`L${ansi.boldWhite}${entity.value.level} ${entity.value.colorName}`)
}

function getHungerPercentage () {
  return 100 - Math.round(entity.value.food / entity.value.maxFood * 100)
}

function getHungerColor () {
  let percentage = getHungerPercentage()
  if (percentage > 85) {
    return 'red'
  } else if (percentage > 70) {
    return 'bold-red'
  } else if (percentage > 55) {
    return 'bold-yellow'
  } else if (percentage > 40) {
    return 'yellow'
  } else if (percentage > 25) {
    return 'green'
  } else {
    return 'bold-green'
  }
}

function getXPPercentage () {
  const { xp, xpForCurrentLevel, xpForNextLevel } = entity.value
  return Math.round((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel) * 100)
}
</script>

<style scoped lang="less">
.overworld-ally-vitals {
  width: 220px;
  height: 32px;
  margin-bottom: 10px;
  h3 {
    font-size: 14px;
    font-weight: normal;
    margin: 0;
    line-height: 12px;
  }
  .ally-vitals {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 16px;
    .row {
      display: flex;
      flex-direction: row;
      width: 100%;
      justify-content: space-around;

      .vital {
        text-align: center;
        width: 35px;
        margin-right: 5px;

        &.narrow {
          width: 35px;
        }

        &:last-child {
          margin-right: 0;
        }

        .label {
          font-size: 12px;
          line-height: 4px;
        }
      }
    }
  }
}

@media screen and (max-width: 500px) {
  .overworld-ally-vitals {
    width: 120px;
    .ally-vitals {
      .row {
        .vital {
          &.narrow {
            display: none;
          }
        }
        
      }
    }
  }
}

</style>