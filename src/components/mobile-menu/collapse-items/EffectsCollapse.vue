<template>
  <NCollapseItem title="Effects">
    <div class="effects-collapse">
      <div v-if="effects().length == 0">You are not affected by anything.</div>

      <div v-if="!isPlayer" class="hired bold-yellow">Hired</div>

      <div class="effect" v-for="effect in effects()" :key="effect.name">
        <div class="effect-name" v-html-safe="getEffectName(effect)"></div>
        <NProgress 
          v-if="effect.name != 'charm'"
          type="line"
          :status="progressStatus(getEffectPercentage(effect))" 
          :percentage="getEffectPercentage(effect)"
          :border-radius="0"
          :show-indicator="false"
          :height="4"
        >
        </NProgress>
        <div v-if="effect.desc">{{ effect.desc }}</div>
        <div class="effect-bonuses">
          <div
            class="effect-bonus"
            v-for="{ name, value } in effectBonuses(effect)"
            :key="name"
          >
            <div class="effect-bonus-value bold-white" v-html-safe="getEffectValue(value)"></div>
            <div :class="getEffectBonusLabelClass(name)">{{ getEffectBonusLabel(name) }}</div>
          </div>
        </div>
      </div>
    </div>
  </NCollapseItem>
</template>

<script setup>
import { defineProps } from 'vue'
import { NProgress, NCollapseItem } from 'naive-ui'

import { ITEM_EFFECTS } from '@/static/constants'

import { useHelpers } from '@/composables/helpers'

const { ansiToHtml, progressStatus, effectBonuses, renderNumber } = useHelpers()

const props = defineProps(['effects', 'isPlayer'])

function effects () {
  return props.effects || []
}

function getEffectName (effect) {
  return ansiToHtml(effect.longFlag || effect.name)
}

function getEffectValue (value) {
  return (value > 0 ? '+' : '') + renderNumber(value)
}

function getEffectPercentage (effect) {
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
.effects-collapse {

  .effect {
    white-space: pre-wrap;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .effect-name {
      font-size: 16px;
    }

    .effect-bonuses {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      width: 100%;

      .effect-bonus {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-right: 10px;
        gap: 5px;

        .effect-bonus-label {
          border-radius: 5px;

          &.success {
            background-color: #3F3;
          }
          &.warning {
            background-color: #FF3;
          }
          &.error {
            background-color: #F33;
          }
        }
      }
    }

    .hired {
      width: 100%;
    }
  }
}
</style>
