<template>
  <div class="affects" :style="{ height: getHUDHeight() + 'px' }">
    <div class="affect" v-if="Object.values(state.gameState.affects).length == 0">
      <div class="name">No affects</div>
    </div>

    <div class="affect" v-for="affect in Object.values(state.gameState.affects)" :key="affect.name">
      <div class="name" v-html-safe="affect.longFlag ? ansiToHtml(ANSI.reset + affect.longFlag) : ansiToHtml(ANSI.reset + affect.name)"></div>

      <NProgress type="line" :show-indicator="false" :border-radius="0" :height="4"
      v-show="typeof affect.timeLeft == 'number'"
      :status="getTimeLeftColor(affect)" :percentage="getTimeLeftPercentage(affect)" />

      <div class="desc" v-show="affect.desc" v-html-safe="ansiToHtml(ANSI.reset + affect.desc)"></div>

      <div class="bonuses">

        <!-- <div class="bonus" v-for="bonus in affect.bonuses" :key="bonus.name">
          <div class="value">{{ (bonus.value > 0 ? '+' : '') + bonus.value }}</div>
          <div class="label">{{ bonus.name }}</div>
        </div>
    -->
        <div v-show="affect.charges" class="bonus">
          <div class="value">{{ affect.charges }}</div>
          <div class="label">charges</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NProgress } from 'naive-ui'

import { state, getHUDHeight } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'
import { ANSI } from '@/composables/constants'

const { ansiToHtml } = useHelpers()

function getTimeLeftPercentage (affect) {
  return affect.timeLeft / affect.totalTimeLeft * 100
}

function getTimeLeftColor (affect) {
  if (affect.timeLeft / affect.totalTimeLeft > 0.5) {
    return 'success'
  }

  if (affect.timeLeft / affect.totalTimeLeft > 0.25) {
    return 'warning'
  }

  return 'error'
}
</script>

<style lang="less" scoped>
.affects {
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  min-width: 200px;
  width: 100%;
  margin-right: 10px;
  
  .affect {
    display: flex;
    flex-direction: column;
    margin-bottom: 5px;
    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: 0;
    }

    .bonuses {
      display: flex;
      flex-direction: row;
      .bonus {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-right: 10px;
        .value {
          margin-right: 5px;
        }
        .label {
        }
      }
    }
  }
}
</style>