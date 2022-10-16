<template>
  <n-collapse-item title="Effects">
    <div class="effects">
      <div v-if="effects().length == 0">You are not affected by anything.</div>
      <div class="effect" v-for="effect in effects()" :key="effect.name">
        <n-progress type="line" status="default" :percentage="getEffectPercentage(effect)">
          <div v-html="getEffectName(effect)"></div>
        </n-progress>
        <div v-if="effect.desc">{{ effect.desc }}</div>
        <div class="effect-bonuses">
          <div class="effect-bonus" v-for="(bonus, i) in getEffectBonuses(effect)" :key="`bouns-${i}`" v-html="bonus"></div>
        </div>
      </div>
    </div>
  </n-collapse-item>
</template>

<script setup>
import { NProgress, NCollapseItem } from 'naive-ui'
import { state } from '@/composables/state'
import { helpers } from '@/composables/helpers'

const { ansiToHtml } = helpers()

function effects () {
  return state.gameState.affects || []
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
    bonuses.push(`Heals ${healLow}-${healHigh} every ${effect.triggerTime}s`)
  }

  if (effect.damageOverTime) {
    let { damLow, damHigh, damageType } = effect.damageOverTime
    bonuses.push(`Deals ${damLow}-${damHigh} ${damageType} damage every ${effect.triggerTime}s`)
  }

  bonuses = bonuses.concat(effect.bonuses.map( ({ name, value }) => {
    return `${value > 0 ? '+' : ''}${value} ${name}`
  }))
  return bonuses
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
  }
}
</style>
