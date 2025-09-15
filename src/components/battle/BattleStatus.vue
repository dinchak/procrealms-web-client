<template>
  <div class="battle-area">

    <div class="battle-footer">
      <MyTurnIndicator v-if="state.gameState.battle.myTurn" />

      <BattleField />

      <div class="expand-btn" v-if="!state.options.battleAlwaysExpanded">
        <NIconWrapper :size="28" :border-radius="4">
          <NIcon :size="24" color="#f5f5f5">
            <UnfoldMoreFilled v-if="!expandEntities" @click.stop="toggleInfo()"></UnfoldMoreFilled>
            <UnfoldLessFilled v-if="expandEntities" @click.stop="toggleInfo()"></UnfoldLessFilled>
          </NIcon>
        </NIconWrapper>
      </div>
    </div>

    <div class="battle-status">

      <template v-for="side in ['good', 'vs', 'evil']" :key="side">
        <div v-if="side === 'vs'" class="vs-container">
          <div class="vs">VS</div>
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
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import { NIcon, NIconWrapper } from 'naive-ui'
import { UnfoldMoreFilled, UnfoldLessFilled } from '@vicons/material'
import MyTurnIndicator from '@/components/battle/MyTurnIndicator.vue'

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'

import BattleEntity from '@/components/battle/BattleEntity.vue'
import BattleField from '@/components/battle/BattleField.vue'

const expandEntities = ref(state.options.battleAlwaysExpanded)

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

function toggleInfo () {
  expandEntities.value = !expandEntities.value
  nextTick(() => {
    state.inputEmitter.emit('scrollDown')
  })
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

  .battle-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 10px;

    /* my-turn moved to a reusable component: src/components/battle/MyTurnIndicator.vue */

    .expand-btn {
      border: 1px solid #777;
      border-radius: 5px;
      cursor: pointer;
      width: 28px;
      height: 28px;
      display: flex;
      justify-content: flex-start;
      .n-icon-wrapper {
        background-color: #18181b;
        &:hover {
          background-color: #333;
        }
      }
    }

}

/* my-turn transition styles moved to MyTurnIndicator.vue */

.battle-status {
  display: flex;
  top: 0;
  width: 100%;
  padding-bottom: 10px;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  .vs-container {
    display: flex;
    justify-content: center;
    align-items: center;
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
    display: flex;
    flex-wrap: wrap;
    margin: 12px 12px;
    gap: 4px;
    align-self: flex-start;

    &.good {
      justify-content: flex-end;
    }

    &.evil {
      justify-content: start;
    }

    .entity {
      align-self: stretch;
      position: relative;

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

@media screen and (max-width: 960px) {
  .battle-status {
    flex-direction: column;
    .side {
      flex-direction: column;
      align-self: center;
    }
  }
}

}

</style>
