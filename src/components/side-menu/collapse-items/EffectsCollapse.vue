<template>
  <n-collapse-item title="Effects">
    <div class="effects">
      <div v-if="effects().length == 0">You are not affected by anything.</div>
      <div v-if="!isPlayer" class="hired bold-yellow">Hired</div>
      <div class="effect" v-for="effect in effects()" :key="effect.name">
        <n-progress type="line" status="default" :percentage="getEffectPercentage(effect)" v-if="!isHiredEffect(effect)">
          <div v-html-safe="getEffectName(effect)"></div>
        </n-progress>
        <div v-if="effect.desc">{{ effect.desc }}</div>
        <div class="effect-bonuses">
          <div class="effect-bonus" v-for="(bonus, i) in getEffectBonuses(effect)" :key="`bouns-${i}`" v-html-safe="bonus"></div>
        </div>
      </div>
    </div>
  </n-collapse-item>
</template>

<script setup>
import { NProgress, NCollapseItem } from 'naive-ui'
import { helpers } from '@/composables/helpers'
import { defineProps } from 'vue'

const props = defineProps(['affects', 'isPlayer'])
const { ansiToHtml } = helpers()

function effects () {
  return props.affects || []
}

function getEffectName (effect) {
  return ansiToHtml(effect.longFlag || effect.name)
}

function getEffectPercentage (effect) {
  if (effect.timeLeft > 60) {
    return 100
  }

  return effect.timeLeft / 60 * 100
}

function getEffectBonuses (effect) {
  let bonuses = []

  if (effect.charges) {
    bonuses.push(`${effect.charges} charges remaining`)
  }

  if (effect.healOverTime) {
    let { healLow, healHigh } = effect.healOverTime
    bonuses.push(`Heals ${healLow.toFixed(0)} - ${healHigh.toFixed(0)} every ${effect.triggerTime}s`)
  }

  if (effect.damageOverTime) {
    let { damLow, damHigh, damageType } = effect.damageOverTime
    bonuses.push(`Deals ${damLow.toFixed(0)} - ${damHigh.toFixed()} ${damageType} damage every ${effect.triggerTime}s`)
  }

  bonuses = bonuses.concat(effect.bonuses.map( ({ name, value }) => {
    return `${value > 0 ? '+' : ''}${value} ${name}`
  }))
  return bonuses
}

function isHiredEffect(effect) {
  return effect.longFlag && effect.longFlag.includes("Hired")
}

</script>

<style lang="less">
.effects {
  .effect {
    white-space: pre-wrap;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    .effect-bonuses {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      width: 100%;
    }
    .hired {
      width: 100%;
    }
  }
}
</style>
