<template>
  <div class="battle-area">

    <div class="battle-footer">
      <BattleField />
    </div>

    <div class="battle-status">

      <template v-for="side in ['good', 'vs', 'evil']" :key="side">
        <div v-if="side === 'vs'" class="vs-container">
          <div class="vs">VS</div>
          <ExpandBattleInfo v-if="!state.options.battleAlwaysExpanded" />
          <MyTurnIndicator v-if="state.gameState.battle.myTurn" />
        </div>

        <div v-if="side !== 'vs'" v-bind:class="getSideClass(side)">
          <div v-for="participant in getParticipants(side)" class="entity" :key="participant.eid">
            <TransitionGroup appear name="damage">
              <div
                v-for="(anim, i) in state.animations.filter(a => a.eid == participant.eid && a.type == 'damage')"
                :key="anim.key"
                :style="{ left: `${10 + i * 50}px` }"
                :class="getAnimationClass(anim)"
              >{{ anim.amount }}</div>
            </TransitionGroup>

            <TransitionGroup appear name="healing">
              <div
                v-for="(anim, i) in state.animations.filter(a => a.eid == participant.eid && a.type == 'healing')"
                :key="anim.key"
                :style="{ left: `${10 + i * 50}px` }"
                :class="getAnimationClass(anim)"
              >{{ anim.amount }}</div>
            </TransitionGroup>

            <BattleEntity
              :entity="getPartyEntity(participant)"
              :participant="participant"
              :side="side"
              :expanded="expandEntities"
            ></BattleEntity>
          </div>
        </div>
      </template>
    </div>

  </div>

</template>

<script setup>
import { onMounted, onBeforeUnmount, computed } from 'vue'
import MyTurnIndicator from '@/components/battle/MyTurnIndicator.vue'
import ExpandBattleInfo from '@/components/battle/ExpandBattleInfo.vue'

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'

import BattleEntity from '@/components/battle/BattleEntity.vue'
import BattleField from '@/components/battle/BattleField.vue'

const expandEntities = computed(() => {
  return state.options.battleAlwaysExpanded ? true : state.options.battleExpanded
})

const { selectNearestElement } = useHelpers()

let selectedElement = null
function selectBattleAction (degree) {
  selectedElement = selectNearestElement(selectedElement, degree)
}

function performBattleAction () {
  if (selectedElement) {
    selectedElement.click()
  }
}

function getParticipants (side) {
  let participants = Object.values(state.gameState.battle.participants).filter(p => p.side == side)
  participants.sort((a, b) => { return a.sort < b.sort ? -1 : 1 })
  return participants
}

function getPartyEntity (participant) {
  return state.gameState.party[participant.eid]
}

function getAnimationClass (anim) {
  let classes = [anim.type]
  if (anim.crit) {
    classes.push('crit')
  }
  return classes.join(' ')
}

function getSideClass (side) {
  let classes = ["side"]
  classes.push(side)
  return classes.join(' ')
}

onMounted(() => {
  state.inputEmitter.on('selectBattleAction', selectBattleAction)
  state.inputEmitter.on('performBattleAction', performBattleAction)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('selectBattleAction', selectBattleAction)
  state.inputEmitter.off('performBattleAction', performBattleAction)
})
</script>

<style lang="less" scoped>
.battle-area {
  margin-top: 5px;

  .battle-controls {
    display: none;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 25px;
    margin-bottom: 10px;
  }

  .battle-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
}

.battle-status {
  display: flex;
  top: 0;
  width: 100%;
  padding-bottom: 10px;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;

  .vs-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-direction: column;
    flex: 0 0 auto;
    gap: 20px;
    .vs {
      z-index: 1;
      margin: 0px 4px;
      flex: 0 0 0;
      position: relative;
      font-family: 'Inconsolata', monospace;
      animation: vs 0.4s ease-in forwards;
      font-size: 1.1rem;
      text-align: center;
      letter-spacing: 2px;
      color: #f5f5f5;
      text-shadow:
            0px -2px 2px black,
            2px 0px 2px black,
            -2px 0px 2px black;

      &::before, &::after {
        animation: vsburn 0.6s ease-out 0.2s forwards;
        opacity: 0;
        z-index: 0;
        position: absolute;
        color: transparent;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        content: 'VS';
        text-shadow: none;
      }

      &::before {
        z-index: -1;
        font-size: 1.25em;
        text-shadow:
              0 0 0 rgba(#ffb700, 0.7),
              0 0 8px #F90;
      }
      &::after {
        bottom: -2px;
        z-index: -2;
        font-size: 1.6em;
        text-shadow:
              0 0 0 rgba(#C33, 0.5),
              0 0 8px #C33;
      }
    }
  }

  .side {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(265px, max-content));
    grid-auto-rows: auto;
    gap: 4px;
    margin: 12px 12px;
    align-self: flex-start;
    width: fit-content;
    max-width: calc(50% - 40px);

    &.good {
      justify-content: end;
    }

    &.evil {
      justify-content: start;
    }

    .entity {
      display: inline-block;
      vertical-align: top;
      position: relative;
      align-self: start;
      min-width: 0;

      .damage {
        position: absolute;
        top: 0;
        font-size: 1.6rem;
        color: #ff3333;
        padding: 5px 10px;
        font-weight: bold;
        opacity: 1.0;
        background-color: transparent;
        z-index: 12;
        pointer-events: none;
        -webkit-font-smoothing: antialiased;

        &.crit {
          line-height: 1.2rem;
          font-size: 2.0rem;
          color: #ffd966;
        }
      }

      .healing {
        position: absolute;
        top: -40px;
        font-size: 1.6rem;
        color: #33ff33;
        padding: 5px 10px;
        opacity: 0.8;
        background-color: #101014;
        z-index: 1;
      }
    }
  }
}

.damage-enter-active {
  animation: damage 2s ease-out;
}

@keyframes damage {
  0% {
    opacity: 1;
    top: 0;
  }
  60% {
    opacity: 0.9;
    top: -35px;
  }
  100% {
    opacity: 0;
    top: -40px;
  }
}

.healing-enter-active {
  animation: healing 2s ease-out;
}

@keyframes healing {
  0% {
    opacity: 1;
    top: -40px;
  }
  60% {
    opacity: 0.9;
    top: -5px;
  }
  100% {
    opacity: 0;
    top: 0;
  }
}

@keyframes vs {
  0% {
    z-index: 2;
    rotate: 20deg;
    scale: 400%;
  }
  60% {
    scale: 80%;
    rotate: -10deg;
  }
  80% {
    scale: 110%;
  }
  99% {
    z-index: 2;
  }
  100% {
    z-index: auto;
    rotate: 0deg;
    scale: 100%;
  }
}
@keyframes vsburn {
  0% {
    opacity: 0;
    translate: 50% 0;
    scale: 200%;
  }
  100% {
    opacity: 1;
    translate: 0 0;
    scale: 100%;
  }
}

@media screen and (max-width: 640px) {
  .battle-status {
    flex-direction: column;
    .side {
      grid-template-columns: 1fr !important;
      width: 100% !important;
      max-width: 100% !important;
      justify-content: center;
      justify-items: center;
      align-self: center;

      .entity {
        display: flex;
        justify-content: center;
        width: 100%;
      }

      .main-card {
        width: 100%;
        max-width: 265px;
        margin: 0 auto;
      }
    }
  }
}

</style>
