<template>
  <div class="battle-area">
    <BattleField />
    <ReactionModal v-if="showReactionModal" />

    <div class="battle-table">
      <div class="participants-header">
        <div class="header-cell"></div>
        <div class="header-cell"></div>
        <div class="header-cell target">TG</div>
        <div class="header-cell right">MV</div>
        <div class="header-cell right">HP</div>
        <div class="header-cell right">EN</div>
        <div class="header-cell right">ST</div>
        <div class="header-cell right">Act</div>
      </div>
      <div
        :class="getParticipantClass(participant)"
        v-for="participant in participants"
        :key="participant.eid"
        @click="setTarget($event, participant.eid)"
      >
        <div style="position: relative;">
          <TransitionGroup
            name="damage"
            v-if="state.options.damageAnimations"
          >
            <div
              v-for="(anim, i) in getEntityAnimations(participant.eid, 'damage')"
              :key="anim.key"
              :style="{ marginLeft: `${10 + i * 50}px` }"
              :class="getAnimationClass(anim)"
            >{{ anim.amount }}</div>
          </TransitionGroup>

          <TransitionGroup
            name="healing"
            v-if="state.options.damageAnimations"
          >
            <div
              v-for="(anim, i) in getEntityAnimations(participant.eid, 'healing')"
              :key="anim.key"
              :style="{ marginLeft: `${10 + i * 50}px` }"
              :class="getAnimationClass(anim)"
            >{{ anim.amount }}</div>
          </TransitionGroup>

          <div v-html-safe="getParticipantName(participant)" :class="{ 'name-flash': flashing[participant.eid] === 'damage', 'name-flash-heal': flashing[participant.eid] === 'healing' }"></div>
        </div>

        <div>
          <EffectsBar
            v-if="participant.effects.length > 0 || participant.combo > 0 || participant.rage > 0"
            :entity="participant"
            :effects="participant.effects"
          />
        </div>
        <div>
          <div class="row target">
            <div v-html-safe="ansiToHtml(participant.targetName)"></div>
            <NIconWrapper
              :border-radius="0"
              :size="14"
              color="rgba(0,0,0, 0.0)"
              v-if="isCharmie(participant)"
              :style="{ marginLeft: '4px' }"
            >
              <NPopover trigger="hover">
                <template #trigger>
                  <NIcon :size="14" color="#50d223">
                    <CrisisAlertFilled></CrisisAlertFilled>
                  </NIcon>
                </template>
                <div>Set New Target:</div>
                <div
                  v-for="enemy in aliveTargets"
                  :key="enemy.eid"
                  class="target-name"
                  @click="setCharmieTarget($event, participant, enemy.eid)"
                  v-html-safe="getParticipantName(enemy)"
                ></div>
              </NPopover>
            </NIconWrapper>

          </div>
        </div>
        <div class="right">
          <div class="number">{{ participant.movement || ''}}</div>
        </div>
        <div :class="getHpClass(participant)">
          <div class="number">{{ getHp(participant) }}</div>
        </div>
        <div :class="getEnergyClass(participant)">
          <div class="number">{{ getEnergy(participant) }}</div>
        </div>
        <div :class="getStaminaClass(participant)">
          <div class="number">{{ getStamina(participant) }}</div>
        </div>
        <div class="right">
          {{ getNextAction(participant) }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { NIcon, NIconWrapper, NPopover } from 'naive-ui'
import { CrisisAlertFilled } from '@vicons/material'
import { computed, reactive, watch, onMounted, onBeforeUnmount } from 'vue'

import { ANSI } from '@/static/constants'
import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

import BattleField from '@/components/battle/BattleField.vue'
import EffectsBar from '@/components/common/EffectsBar.vue'
import ReactionModal from '@/components/battle/ReactionModal.vue'

const {
  ansiToHtml,
  renderNumber,
  getHpColorByPercent,
  getEnergyColorByPercent,
  getStaminaColorByPercent
} = useHelpers()

const { runCommand } = useWebSocket()

const flashing = reactive({})
const watchers = []

const participants = computed(() => {
  const { player, battle } = state.gameState
  const sortedParticipants = Object.values(battle.participants)

  sortedParticipants.sort((a, b) => {
    if (battle.myTurn) {
      const aIsPlayer = a.eid == player.eid ? 1 : 0
      const bIsPlayer = b.eid == player.eid ? 1 : 0
      if (aIsPlayer != bIsPlayer) {
        return bIsPlayer - aIsPlayer
      }
    }

    const aAlive = isAlive(a) ? 1 : 0
    const bAlive = isAlive(b) ? 1 : 0
    if (aAlive != bAlive) {
      return bAlive - aAlive
    }

    return a.nextAction - b.nextAction
  })

  return sortedParticipants
})

const aliveTargets = computed(() => participants.value.filter(p => isAlive(p)))

const animationsByEntity = computed(() => {
  const grouped = {}

  for (const anim of state.animations) {
    if (!grouped[anim.eid]) {
      grouped[anim.eid] = { damage: [], healing: [] }
    }

    if (anim.type == 'healing') {
      grouped[anim.eid].healing.push(anim)
    } else {
      grouped[anim.eid].damage.push(anim)
    }
  }

  return grouped
})

function getParticipantName (participant) {
  return ansiToHtml(participant.tag + ANSI.white + ' L' + ANSI.boldWhite + participant.level + ' ' + participant.colorName)
}

function getHp (participant) {
  if (participant.side == 'good') {
    let entity = getPartyEntity(participant)
    return entity.hp
  }
  return participant.hpPercent + '%'
}

function getHpClass (participant) {
  return ['right', 'number', getHpColor(participant)]
}

function getHpColor (participant) {
  let percent = 0
  if (participant.side == 'good') {
    let entity = getPartyEntity(participant)
    percent = entity.hp / entity.maxHp
  } else {
    percent = participant.hpPercent / 100
  }
  return getHpColorByPercent(percent)
}

function getEnergyClass (participant) {
  return ['right', 'number', getEnergyColor(participant)]
}

function getEnergy (participant) {
  if (participant.side == 'good') {
    let entity = getPartyEntity(participant)
    return entity.energy
  }
  return participant.energyPercent + '%'
}

function getEnergyColor (participant) {
  let percent = 0
  if (participant.side == 'good') {
    let entity = getPartyEntity(participant)
    percent = entity.energy / entity.maxEnergy
  } else {
    percent = participant.energyPercent / 100
  }
  return getEnergyColorByPercent(percent)
}

function getStaminaClass (participant) {
  return ['right', 'number', getStaminaColor(participant)]
}

function getStamina (participant) {
  if (participant.side == 'good') {
    let entity = getPartyEntity(participant)
    return entity.stamina
  }
  return participant.staminaPercent + '%'
}

function getStaminaColor (participant) {
  let percent = 0
  if (participant.side == 'good') {
    let entity = getPartyEntity(participant)
    percent = entity.stamina / entity.maxStamina
  } else {
    percent = participant.staminaPercent / 100
  }
  return getStaminaColorByPercent(percent)
}

function getNextAction (participant) {
  if (participant.isActing) {
    return 'Ready'
  }
  return renderNumber(participant.nextAction / 10) + 's'
}

function getPartyEntity (participant) {
  return state.gameState.party[participant.eid]
}

function getParticipantClass (participant) {
  let classes = ['participant']
  const { participants } = state.gameState.battle
  let me = participants[state.gameState.player.eid]
  if (me.targetEid == participant.eid) {
    classes.push('my-target')
  }
  return classes
}

function setTarget ($event, targetEid) {
  $event.stopPropagation()
  runCommand(`target eid:${targetEid}`)
}

function setCharmieTarget ($event, participant, targetEid) {
  $event.stopPropagation()
  runCommand(`order eid:${participant.eid} target eid:${targetEid}`)
}

function isCharmie (ent) {
  const { charmies } = state.gameState
  return charmies && ent && charmies[ent.eid]
}

function isAlive (participant) {
  return !participant.dead && !participant.incapacitated
}

const showReactionModal = computed(() => !!state.gameState.battle.pendingReaction)

function getEntityAnimations (eid, type) {
  const bucket = animationsByEntity.value[eid]
  if (!bucket) {
    return []
  }

  return type == 'healing' ? bucket.healing : bucket.damage
}

function getAnimationClass (anim) {
  let classes = [anim.type]
  if (anim.crit) {
    classes.push('crit')
  }
  return classes.join(' ')
}

onMounted(() => {
  watchers.push(watch(
    () => state.animations.slice(),
    (newAnims = [], oldAnims = []) => {
      const oldKeys = new Set((oldAnims || []).map(a => a.key))
      for (const a of (newAnims || [])) {
        if (oldKeys.has(a.key)) {
          continue
        }

        if (a.type === 'damage') {
          flashing[a.eid] = 'damage'
          setTimeout(() => {
            if (flashing[a.eid] === 'damage') {
              delete flashing[a.eid]
            }
          }, 2000)
        } else if (a.type === 'healing') {
          flashing[a.eid] = 'healing'
          setTimeout(() => {
            if (flashing[a.eid] === 'healing') {
              delete flashing[a.eid]
            }
          }, 2000)
        }
      }
    }
  ))
})

onBeforeUnmount(() => {
  for (const unwatch of watchers) {
    unwatch()
  }
})

</script>
<style lang="less" scoped>
.battle-area {
  margin-top: 10px;
  .battle-table {
    display: table;
    width: 100%;
    max-width: 780px;
    margin: 0 auto;

    .participants-header {
      display: table-row;
      color: #aaa;
      padding-bottom: 5px;

      .header-cell {
        display: table-cell;
        border-bottom: 1px solid #880000;
        padding: 2px 4px;
        &.target {
          width: 80px;
          max-width: 80px;
          text-align: right;
          @media (max-width: 600px) {
            width: initial;
            max-width: initial;
          }
        }
        &.right {
          text-align: right;
          width: 60px;
          max-width: 60px;
          @media (max-width: 600px) {
            width: initial;
            max-width: initial;
          }
        }
      }
    }

    .participant {
      display: table-row;
      padding: 5px 0;

      > div {
        display: table-cell;
        padding: 5px;
        vertical-align: top;
        border-bottom: 1px solid #333;
        .row {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          &.target {
            width: 80px;
            max-width: 80px;
            text-align: right;
            @media (max-width: 600px) {
              width: initial;
              max-width: initial;
            }
          }
        }
        &.right {
          width: 60px;
          max-width: 60px;
          text-align: right;
          @media (max-width: 600px) {
            width: initial;
            max-width: initial;
          }
        }
        .number {
          display: flex;
          justify-content: flex-end;
          width: 60px;
          text-align: right;
          min-width: 0;
          @media (max-width: 600px) {
            width: initial;
            min-width: initial;
          }
        }
      }

      &.my-target {
        background-color: rgba(240, 210, 52, 0.1);
      }

      &:hover {
        background-color: rgba(52, 240, 210, 0.1);
        cursor: pointer;
      }

      &:last-child {
        > div {
          border-bottom: none;
        }
      }

    }
  }
}
</style>
<style lang="less">
.target-name {
  cursor: pointer;
  padding: 2px 4px;
  user-select: none;
  &:hover {
    background-color: #131;
  }
}

.reaction-card {
  max-width: 400px;
  .valid-reactions {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.name-flash {
  animation: name-flash 700ms ease-in-out;
  border-radius: 3px;
}

@keyframes name-flash {
  0%   { background-color: rgba(255,0,0,0); transform: scale(1); }
  50%  { background-color: rgba(255,60,60,0.28); transform: scale(1.03); }
  100% { background-color: rgba(255,0,0,0); transform: scale(1); }
}

.name-flash-heal {
  animation: name-flash-heal 700ms ease-in-out;
  border-radius: 3px;
}

@keyframes name-flash-heal {
  0%   { background-color: rgba(0,255,0,0); transform: scale(1); }
  50%  { background-color: rgba(100,255,100,0.28); transform: scale(1.03); }
  100% { background-color: rgba(0,255,0,0); transform: scale(1); }
}

.damage {
  position: absolute;
  top: 0px;
  color: #ff3333;
  padding: 5px 10px;
  font-weight: bold;
  opacity: 1.0;
  background-color: transparent;
  z-index: 12;
  pointer-events: none;
  -webkit-font-smoothing: antialiased;

  &.crit {
    color: #ffd966;
  }
}

.healing {
  position: absolute;
  top: 0;
  color: #33ff33;
  padding: 5px 10px;
  opacity: 0.8;
  background-color: #101014;
  z-index: 1;
}

.damage-enter-active {
  animation: damage 2s ease-out;
  animation-fill-mode: forwards;
}

.damage-leave-active {
  animation: none;
  display: none;
}

@keyframes damage {
  0% {
    opacity: 1;
    transform: translateY(0px);
  }
  60% {
    opacity: 0.9;
    transform: translateY(-35px);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px);
  }
}

.healing-enter-active {
  animation: healing 2s ease-out;
  animation-fill-mode: forwards;
}

.healing-leave-active {
  animation: none;
}

@keyframes healing {
  0% {
    opacity: 1;
    transform: translateY(0px);
  }
  60% {
    opacity: 0.9;
    transform: translateY(-35px);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px);
  }
}

</style>