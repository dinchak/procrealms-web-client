<template>
  <div class="battle-entity" :class="{
    'dead': !isAlive(participant),
    'hidden': participant.isHidden,
    'casting': participant.isCasting,
    'selectable': isAlive(participant),
    'good': side === 'good' && isAlive(participant),
    'evil': side === 'evil' && isAlive(participant),
    'merc': isMercenary(entity),
    'acting': participant.isActing,
    'selected': isPlayerTarget(participant),
    'targeting-you': isTargetingPlayer(participant) && !isPlayer(participant),
  }" @click="target(participant)">
<!--    <div class="prefix" v-show="hasPrefix(participant)" :class="{-->
<!--      'casting': participant.isCasting,-->
<!--    }">-->
<!--      Casting...-->
<!--    </div>-->
    <div class="main-card">
      <div class="card-layer-1">
        <div class="card-layer-2">
          <div class="name-area">
            <div class="name-merc-col">
              <div class="name-row" lang="en"
                   v-html-safe="ansiToHtml(`${participant.hpPercent > 0 ? participant.tag + ' ' : ''}L${ANSI.boldWhite}${participant.level} ${participant.name}`)">
              </div>
              <MercOrders :merc="getMercenary(entity)" v-if="isMercenary(entity)"></MercOrders>
            </div>

            <div class="affect-area">
              <n-popover trigger="hover" placement="top-start">
                <template #trigger>
                  <div class="affect-row">
                    <span class="affect" v-for="affect in getAffects(participant)" v-html-safe="affect"/>
                  </div>
                </template>
                <HUDEffects :affects="entity.affects"/>
              </n-popover>
              <div class="bonus-row">
        <span class="affect affect-back" v-if="side === 'good' && entity && entity.combo > 0">
                <span class="amount bold-yellow">{{ entity.combo }}</span> <span class="label yellow">Combo</span>
              </span>
                <span class="affect affect-back" v-if="side === 'good' && entity && entity.rage > 0">
                <span class="amount bold-red">{{ entity.rage }}</span> <span class="label red">Rage</span>
              </span>
              </div>
            </div>

            <div class="target-row" v-if="participant.hpPercent > 0">
              <div v-if="participant.targetName" v-html-safe="ansiToHtml(`Target: ${getTarget(participant)}`)"></div>
            </div>
          </div>

          <div class="vital-area" v-if="participant.hpPercent > 0">
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
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, toRefs, computed, reactive } from 'vue'
import { NPopover, NProgress } from 'naive-ui'
import stripAnsi from 'strip-ansi'

import MercOrders from '@/components/battle/MercOrders.vue'

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { ANSI } from '@/static/constants'
import HUDEffects from '@/components/hud/HUDEffects.vue'

const { ansiToHtml } = useHelpers()
const { cmd } = useWebSocket()

const props = defineProps({
  participant: Object,
  entity: Object,
  side: String,
})

const { participant, entity, side } = toRefs(props)

const hasPrefix = (participant) => {
  return participant.isCasting
}

function target (participant) {
  if (participant.hpPercent == 0) return
  cmd(`target ${stripAnsi(participant.tag)}`)
}

const isAlive = (participant) => {
  return !participant.isDead && !participant.isIncapacitated
}

const isPlayer = (participant) => {
  return participant.eid === state.gameState.player.eid
}

const isPlayerTarget = (participant) => {
  const player = Object.values(state.gameState.battle.participants).find(p => p.eid === state.gameState.player.eid)
  if (!player || !player.targetName) return false
  if (!participant.tag) return false
  if (player.eid === participant.eid) return stripAnsi(player.targetName) === 'You'
  return stripAnsi(participant.tag) === stripAnsi(player.targetName)
}

const isTargetingPlayer = (participant) => {
  if (!participant.targetName) return false
  const name = stripAnsi(participant.targetName)
  return name === 'You'
}

function getAffects (participant) {
  let affects = []
  if (participant.isDead) {
    affects.push(ANSI.boldRed + 'DEAD' + ANSI.reset)
  }
  if (participant.isIncapacitated) {
    affects.push(ANSI.boldRed + 'DOWN' + ANSI.reset)
  }
  if (participant.isHidden) {
    affects.push(ANSI.boldYellow + 'HIDDEN' + ANSI.reset)
  }

  affects = affects.concat(participant.affects)
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
@shadow-offset: 4px;
@shadow-size: 8px;
@shadow-transparency: 0.2;
@border-transparency: 0.5;
@border-radius: 2px;
@triangle-size: 12px;

.main-card {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-self: stretch;
  flex-direction: column;
  justify-content: space-between;
  background-color: #462233;
  width: 250px;
  border-radius: @border-radius;
  border: 1px solid transparent;

  .card-layer-1 {
    border-radius: @border-radius;
    border: 1px solid transparent;
  }

  .card-layer-2 {
    border-radius: @border-radius;
    border: 1px solid transparent;
    padding: 5px 7px;
  }

  *, * > * {
    box-sizing: border-box;
  }

  @media screen and (min-width: 801px) and (max-width: 1075px) {
    .battle-status.mobile-menu-open & {
      width: 200px;
    }
  }

  &::before, .card-layer-1::before, .card-layer-2::before,
  &::after, .card-layer-1::after, .card-layer-2::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: @triangle-size;
    border-color: transparent;
    transform: rotate(0deg);
    pointer-events: none;
  }

  &::before, &::after {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .card-layer-1::before, .card-layer-1::after {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .card-layer-2::before, .card-layer-2::after {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .battle-entity.selectable & {
    cursor: pointer;
  }

  .battle-entity.targeting-you & {
    border-color: rgba(#ffa850, @border-transparency) !important;
    box-shadow: -@shadow-offset -@shadow-offset @shadow-size rgba(#ffa850, @shadow-transparency);

    &::after {
      bottom: auto;
      right: auto;
      border-width: @triangle-size @triangle-size 0 0;
      border-radius: @border-radius 0 0 0;
      border-color: #ffa850 transparent transparent;
    }
  }

  .battle-entity.selected & {
    .card-layer-1 {
      border-color: rgba(#ffed25, @border-transparency) !important;
      box-shadow: -@shadow-offset @shadow-offset @shadow-size rgba(#ffed25, @shadow-transparency);

      &::before {
        top: auto;
        right: auto;
        border-width: @triangle-size 0 0 @triangle-size;
        border-radius: 0 0 0 @border-radius;
        border-color: transparent transparent transparent #ffed25;
      }
    }
  }

  .battle-entity.acting & {
    .card-layer-2 {
      &::after {
        bottom: auto;
        left: auto;
        border-width: 0 @triangle-size @triangle-size 0;
        border-radius: 0 @border-radius 0 0;
      }
    }
  }

  .battle-entity.good & {
    background-color: #001800;

    @media (hover: hover) {
      transition: all 0.3s;
      &:hover {
        background-color: #002800;
      }
    }
  }

  .battle-entity.good.acting & {

    .card-layer-2 {
      border-color: rgba(#50ff50, @border-transparency);
      box-shadow: @shadow-offset -@shadow-offset @shadow-size rgba(#50ff50, @shadow-transparency);
    }

    .card-layer-2 {
      &::after {
        border-color: transparent #50ff50 transparent transparent;
      }
    }
  }

  .battle-entity.evil & {
    background-color: #180000;

    @media (hover: hover) {
      transition: all 0.3s;
      &:hover {
        background-color: #280000;
      }
    }
  }

  .battle-entity.evil.acting & {

    .card-layer-2 {
      border-color: rgba(#ff5050, @border-transparency);
      box-shadow: @shadow-offset -@shadow-offset @shadow-size rgba(#ff5050, @shadow-transparency);
    }

    .card-layer-2 {
      &::after {
        border-color: transparent #ff5050 transparent transparent;
      }
    }
  }

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
      justify-content: space-between;
    }

    .affect-area {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px;
    }

    .affect-row {
      cursor: help;
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
    margin: 6px 0 0;
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
}

.prefix {
  box-sizing: border-box;
  background: linear-gradient(to right, blue, transparent);
  padding: 5px;
}
</style>