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
    <div class="main-card">
      <div class="card-layer-1">
        <div class="card-layer-2">
          <div class="card-row">
            <div class="info-column">
              <div class="name-area">
                <div class="name-merc-col">
                  <div class="name-row" lang="en"
                    v-html-safe="ansiToHtml(`${(participant.hpPercent && extendedInfo) > 0 ? participant.tag + ' ' : ''}L${ANSI.boldWhite}${participant.level} ${participant.name}`)">
                  </div>
                  <MercOrders :merc="getMercenary(entity)" v-if="isMercenary(entity)"></MercOrders>
                </div>

                <div v-if="extendedInfo" class="target-row" >
                  <NIcon>
                    <CrisisAlertFilled></CrisisAlertFilled>
                  </NIcon>
                  <div v-if="participant.targetName" v-html-safe="ansiToHtml(getTarget(participant))"></div>
                </div>
              </div>

              <div class="vital-area" v-if="participant.hpPercent > 0">
                <div class="vital-row">

                  <div class="vital-bar hp bold-green">
                    <div class="vital-fill hp" :style="getHpFillStyle(entity, participant, side)"></div>
                    <div class="vital-value">
                      {{ entity && side === 'good' ? entity.hp : `${participant.hpPercent}%` }}
                    </div>
                  </div>

                  <div class="vital-bar energy bold-cyan">
                    <div class="vital-fill energy" :style="getEnergyFillStyle(entity, participant, side)">
                    </div>
                    <div class="vital-value">
                      {{ entity && side === 'good' ? entity.energy : `${participant.energyPercent}%` }}
                    </div>
                  </div>

                  <div class="vital-bar stamina bold-yellow">
                    <div class="vital-fill stamina" :style="getStaminaFillStyle(entity, participant, side)">
                    </div>
                    <div class="vital-value">
                      {{ entity && side === 'good' ? entity.stamina : `${participant.staminaPercent}%` }}
                    </div>
                  </div>

                </div>
              </div>

              <div v-if="extendedInfo" class="affect-area">
                <n-popover trigger="hover" placement="top-start">
                  <template #trigger>
                    <div className="affect-row popover">
                      <span v-if="getAffects(participant).length == 0" class="affect">No Affects</span>
                      <span className="affect" v-for="affect in getAffects(participant)" v-html-safe="affect" :key="affect.name" />
                    </div>
                  </template>
                  <HUDEffects :affects="participant.affects"/>
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
            </div>

            <div :class="getInfoBtnClass()">
              <NIconWrapper :size="28">
                <NIcon :size="24">
                  <SearchFilled @click.stop="toggleInfo()"></SearchFilled>
                </NIcon>
              </NIconWrapper>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, toRefs, ref, nextTick } from 'vue'
import { NPopover, NIcon, NIconWrapper } from 'naive-ui'
import { CrisisAlertFilled, SearchFilled } from '@vicons/material'
import stripAnsi from 'strip-ansi'

import MercOrders from '@/components/battle/MercOrders.vue'

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { ANSI } from '@/static/constants'
import HUDEffects from '@/components/hud/HUDEffects.vue'

const { ansiToHtml } = useHelpers()
const { runCommand } = useWebSocket()

const props = defineProps({
  participant: Object,
  entity: Object,
  side: String,
})

const { participant, entity, side } = toRefs(props)

const extendedInfo = ref(false)

function target (part) {
  if (part.hpPercent == 0) {
    return
  }
  runCommand(`target ${stripAnsi(part.tag)}`)
}

function isAlive (part) {
  return !part.isDead && !part.isIncapacitated
}

function isPlayer (part) {
  return part.eid === state.gameState.player.eid
}

function isPlayerTarget (part) {
  const player = Object.values(state.gameState.battle.participants).find(p => p.eid === state.gameState.player.eid)
  if (!player || !player.targetName) {
    return false
  }

  if (!part.tag) {
    return false
  }

  if (player.eid === part.eid) {
    return stripAnsi(player.targetName) === 'You'
  }

  return stripAnsi(part.tag) === stripAnsi(player.targetName)
}

function isTargetingPlayer (part) {
  if (!part.targetName) {
    return false
  }

  const name = stripAnsi(part.targetName)
  return name === 'You'
}

function getAffects (part) {
  let affects = []

  if (part.isDead) {
    affects.push(ANSI.boldRed + 'DEAD' + ANSI.reset)
  }

  if (part.isIncapacitated) {
    affects.push(ANSI.boldRed + 'DOWN' + ANSI.reset)
  }

  if (part.isHidden) {
    affects.push(ANSI.boldYellow + 'HIDDEN' + ANSI.reset)
  }

  affects = affects.concat(Object.entries(part.affects)
    .map(p => p[1].shortFlag))

  affects = affects.map(s => ansiToHtml(s))
    .filter(s => s.trim().length)

  console.log(affects)

  return affects
}

function isMercenary (ent) {
  return ent && ent.traits && ent.traits.includes('mercenary')
}

function getMercenary (ent) {
  return state.gameState.charmies[ent.eid]
}

function getTarget (part) {
  if (!part.targetName) {
    return false
  }

  const tgt = Object.values(state.gameState.battle.participants)
    .find(p => stripAnsi(p.tag) === stripAnsi(part.targetName))

  return tgt ? `${tgt.tag} ${tgt.name}` : part.targetName
}

function getHpFillStyle (en, part, sd) {
  if (sd == 'good') {
    if (!en) {
      return { width: '0' }
    }
    return { width: `${en.hp / en.maxHp * 100}%` }
  } else {
    if (!part) {
      return { width: '0' }
    }
    return { width: `${part.hpPercent}%` }
  }
}

function getEnergyFillStyle (en, part, sd) {
  if (sd == 'good') {
    if (!en) {
      return { width: '0' }
    }
    return { width: `${en.energy / en.maxEnergy * 100}%` }
  } else {
    if (!part) {
      return { width: '0' }
    }
    return { width: `${part.energyPercent}%` }
  }
}

function getStaminaFillStyle (en, part, sd) {
  if (sd == 'good') {
    if (!en) {
      return { width: '0' }
    }
    return { width: `${en.stamina / en.maxStamina * 100}%` }
  } else {
    if (!part) {
      return { width: '0' }
    }
    return { width: `${part.staminaPercent}%` }
  }
}

function toggleInfo () {
  extendedInfo.value = !extendedInfo.value
  nextTick(() => {
    console.log('emit scrolldown')
    state.inputEmitter.emit('scrollDown')
  })
}

function getInfoBtnClass () {
  return {
    'info-btn': true,
    'info-btn-active': extendedInfo.value,
  }
}
</script>

<style lang="less" scoped>
@shadow-offset: 0px;
@shadow-size: 8px;
@shadow-transparency: 0.2;
@border-transparency: 0.5;
@border-radius: 2px;
@triangle-size: 12px;

.battle-entity {
  display: flex;
  flex-direction: row;
}

.card-row {
  display: flex;
  flex-direction: row;
  width: 100%;

  .info-btn {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    margin-left: 5px;

    .n-icon-wrapper {
      transition: all 0.3s;
      background-color: #3bcdc0;

      &:hover, &.info-btn-active {
        color: #225522;
        border-radius: 50%;
        box-shadow: 0px 0px 4px #d4e648;
        background-color: #7afff4;
      }
    }
  }

  .info-column {
    width: 200px;

    .name-area {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      flex-basis: 100%;

      .name-affects-col {
        width: 100%;
      }

      .name-row {
        width: 100%;
        overflow-x: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .name-merc-col {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
    }

    .affect-area {
      display: flex;
      min-height: 18px;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px;
    }

    .affect-row {
      min-height: 22px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 4px 4px;
      flex-grow: 1;
      justify-content: flex-start;

      &.popover {
        cursor: help;
      }
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

    .order-dropdown {
      margin-left: 5px;
    }

    .target-row {
      width: 100%;
      i {
        color: #d45353;
        margin-right: 5px;
      }
      display: flex;
      flex-direction: row;
      margin: 3px 0 3px 0;
      overflow-x: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
      gap: 5px;

      .vital-bar {
        width: 100%;
        line-height: 1;
        border-radius: 2px;
        position: relative;

        &.hp {
          border: 1px solid #005500;
        }
        &.energy {
          border: 1px solid #005577;
        }
        &.stamina {
          border: 1px solid #554400;
        }

        .vital-value {
          position: relative;
          width: 100%;
          text-align: center;
          z-index: 10;
        }

        .vital-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          &.hp {
            background: linear-gradient(to right, #003300, #004400);
          }

          &.energy {
            background: linear-gradient(to right, #003344, #004455);
          }

          &.stamina {
            background: linear-gradient(to right, #443300, #554400);
          }
        }
      }
    }
  }
}

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

  *, * > * {
    box-sizing: border-box;
  }

  .card-layer-1 {
    width: 100%;
    border-radius: @border-radius;
    border: 1px solid transparent;
  }

  .card-layer-2 {
    width: 100%;
    border-radius: @border-radius;
    border: 1px solid transparent;
    padding: 5px 7px;
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
    top: 1px;
    left: 1px;
    right: 1px;
    bottom: 1px;
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
}

.prefix {
  box-sizing: border-box;
  background: linear-gradient(to right, blue, transparent);
  padding: 5px;
}
</style>
