<template>
  <div class="battle-area">
    <MercOrders v-if="showOrdersRef"></MercOrders>
    <div class="battle-status">
      <div class="side good">
        <div class="entity" v-for="entity in getSide('good')" :key="entity.name">
          <TransitionGroup appear name="damage">
            <div
              v-for="anim in state.animations.filter(a => a.eid == entity.eid && a.type == 'damage')"
              :key="anim.key"
              :class="getAnimationClass(anim)"
            >{{ anim.amount }}</div>
          </TransitionGroup>
          <TransitionGroup appear name="healing">
            <div
              v-for="anim in state.animations.filter(a => a.eid == entity.eid && a.type == 'healing')"
              :key="anim.key"
              :class="getAnimationClass(anim)"
            >{{ anim.amount }}</div>
          </TransitionGroup>
          <BattleEntity :entity="entity"></BattleEntity>
        </div>
      </div>

      <div class="vs">VS</div>

      <div class="side evil">
        <div class="entity" v-for="entity in getSide('evil')" :key="entity.name">
          <TransitionGroup appear name="damage">
            <div
              v-for="anim in state.animations.filter(a => a.eid == entity.eid && a.type == 'damage')"
              :key="anim.key"
              :class="getAnimationClass(anim)"
            >{{ anim.amount }}</div>
          </TransitionGroup>
          <TransitionGroup appear name="healing">
            <div
              v-for="anim in state.animations.filter(a => a.eid == entity.eid && a.type == 'healing')"
              :key="anim.key"
              :class="getAnimationClass(anim)"
            >{{ anim.amount }}</div>
          </TransitionGroup>
          <BattleEntity :entity="entity"></BattleEntity>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import {onMounted, ref, watch} from 'vue'

import { state } from '@/composables/state'

import BattleEntity from '@/components/main-area/battle-items/BattleEntity.vue'
import MercOrders from '@/components/main-area/battle-items/MercOrders.vue'

const battleStatus = ref(null)
const showOrdersRef = ref(false)

function getSide (side) {
  return state.gameState.battle.participants.filter(p => p.side == side)
}

function getAnimationClass (anim) {
  let classes = []
  classes.push(anim.type)
  if (anim.crit) {
    classes.push('crit')
  }
  return classes.join(' ')
}

function isMercHere() {
  let isMercHere = false
  state.gameState.battle.participants.map(participant => {
    if (participant.eid === state.gameState.mercEid) {
      isMercHere = true
    }
  })
  return isMercHere
}

onMounted(() => {
  let parent = battleStatus.value?.parentElement
  showOrdersRef.value = isMercHere()
  if (parent) {
    parent.scrollTo(0, parent.scrollHeight)
  }
})

watch(state.gameState.battle.participants, function () {
  showOrdersRef.value = isMercHere()
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
    flex-grow: 1;
    flex-basis: 48%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;

    &.good {
      justify-content: flex-end;
    }

    &.evil {
      justify-content: flex-start;
    }

    .entity {
      align-items: center;
      position: relative;
      margin: 5px;

      .damage {
        position: absolute;
        opacity: 0;
        top: 40px;
        left: 10px;
        font-size: 1.4rem;
        color: #ff3333;
        &.crit {
          line-height: 20px;
          font-size: 1.9rem;
          color: #ffcc33;
        }
      }

      .healing {
        position: absolute;
        opacity: 0;
        top: -22px;
        left: 20px;
        font-size: 1.4rem;
        color: #33ff33;
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
    top: 40px;
    // font-size: 14px;
  }
  60% {
    opacity: 0.9;
    top: -18px;
  }
  100% {
    opacity: 0;
    top: -20px;
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
    top: -27px;
    // font-size: 30px;
  }
  60% {
    opacity: 0.9;
    top: 30px;
  }
  100% {
    opacity: 0;
    top: 40px;
    // font-size: 14px;
  }
}

@media screen and (max-width: 1000px) {
  .battle-status {
    .vs {
      font-size: 0.9rem;
    }
  }
}

@media screen and (max-width: 800px) {
  .battle-status {
    .vs {
      font-size: 0.8rem;
    }
    .side {
      .entity {
        margin: 1px;
      }
    }
  }
}

</style>
