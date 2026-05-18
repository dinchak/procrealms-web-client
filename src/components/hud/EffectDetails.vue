<template>
  <div class="effect-details">
    <div class="effect-detail-name" v-html-safe="getEffectName(effect)"></div>

    <NProgress
      v-if="hasTimeRemaining(effect)"
      type="line"
      :show-indicator="false"
      :border-radius="0"
      :height="4"
      :status="progressStatus(getTimeLeftPercentage(effect))"
      :percentage="getTimeLeftPercentage(effect)"
    />

    <div class="desc" v-if="effect.desc" v-html-safe="ansiToHtml(ANSI.reset + effect.desc)"></div>

    <div class="effect-bonuses" v-if="getEffectBonuses(effect).length > 0">
      <div
        class="effect-bonus"
        v-for="(bonus, index) in getEffectBonuses(effect)"
        :key="getEffectBonusKey(bonus, index)"
      >
        <template v-if="bonus.value">
          <div class="effect-bonus-label" v-html-safe="bonus.value"></div>
        </template>
        <template v-else>
          <div class="effect-bonus-value bold-white" v-html-safe="getEffectBonusValue(bonus.amount)"></div>
          <div :class="getEffectBonusLabelClass(bonus.name)">{{ getEffectBonusLabel(bonus.name) }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NProgress } from 'naive-ui'

import { ANSI, ITEM_EFFECTS } from '@/static/constants'
import { useHelpers } from '@/composables/helpers'

defineProps({
  effect: {
    type: Object,
    required: true
  }
})

const { ansiToHtml, effectBonuses, progressStatus, renderNumber } = useHelpers()

function getEffectName (effect) {
  if (!effect.longFlag && !effect.name) {
    return ansiToHtml(ANSI.reset + 'Effect')
  }

  return effect.longFlag
    ? ansiToHtml(ANSI.reset + effect.longFlag)
    : ansiToHtml(ANSI.reset + effect.name)
}

function hasTimeRemaining (effect) {
  return typeof effect.timeLeft === 'number' && effect.timeLeft > 0 && effect.totalTimeLeft > 0
}

function getTimeLeftPercentage (effect) {
  if (!hasTimeRemaining(effect)) {
    return 0
  }

  return Math.min(100, Math.max(0, effect.timeLeft / effect.totalTimeLeft * 100))
}

function getEffectBonuses (effect) {
  return (effectBonuses(effect) || []).filter(Boolean)
}

function getEffectBonusKey (bonus, index) {
  return bonus.name || bonus.value || index
}

function getEffectBonusValue (value) {
  return (value > 0 ? '+' : '') + renderNumber(value)
}

function getEffectBonusLabel (bonus) {
  const itemEffect = ITEM_EFFECTS.find(ie => ie.bonus === bonus)
  return itemEffect ? itemEffect.label : bonus
}

function getEffectBonusLabelClass (bonus) {
  const classes = ['effect-bonus-label']
  const itemEffect = ITEM_EFFECTS.find(ie => ie.bonus === bonus)
  if (itemEffect) {
    classes.push(itemEffect.color)
  }
  return classes.join(' ')
}
</script>

<style lang="less" scoped>
.effect-details {
  background: rgb(16, 18, 22);
  box-sizing: border-box;
  padding: 10px;
  width: 100%;

  .effect-detail-name {
    font-size: 1rem;
    margin-bottom: 6px;
  }

  .desc {
    margin: 8px 0;
    white-space: pre-wrap;
  }

  .n-progress {
    margin: 8px 0;
    max-width: 320px;
  }

  .effect-bonuses {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .effect-bonus {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px;
  }
}
</style>
