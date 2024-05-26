<template>
  <div class="battle-area">
    <div class="battle-status">
      <template v-for="side in ['good', 'vs', 'evil']">
        <div v-if="side === 'vs'" class="vs">VS</div>
        <div v-if="side !== 'vs'" v-bind:class="getSideClass(side)">
          <div v-for="row in getRows(side)" class="side-row">
            <div v-for="participant in getSideInRow(side, row)" class="entity" :key="participant.eid">
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

              <BattleEntity :entity="getPartyEntity(participant)" :participant="participant" :side="side"></BattleEntity>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>

</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'

import BattleEntity from '@/components/battle/BattleEntity.vue'

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
  participants.sort((a, b) => a.sort < b.sort ? -1 : 1)
  return participants
}

function getParticipantsPerRow () {
  var m = window.matchMedia("(max-width: 1075px)")
  return !m.matches ? 3 : 2; // 2 per row on mobile
}

// Gets the participants of a side which belong to a certain row.
// Row begins at 1.
function getSideInRow(side, row) {
  const participants = getParticipants(side);
  const perRow = getParticipantsPerRow();

  const startIndex = (row * perRow) - perRow;
  const endIndex = (row * perRow);

  return participants.slice(startIndex, Math.min(endIndex, participants.length)); // Clamp by amount of participants.
}

// Gets the amount of participant rows per side.
// Ex. 7 participants = 3 rows (3, 3, 2).
function getRows (side) {
  const perRow = getParticipantsPerRow();

  const len = getParticipants(side).length
  const rows = Math.ceil(len / perRow)

  return Math.max(1, rows) // To ward off against 3 participants returning 0 rows.
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
  border-top: 2px solid #333;
}

.battle-status {
  display: flex;
  top: 0;
  width: 100%;
  padding-bottom: 10px;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  .vs {
    z-index: 1;
    padding: 0;
    margin: 0 4px;
    flex: 0 0 0;
    position: relative;
    font-family: 'DOS', monospace;
    animation: vs 0.4s ease-in forwards;
    font-size: 1.1rem;
    text-align: center;
    letter-spacing: 2px;
    //color: #c50f1f;
    color: #f5f5f5;
    //text-shadow:
    //      0px -2px 2px black,
    //      2px 0px 2px black,
    //      -2px 0px 2px black,
    //      0px -4px 4px #fff,
    //      0px -4px 4px #fff,
    //  0px -6px 6px #FF3,
    //  0px -6px 6px #FF3,
    //  0px -8px 8px #F90,
    //  0px -8px 8px #F90,
    //  0px -16px 12px #C33,
    //  0px -16px 12px #C33;
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

  .side {
    display: flex;
    flex-direction: row-reverse;
    flex-basis: 50%;

    .side-row {
      display: flex;
      flex-direction: column;
      justify-content: center;

      .entity {
        align-self: stretch;
        position: relative;
        margin: 5px;

        .damage {
          position: absolute;
          top: 0;
          font-size: 1.4rem;
          color: #ff3333;
          padding: 5px 10px;
          opacity: 0.8;
          background-color: #101014;
          z-index: 1;

          &.crit {
            line-height: 1.2rem;
            font-size: 1.9rem;
            color: #ffcc33;
          }
        }

        .healing {
          position: absolute;
          top: -40px;
          font-size: 1.4rem;
          color: #33ff33;
          padding: 5px 10px;
          opacity: 0.8;
          background-color: #101014;
          z-index: 1;
        }
      }
    }

    &.good {
      justify-content: end;
      .side-row {
        align-items: flex-start;
      }
    }

    &.evil {
      justify-content: start;
      flex-direction: row;
      .side-row {
        align-items: flex-start;
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

@media screen and (max-width: 1075px) {
  .battle-status {
    .game.show-mobile-menu & {
      flex-direction: column;
    }
    .side {
      flex-basis: auto;
      flex-direction: column-reverse;
      .side-row {
        flex-direction: row;
      }
      &.evil {
        flex-direction: column;
        .side-row {
          flex-direction: row;
        }
      }
    }
  }
}

@media screen and (max-width: 800px) {
  .battle-status {
    flex-direction: column;
    .side {
      flex-direction: column-reverse;
      .side-row {
        flex-direction: column-reverse;
      }
      &.evil {
        flex-direction: column;
        .side-row {
          flex-direction: column;
        }
      }
    }
  }
}

</style>
