<template>
  <div class="battle-entity" :class="getClass" @click="target(participant)">
    <div class="name-area">
      <div class="name-merc-col">
        <div class="name-row" lang="en"
             v-html-safe="ansiToHtml(`${participant.hpPercent > 0 ? participant.tag + ' ' : ''}L${ANSI.boldWhite}${participant.level} ${participant.name}`)">
        </div>
        <MercOrders :merc="getMercenary(entity)" v-if="isMercenary(entity)"></MercOrders>
      </div>

      <div class="affect-area">
        <div class="affect-row">
          <span class="affect" v-for="affect in getAffects(participant)" v-html-safe="affect"/>
        </div>
        <div class="bonus-row">
        <span class="affect affect-back" v-if="side === 'good' && entity && entity.combo > 0">
                <span class="amount bold-yellow">{{ entity.combo }}</span> <span class="label yellow">Combo</span>
              </span>
          <span class="affect affect-back" v-if="side === 'good' && entity && entity.rage > 0">
                <span class="amount bold-red">{{ entity.rage }}</span> <span class="label red">Rage</span>
              </span>
        </div>
      </div>

      <div class="target-row">
        <div v-if="participant.targetName" v-html-safe="ansiToHtml(`Target: ${getTarget(participant)}`)"></div>
      </div>
    </div>

    <div class="vital-area">
      <div class="vital-row">
        <div class="vital-amount bold-green">
          {{ entity && side === 'good' ? entity.hp : `${participant.hpPercent}%` }}
        </div>

        <NProgress
            class="vital-bar" type="line" status="success" aria-label="Health"
            :stroke-width="16"
            :percentage="entity && side === 'good' ? entity.hp / entity.maxHp * 100 : participant.hpPercent"
            :show-indicator="false"
            :border-radius="0"
            :height="10"
        ></NProgress>
      </div>

      <div class="vital-row">
        <div class="vital-amount bold-cyan">
          {{ entity && side === 'good' ? entity.energy : `${participant.energyPercent}%` }}
        </div>

        <NProgress
            class="vital-bar" type="line" status="default" aria-label="Energy"
            :stroke-width="16"
            :percentage="entity && side === 'good' ? entity.energy / entity.maxEnergy * 100 : participant.energyPercent"
            :show-indicator="false"
            :border-radius="0"
            :height="10"
        ></NProgress>
      </div>

      <div class="vital-row">
        <div class="vital-amount bold-yellow">
          {{ entity && side === 'good' ? entity.stamina : `${participant.staminaPercent}%` }}
        </div>

        <NProgress
            class="vital-bar" type="line" status="warning" aria-label="Stamina"
            :stroke-width="16"
            :percentage="entity && side === 'good' ? entity.stamina / entity.maxStamina * 100 : participant.staminaPercent"
            :show-indicator="false"
            :border-radius="0"
            :height="10"
        ></NProgress>
      </div>
    </div>
  </div>

</template>
<script setup>
import { defineProps, toRefs, computed, reactive } from 'vue'
import { NProgress } from 'naive-ui'
import stripAnsi from 'strip-ansi'

import MercOrders from '@/components/battle/MercOrders.vue'

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { ANSI } from '@/static/constants'

const { ansiToHtml } = useHelpers()
const { cmd } = useWebSocket()

const props = defineProps({
  participant: Object,
  entity: Object,
  side: String,
})

const { participant, entity, side } = toRefs(props)

function target (participant) {
  if (participant.hpPercent == 0) return
  cmd(`target ${stripAnsi(participant.tag)}`)
}

const isPlayerTarget = (participant) => {
  const player = Object.values(state.gameState.battle.participants).find(p => p.eid === state.gameState.player.eid)
  if (!player || !player.targetName) return false
  if (!participant.tag) return false
  if (player.eid === participant.eid) return stripAnsi(player.targetName) === 'You'
  return stripAnsi(participant.tag) === stripAnsi(player.targetName)
}

const isTargetingPlayer = (participant) => {
  console.debug(state)
  if (!participant.targetName) return false
  const name = stripAnsi(participant.targetName)
  return name === 'You'
}

const getClass = computed(() => {
  console.debug(side.value)
  return {
    'dead': participant.value.hpPercent === 0,
    'selectable': participant.value.hpPercent > 0,
    'good': side.value === 'good' && participant.value.hpPercent > 0,
    'evil': side.value === 'evil' && participant.value.hpPercent > 0,
    'merc': isMercenary(entity.value),
    'acting': participant.value.isActing,
    'selected': isPlayerTarget(participant.value),
    'targeting-you': isTargetingPlayer(participant.value),
    'mobile-menu-open': state.options.showMobileMenu,
  }
})

function getAffects (participant) {
  let affects = []
  if (participant.hpPercent <= 0) {
    affects.push(ANSI.boldRed + 'DEAD' + ANSI.reset)
  }

  affects = affects.concat(participant.affects)
  console.debug(affects.map(s => ansiToHtml(s)))
  affects = affects.map(s => ansiToHtml(s))

  return affects
}

function isMercenary (entity) {
  return entity && entity.traits && entity.traits.includes('mercenary')
}

function getMercenary (entity) {
  return state.gameState.charmies[entity.eid]
}

function getTarget (participant) {
  if (!participant.targetName) return false
  const target = Object.values(state.gameState.battle.participants).
      find(p => stripAnsi(p.tag) === stripAnsi(participant.targetName))
  return target ? `${target.tag} ${target.name}` : participant.targetName
}

// function getStatus (participant) {
//   if (participant.hpPercent == 0) {
//     return ''
//   }
//   return participant.status
// }

// function getTargetName (participant) {
//   if (participant.targetName) {
//     return 'Target: ' + ansiToHtml(participant.targetName)
//   }
//   return ''
// }
</script>
<style lang="less" scoped>
.battle-entity {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  align-self: stretch;
  flex-direction: column;
  justify-content: space-between;
  background-color: #462233;
  padding: 6px 8px;
  border: 2px solid #333;
  margin: 0;
  width: 250px;

  .name-area {
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    .name-affects-col {
      width: 100%;
    }

    .name-row {
      min-height: 36px;
    }

    .name-merc-col {
      display: flex;
      flex-direction: row;
    }

    .affect-area {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px;
      margin: 0 0 6px;
    }

    .affect-row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 4px 4px;
      flex-grow: 1;
      justify-content: flex-start;
    }

    .bonus-row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 4px 8px;
      justify-content: flex-end;
    }

    .affect {
      text-wrap: nowrap;
      padding: 2px 6px;
      background: rgba(black, 0.2);
      display: flex;
      gap: 4px;
    }
  }

  .order-dropdown {
    margin-left: 5px;
  }

  .target-row {
    min-height: 36px;
  }

  .vital-area {
    padding: 2px 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: rgba(black, 0.2);
  }

  .vital-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-right: 5px;

    .vital-amount {
      width: 50px;
      text-align: right;
      padding-right: 5px;
      line-height: 1;
    }
  }

  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 15px 15px 15px 15px;
    border-color: transparent transparent transparent transparent;
    transform: rotate(0deg);
  }

  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 15px 15px 15px 15px;
    border-color: transparent transparent transparent transparent;
    transform: rotate(0deg);
  }

  &.selectable {
    cursor: pointer;
  }

  &.selected {
    //box-shadow: none;
    //border: 1px solid #f8ff25;
    box-shadow: 0 0 5px #f8ff25 !important;
    color: #f8ff25 !important;

    &::before {
      bottom: -2px;
      left: -2px;
      border-width: 15px 0 0 15px;
      border-color: transparent transparent transparent #909317;
    }
  }

  &.targeting-you {
    border-color: #ffa850;
    box-shadow: 0 0 5px #ffa850;

    &::after {
      top: -2px;
      right: -2px;
      border-width: 0 15px 15px 0;
      border-color: transparent #ffa850 transparent transparent;
    }
  }

  &.acting {
    &::after {
      top: 0;
      right: 0;
    }
  }

  &.good {
    background-color: #001800;
    border-color: #001800;

    @media (hover: hover) {
      transition: all 0.3s;
      &:hover {
        background-color: #002800;
      }
    }

    &.acting {
      border-color: #50ff50;
      box-shadow: 0 0 5px #50ff50;

      &::after {
        border-width: 0 15px 15px 0;
        border-color: transparent #50ff50 transparent transparent;
      }
    }
  }

  &.evil {
    background-color: #180000;
    border-color: #180000;

    @media (hover: hover) {
      transition: all 0.3s;
      &:hover {
        background-color: #280000;
      }
    }

    &.acting {
      border-color: #ff5050;
      box-shadow: 0 0 5px #ff5050;

      &::after {
        border-width: 0 15px 15px 0;
        border-color: transparent #ff5050 transparent transparent;
      }
    }
  }

}
@media screen and (min-width: 801px) and (max-width: 1075px) {
  .battle-status.mobile-menu-open {
    .battle-entity {
      width: 200px;
    }
  }
}


</style>