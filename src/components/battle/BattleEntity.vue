<template>
  <div class="battle-entity" :class="{
    'dead': !isAlive(participant),
    'hidden': participant.hidden,
    'selectable': isAlive(participant),
    'good': side === 'good' && isAlive(participant),
    'evil': side === 'evil' && isAlive(participant),
    'merc': isMercenary(entity),
    'acting': participant.isActing,
  }" @click="target(participant)">
    <div class="main-card">
      <div class="card-row">
        <div class="info-column">
          <div class="name-area">
            <div class="name-merc-col">
              <div class="name-row" lang="en"
                v-html-safe="ansiToHtml(`${(participant.hpPercent) > 0 ? participant.tag + ' ' : ''}${ANSI.reset}L${ANSI.boldWhite}${participant.level} ${participant.colorName}`)">
              </div>
              <!-- <MercOrders :merc="getMercenary(entity)" v-if="isMercenary(entity)"></MercOrders> -->
            </div>

            <div v-if="expanded" class="target-row" >
              <NIconWrapper
                :size="14"
                :border-radius="0"
                color="rgba(0,0,0, 0.0)"
                v-if="isCharmie(entity)"
                :style="{ marginRight: '4px' }"
              >
                <NPopover trigger="hover">
                  <template #trigger>
                    <NIcon :size="14">
                      <CrisisAlertFilled></CrisisAlertFilled>
                    </NIcon>
                  </template>
                  <div>Set New Target:</div>
                  <div
                    v-for="enemy in getTargets()"
                    :key="enemy.eid"
                    class="target-name"
                    @click="setTarget($event, enemy.eid)"
                    v-html-safe="ansiToHtml(`${enemy.tag} ${enemy.name}`)"
                  ></div>
                </NPopover>
              </NIconWrapper>

              <NIconWrapper
                :size="14"
                :border-radius="0"
                color="rgba(0,0,0, 0.0)"
                v-if="!isMercenary(entity)"
                :style="{ marginRight: '4px' }"
              >
                <NIcon :size="14">
                  <CrisisAlertFilled></CrisisAlertFilled>
                </NIcon>
              </NIconWrapper>

              <div v-if="participant.targetName" v-html-safe="ansiToHtml(getTarget(participant))"></div>
            </div>
          </div>

          <div class="vital-area" v-if="participant.hpPercent > 0">
            <VitalsBar
              :hp-percent="getHpPercent(entity, participant, side)"
              :energy-percent="getEnergyPercent(entity, participant, side)"
              :stamina-percent="getStaminaPercent(entity, participant, side)"
              :hp-label="entity && side === 'good' ? entity.hp : participant.hpPercent + '%'"
              :energy-label="entity && side === 'good' ? entity.energy : participant.energyPercent + '%'"
              :stamina-label="entity && side === 'good' ? entity.stamina : participant.staminaPercent + '%'">
            </VitalsBar>
          </div>

          <div v-if="expanded" class="effect-area">
            <EffectsBar :entity="participant" :effects="participant.effects" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, toRefs } from 'vue'
import { NIcon, NIconWrapper, NPopover } from 'naive-ui'
import { CrisisAlertFilled } from '@vicons/material'
import stripAnsi from 'strip-ansi'

// import MercOrders from '@/components/battle/MercOrders.vue'

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { ANSI } from '@/static/constants'
import EffectsBar from '@/components/common/EffectsBar.vue'
import VitalsBar from '@/components/common/VitalsBar.vue'

const { ansiToHtml } = useHelpers()
const { runCommand } = useWebSocket()

const props = defineProps({
  participant: Object,
  entity: Object,
  side: String,
  expanded: Boolean
})

const { participant, entity, side } = toRefs(props)

function target (part) {
  if (part.hpPercent == 0) {
    return
  }
  runCommand(`target ${stripAnsi(part.tag)}`)
}

function isAlive (part) {
  return !part.dead && !part.incapacitated
}


function isMercenary (ent) {
  return ent && ent.traits && ent.traits.includes('mercenary')
}

function isCharmie (ent) {
  return state.gameState.charmies && ent && state.gameState.charmies[ent.eid]
}

function getTargets () {
  return Object.values(state.gameState.battle.participants)
    .filter(p => {
      return isAlive(p)
    })
}

function setTarget ($event, targetEid) {
  $event.stopPropagation()
  runCommand(`order eid:${entity.value.eid} target eid:${targetEid}`)
}

function getTarget (part) {
  if (!part.targetName) {
    return false
  }

  const tgt = Object.values(state.gameState.battle.participants)
    .find(p => stripAnsi(p.tag) === stripAnsi(part.targetName))

  return tgt ? `${tgt.tag} ${tgt.name}` : part.targetName
}

function getHpPercent (en, part, sd) {
  if (sd == 'good') {
    if (!en) {
      return 0
    }
    return Math.min(100, Math.max(0, en.hp / en.maxHp * 100))
  } else {
    if (!part) {
      return 0
    }
    return part.hpPercent
  }
}

function getEnergyPercent (en, part, sd) {
  if (sd == 'good') {
    if (!en) {
      return 0
    }
    return Math.min(100, Math.max(0, en.energy / en.maxEnergy * 100))
  } else {
    if (!part) {
      return 0
    }
    return part.energyPercent
  }
}

function getStaminaPercent (en, part, sd) {
  if (sd == 'good') {
    if (!en) {
      return 0
    }
    return Math.min(100, Math.max(0, en.stamina / en.maxStamina * 100))
  } else {
    if (!part) {
      return 0
    }
    return part.staminaPercent
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

    &:hover, &.info-btn-active {
      .n-icon-wrapper {
        transition: all 0.3s;
        background-color: #3bcdc0;
        color: #225522;
        border-radius: 50%;
        box-shadow: 0px 0px 4px #d4e648;
        background-color: #7afff4;
      }
    }
  }

  .info-column {
    width: 100%;

    .name-area {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      flex-basis: 100%;

      .name-effects-col {
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

    .effect-area {
      display: flex;
      min-height: 18px;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px;
    }

    .effect-row {
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

    .effect {
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
        &.set-mercenary-target {
          border: 1px solid #f5f5a3;
          border-radius: 4px;
          padding: 2px;
          &:hover {
            color: #f5f5a3;
          }
        }
      }

      display: flex;
      flex-direction: row;
      margin: 3px 0 3px 0;
      overflow-x: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      align-items: center;
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
      gap: 5px;
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
  width: 100%;
  max-width: 265px;
  border-radius: @border-radius;
  border: 1px solid transparent;
  padding: 5px 10px;

  *, * > * {
    box-sizing: border-box;
  }
}

.battle-entity.selectable .main-card {
  cursor: pointer;
}

.battle-entity.good .main-card {
  background-color: #001800;
}

@media (hover: hover) {
  .battle-entity.good .main-card {
    transition: all 0.3s;
  }
  .battle-entity.good .main-card:hover {
    background-color: #002800;
  }
  .battle-entity.evil .main-card:hover {
    background-color: #280000;
  }
}

.battle-entity.evil .main-card {
  background-color: #180000;
}

.battle-entity.acting .main-card {
  border-color: rgba(#ffed25, @border-transparency);
  box-shadow: 0 0 @shadow-size rgba(#ffed25, @shadow-transparency);
}

.battle-entity.good.acting .main-card {
  border-color: rgba(#50ff50, @border-transparency);
  box-shadow: 0 0 @shadow-size rgba(#50ff50, @shadow-transparency);
}

.battle-entity.evil.acting .main-card {
  border-color: rgba(#ff5050, @border-transparency);
  box-shadow: 0 0 @shadow-size rgba(#ff5050, @shadow-transparency);
}

.prefix {
  box-sizing: border-box;
  background: linear-gradient(to right, blue, transparent);
  padding: 5px;
}

.target-name {
  cursor: pointer;
  padding: 2px 4px;
  user-select: none;
  &:hover {
    background-color: #131;
  }
}
</style>
