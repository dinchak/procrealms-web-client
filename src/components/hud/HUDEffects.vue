<template>
  <div class="effects" :style="{ height: getHUDHeight() + 'px' }">
    <div class="effect" v-if="Object.values(state.gameState.affects).length == 0">
      <div class="name">No effects</div>
    </div>

    <NCollapse>
      <NCollapseItem class="effect"
        v-for="effect in Object.values(state.gameState.affects)"
        :key="effect.name"
      >
        <template #header>
          <div class="effects-header">
            <div class="name" v-html-safe="getEffectName(effect)"></div>
            <NProgress type="line" :show-indicator="false" :border-radius="0" :height="4"
              v-show="typeof effect.timeLeft == 'number'"
              :status="progressStatus(getTimeLeftPercentage(effect))" :percentage="getTimeLeftPercentage(effect)"
            />
          </div>
        </template>

        <div class="effect-bonuses">
          <div
            class="effect-bonus"
            v-for="{ name, value } in effectBonuses(effect)"
            :key="name"
          >
            <div class="effect-bonus-value bold-white" v-html-safe="(value > 0 ? '+' : '') + value"></div>
            <div :class="getEffectBonusLabelClass(name)">{{ getEffectBonusLabel(name) }}</div>
          </div>
        </div>
      </NCollapseItem>
    </NCollapse>
  </div>
</template>

<script setup>
import { NProgress, NCollapse, NCollapseItem } from 'naive-ui'

import { state, getHUDHeight } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { ANSI, ITEM_EFFECTS } from '@/static/constants'

const { ansiToHtml, progressStatus, effectBonuses } = useHelpers()

function getEffectName (effect) {
  return effect.longFlag ?
    ansiToHtml(ANSI.reset + effect.longFlag) :
    ansiToHtml(ANSI.reset + effect.name)
}

function getTimeLeftPercentage (effect) {
  return effect.timeLeft / effect.totalTimeLeft * 100
}

function getEffectBonusLabel (bonus) {
  let itemEffect = ITEM_EFFECTS.find(ie => ie.bonus === bonus)
  if (itemEffect) {
    return itemEffect.label
  }
}

function getEffectBonusLabelClass (bonus) {
  let classes = ['effect-bonus-label']
  let itemEffect = ITEM_EFFECTS.find(ie => ie.bonus === bonus)
  if (itemEffect) {
    classes.push(itemEffect.color)
  }
  return classes.join(' ')
}

</script>

<style lang="less" scoped>
.effects {
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  min-width: 200px;
  width: 100%;
  margin-right: 10px;
  
  .effect {
    display: flex;
    flex-direction: column;
    margin-bottom: 5px;
    width: 100%;
    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: 0;
    }

    .effects-header {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      .n-progress {
        width: 50px;
      }
    }

    .effect-bonuses {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      .effect-bonus {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-right: 10px;
        .effect-bonus-value {
          margin-right: 5px;
        }
      }
    }
  }
}
</style>