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

    <div class="affliction-stacks" v-if="getAfflictionStacks(effect).length > 0">
      <div class="stack-heading">Individual stacks</div>
      <div
        class="affliction-stack"
        v-for="(stack, index) in getAfflictionStacks(effect)"
        :key="getAfflictionStackKey(stack, index)"
      >
        <span class="stack-number">#{{ index + 1 }}</span>
        <span class="stack-owner">{{ stack.sourceName || 'Unknown' }}</span>
        <span class="stack-damage">
          {{ renderNumber(stack.damLow) }}–{{ renderNumber(stack.damHigh) }} {{ stack.damageType }}
        </span>
        <span class="stack-time">{{ renderStackTime(stack.timeLeft) }} left</span>
      </div>
    </div>

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

const { ansiToHtml, effectBonuses, getEffectLabel, progressStatus, renderNumber } = useHelpers()

function getEffectName (effect) {
  if (!effect.longFlag && !effect.name) {
    return ansiToHtml(ANSI.reset + 'Effect')
  }

  return ansiToHtml(ANSI.reset + getEffectLabel(effect))
}

function getAfflictionStacks (effect) {
  return Array.isArray(effect.afflictionStacks) ? effect.afflictionStacks : []
}

function getAfflictionStackKey (stack, index) {
  return `${stack.sourceEid || stack.sourceName || 'unknown'}-${index}`
}

function renderStackTime (timeLeft) {
  if (typeof timeLeft !== 'number') {
    return 'unknown'
  }

  return `${Math.max(0, Math.ceil(timeLeft))}s`
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

  .affliction-stacks {
    border-left: 2px solid rgba(255, 255, 255, 0.18);
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin: 8px 0;
    padding-left: 8px;
  }

  .stack-heading {
    color: #f5f5f5;
    font-weight: bold;
  }

  .affliction-stack {
    display: grid;
    gap: 8px;
    grid-template-columns: auto minmax(70px, 1fr) auto auto;
  }

  .stack-number,
  .stack-time {
    color: #f5f500;
  }

  .stack-owner {
    color: #f5f5f5;
  }

  .stack-damage {
    color: #ff7777;
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
