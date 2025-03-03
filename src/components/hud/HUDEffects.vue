<template>
  <div class="effects">
    <div class="affect" v-if="!affects || !Object.keys(affects).length">
      <div class="name">No effects</div>
    </div>

    <NCollapse v-else>
      <template
        v-for="affect in Object.values(affects)"
        :key="affect.name"
      >
        <div class="affect" v-if="!(affect.bonuses && affect.timeLeft)">
          <div class="affects-header" v-html-safe="getAffectName(affect)" />
        </div>

        <NCollapseItem class="affect" v-if="affect.bonuses && affect.timeLeft">
          <template #header>
            <div class="affects-header">
              <div class="name" v-html-safe="getAffectName(affect)" />
              <NProgress
                type="line" :show-indicator="false" :border-radius="0" :height="4"
                v-show="typeof affect.timeLeft == 'number'"
                :status="progressStatus(getTimeLeftPercentage(affect))"
                :percentage="getTimeLeftPercentage(affect)"
              />
            </div>
          </template>

          <div class="affect-bonuses">
            <div
              class="affect-bonus"
              v-for="{ name, amount } in affectBonuses(affect)"
              :key="name"
            >
              <div class="affect-bonus-value bold-white" v-html-safe="(amount > 0 ? '+' : '') + amount"></div>
              <div :class="getAffectBonusLabelClass(name)">{{ getAffectBonusLabel(name) }}</div>
            </div>
          </div>
        </NCollapseItem>
      </template>
    </NCollapse>
  </div>
</template>

<script setup>
defineProps(['affects'])

import { NCollapse, NCollapseItem, NProgress } from 'naive-ui'
import { useHelpers } from '@/composables/helpers'
import { ANSI, ITEM_EFFECTS } from '@/static/constants'

const { ansiToHtml, progressStatus, effectBonuses: affectBonuses } = useHelpers()

function getAffectName (effect) {
  return effect.longFlag ?
    ansiToHtml(ANSI.reset + effect.longFlag) :
    ansiToHtml(ANSI.reset + effect.name)
}

function getTimeLeftPercentage (effect) {
  return effect.timeLeft / effect.totalTimeLeft * 100
}

function getAffectBonusLabel (bonus) {
  let itemEffect = ITEM_EFFECTS.find(ie => ie.bonus === bonus)
  if (itemEffect) {
    return itemEffect.label
  }
}

function getAffectBonusLabelClass (bonus) {
  let classes = ['affect-bonus-label']
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

  .affect {
    display: flex;
    flex-direction: column;
    margin-bottom: 5px;
    width: 100%;

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: 0;
    }

    .affects-header {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 5px;

      .n-progress {
        width: 50px;
      }
    }

    .affect-bonuses {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      .affect-bonus {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-right: 10px;

        .affect-bonus-value {
          margin-right: 5px;
        }
      }
    }
  }
}
</style>