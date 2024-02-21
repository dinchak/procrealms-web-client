<template>
  <div class="battle-area">
    <MercOrders v-if="showOrdersRef"></MercOrders>

    <div class="battle-status">
      <div class="side good">
        <div class="entity" v-for="participant in getSide('good')" :key="participant.eid">
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

          <BattleEntity :entity="getPartyEntity(participant)" :participant="participant" :side="'good'"></BattleEntity>
        </div>
      </div>

      <div class="vs">VS</div>

      <div class="side evil">
        <div class="entity" v-for="participant in getSide('evil')" :key="participant.eid">
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

          <BattleEntity :entity="{}" :participant="participant" :side="'evil'"></BattleEntity>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

import { state } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'

import BattleEntity from '@/components/battle/BattleEntity.vue'
import MercOrders from '@/components/battle/MercOrders.vue'

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

const battleStatus = ref(null)
const showOrdersRef = ref(false)

function getSide (side) {
  return Object.values(state.gameState.battle.participants).filter(p => p.side == side)
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

function isMercHere() {
  let isMercHere = false
  Object.values(state.gameState.battle.participants).map(participant => {
    if (participant.eid === state.mercEid) {
      isMercHere = true
    }
  })
  return isMercHere
}

let unwatch
onMounted(() => {
  state.inputEmitter.on('selectBattleAction', selectBattleAction)
  state.inputEmitter.on('performBattleAction', performBattleAction)

  let parent = battleStatus.value?.parentElement
  showOrdersRef.value = isMercHere()
  if (parent) {
    parent.scrollTo(0, parent.scrollHeight)
  }

  unwatch = watch(state.gameState.battle.participants, () => {
    showOrdersRef.value = isMercHere()
  })
})

onBeforeUnmount(() => {
  state.inputEmitter.off('selectBattleAction', selectBattleAction)
  state.inputEmitter.off('performBattleAction', performBattleAction)
  unwatch()
})


</script>

<style lang="less">

.battle-area {
  margin-top: 5px;
  border-top: 2px solid #333;
}

.battle-status {
  display: flex;
  top: 0;
  width: 100%;
  margin-top: 5px;
  padding-top: 20px;
  padding-bottom: 10px;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  .vs {
    flex-basis: 4%;
    font-size: 1.1rem;
    color: #c50f1f;
    text-align: center;
  }

  .side {
    display: flex;
    flex-direction: column;

    &.good {
      align-items: flex-end;
    }

    &.evil {
      align-items: flex-start;
    }

    .entity {
      // align-items: center;
      position: relative;
      margin-bottom: 5px;
      
      .damage {
        opacity: 0;
        position: absolute;
        top: 0px;
        // left: 10px;
        font-size: 1.4rem;
        color: #ff3333;
        padding: 2px 4px;
        border: 1px solid #330000;
        background-color: rgba(0, 0, 0, 0.4);
        &.crit {
          line-height: 1.2rem;
          font-size: 1.9rem;
          color: #ffcc33;
          border: 1px solid #332200
        }
      }

      .healing {
        position: absolute;
        opacity: 0;
        top: -40px;
        font-size: 1.4rem;
        color: #33ff33;
        border: 1px solid #003300;
        background-color: rgba(0, 0, 0, 0.4);
      }

    }
  }
}

.damage-enter-active {
  animation: damage 1s ease-out;
}

@keyframes damage {
  0% {
    opacity: 1;
    top: 0px;
    // font-size: 14px;
  }
  60% {
    opacity: 0.9;
    top: -35px;
  }
  100% {
    opacity: 0;
    top: -40px;
    // font-size: 30px;
    // left: 7px;
  }
}

.healing-enter-active {
  animation: healing 1s ease-out;
}

@keyframes healing {
  0% {
    opacity: 1;
    top: -40px;
    // font-size: 30px;
  }
  60% {
    opacity: 0.9;
    top: -5px;
  }
  100% {
    opacity: 0;
    top: 0px;
    // font-size: 14px;
  }
}

// @media screen and (max-width: 1000px) {
//   .battle-status {
//     .vs {
//       font-size: 0.9rem;
//     }
//   }
// }

@media screen and (max-width: 800px) {
  .battle-status {
    flex-direction: column;
  }
}

@media screen and (max-width: 420px) {
  .battle-status {
    flex-direction: column;
  }
}

</style>
