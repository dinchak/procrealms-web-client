<template>
  <div :class="{
    'quick-container': true,
    'mobile-layout-mode': false
  }">
    <div class="quick-scroller">
      <div :class="getAttackButtonClass()" v-if="state.gameState.battle.active"
           @click="conditionalCmd(isAttackButtonActive, 'attack')">
        <div class="slot-label" v-if="isAttackButtonActive()">
          <span class="bold-yellow">A</span><span class="bold-red">ttack</span>
        </div>
        <div class="slot-label" v-else>
          <span class="white">A</span><span class="bold-black">ttack</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/x.png" class="icon"/>
      </div>

      <div :class="getDefendButtonClass()" v-if="state.gameState.battle.active"
           @click="conditionalCmd(isDefendButtonActive, 'defend')">
        <div class="slot-label" v-if="isDefendButtonActive()">
          <span class="bold-yellow">D</span><span class="bold-cyan">efend</span>
        </div>
        <div class="slot-label" v-else>
          <span class="white">D</span><span class="bold-black">efend</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/y.png" class="icon"/>
      </div>

      <div :class="getFleeButtonClass()" v-if="state.gameState.battle.active"
           @click="conditionalCmd(isFleeButtonActive,'flee')">
        <div class="slot-label" v-if="isFleeButtonActive()">
          <span class="bold-yellow">F</span><span class="yellow">lee</span>
        </div>
        <div class="slot-label" v-else>
          <span class="white">F</span><span class="bold-black">lee</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/b.png" class="icon"/>
      </div>

      <div :class="getBattleButtonClass()" v-if="!state.gameState.battle.active"
           @click="conditionalCmd(isBattleButtonActive, 'battle')">
        <div class="slot-label" v-if="isBattleButtonActive()">
          <span class="bold-yellow">B</span><span class="bold-red">attle</span>
        </div>
        <div class="slot-label" v-else>
          <span class="white">B</span><span class="bold-black">attle</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/x.png" class="icon"/>
      </div>

      <div :class="getHarvestButtonClass()" v-if="!state.gameState.battle.active"
           @click="conditionalCmd(isHarvestButtonActive, 'harvest')">
        <div class="slot-label" v-if="isHarvestButtonActive()">
          <span class="bold-yellow">H</span><span class="yellow">arvest</span>
        </div>
        <div class="slot-label" v-else>
          <span class="white">H</span><span class="bold-black">arvest</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/y.png" class="icon"/>
      </div>

      <div :class="getLootButtonClass()" v-if="!state.gameState.battle.active"
           @click="conditionalCmd(isLootButtonActive, 'loot')">
        <div class="slot-label" v-if="isLootButtonActive()">
          <span class="bold-yellow">L</span><span class="bold-cyan">oot</span>
        </div>
        <div class="slot-label" v-else>
          <span class="white">L</span><span class="bold-black">oot</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/b.png" class="icon"/>
      </div>

      <div v-for="slot in getSlots()" :key="slot.slot" :class="getSlotClass(slot)" @click="runQuickSlot(slot)">
        <NProgress v-if="getSkill(slot) && getSkill(slot).timeLeft" type="line" status="success"
                   :percentage="100 - getSkill(slot).timeLeft / getSkill(slot).cooldownTime * 100"
                   :show-indicator="false"/>
        <div class="slot-label">{{ slot.label }}</div>
        <div class="slot-number">{{ slot.slot }}</div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { NProgress } from 'naive-ui'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

import { state } from '@/static/state'

import { QUICKSLOTS } from '@/static/constants'

const { runCommand } = useWebSocket()
const { isGamepadConnected } = useHelpers()

let actionTimeout = null

function conditionalCmd (condition, cmdString) {
  if (condition()) {
    runCommand(cmdString)
  }
}

function isAttackButtonActive () {
  return state.gameState.battle.active && state.gameState.battle.myTurn
}

function getAttackButtonClass () {
  let classes = ['quick-slot', 'attack']
  if (isAttackButtonActive()) {
    classes.push('active')
  }
  return classes.join(' ')
}

function isDefendButtonActive () {
  return state.gameState.battle.active && state.gameState.battle.myTurn
}

function getDefendButtonClass () {
  let classes = ['quick-slot', 'defend']
  if (isDefendButtonActive()) {
    classes.push('active')
  }
  return classes.join(' ')
}

function isFleeButtonActive () {
  return state.gameState.battle.active && state.gameState.battle.myTurn
}

function getFleeButtonClass () {
  let classes = ['quick-slot', 'flee']
  if (isFleeButtonActive()) {
    classes.push('active')
  }
  return classes.join(' ')
}

function isBattleButtonActive () {
  return state.gameState.player.canBattle
}

function getBattleButtonClass () {
  let classes = ['quick-slot', 'battle']
  if (isBattleButtonActive()) {
    classes.push('active')
  }
  return classes.join(' ')
}

function isHarvestButtonActive () {
  return state.gameState.player.canHarvest
}

function getHarvestButtonClass () {
  let classes = ['quick-slot', 'harvest']
  if (isHarvestButtonActive()) {
    classes.push('active')
  }
  return classes.join(' ')
}

function isLootButtonActive () {
  return state.gameState.player.canLoot
}

function getLootButtonClass () {
  let classes = ['quick-slot', 'loot']
  if (isLootButtonActive()) {
    classes.push('active')
  }
  return classes.join(' ')
}

function getSlots () {
  return [...state.gameState.slots]
    .filter(s => {
      if (s.slot.startsWith('a')) {
        return state.metaKeyState.alt && !state.metaKeyState.ctrl
      } else if (s.slot.startsWith('c')) {
        return state.metaKeyState.ctrl && !state.metaKeyState.alt
      } else {
        return !state.metaKeyState.ctrl && !state.metaKeyState.alt
      }
    })
    .sort((a, b) => {
      return QUICKSLOTS.indexOf(a.slot) > QUICKSLOTS.indexOf(b.slot) ? 1 : -1
    })
}

function runQuickSlot (slot) {
  if (actionTimeout || !isActive(slot)) {
    return
  }
  runCommand(slot.slot)
  actionTimeout = setTimeout(() => {
    actionTimeout = null
  }, 100)
}

function getSkill (slot) {
  return (state.gameState.skills || {})[slot.label]
}

function isActive (slot) {
  let skill = getSkill(slot)

  if (!skill) {
    return true
  }

  if (skill.timeLeft) {
    return false
  } else if (!skill.type.includes('combat') && state.gameState.battle.active) {
    return false
  } else if (!skill.type.includes('overworld') && (!state.gameState.battle.active || !state.gameState.battle.myTurn)) {
    return false
  }

  return true
}

function getSlotClass (slot) {
  let classes = ['quick-slot']

  if (isActive(slot)) {
    classes.push('active')
  }

  return classes.join(' ')
}

</script>

<style scoped lang="less">

.quick-container {
  box-sizing: border-box;
  padding: 5px 0;
  user-select: none;
  overflow-x: scroll;
  background-color: #18181b;

  .quick-scroller {
    display: flex;
    flex-direction: row;
    background-color: rgb(16, 18, 22);
    justify-content: left;
    gap: 5px;
    width: 0;
  }

  &.mobile-layout-mode {
    overflow-x: auto;
    padding-top: 10px;

    .quick-scroller {
      width: auto;
      overflow-x: auto;
      background-color: transparent;
      padding: 0;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
    }

    .quick-slot {
      flex: 0 0 auto;
      width: 78px;
      min-width: 78px;
    }
  }
}

.quick-slot {
   box-sizing: border-box;
  background-color: #222;
  border: 1px solid #222;
  display: flex;
  position: relative;
  padding: 2px;
  width: 80px;
  min-width: 80px;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  transition: all 0.3s;
  color: #767676;
  border-radius: 4px;
  height: 45px;

  &:last-child {
    margin-right: 0;
  }


  .icon {
    width: 20px;
    height: 20px;
    position: absolute;
    bottom: 0;
    right: 0;
  }
  .slot-number {
    padding: 2px 4px;
    border-bottom-right-radius: 4px;
    border-top-left-radius: 4px;
    position: absolute;
    bottom: 0;
    right: 0;
    height: 12px;
    font-size: 14px;
    line-height: 12px;
  }

  .slot-label {
    width: 100%;
    font-size: 11px;
    padding: 0 2px;
    word-wrap: break-word;
    line-height: 11px;
    text-align: left;
    overflow: hidden;
  }

  .n-progress {
    --n-rail-height: 2px !important;
    position: absolute;
    top: 0px;
    z-index: 5;
  }

  &.selected {
    border: 1px solid #f8ff25;
    box-shadow: 0 0 5px #f8ff25;
    color: #f8ff25;
  }

  &.active {
    color: #fff;
    background-color: #111511;
    border: 1px solid #16c60c;
    cursor: pointer;

    &.selected {
      border: 1px solid #f8ff25;
    }

    @media (hover: hover) {
      &:hover {
        color: #f9f1a5;
        background-color: darken(#16c60c, 33%);
      }
    }

    .slot-number {
      color: #ffff88;
      background-color: lighten(#112511, 10%);
    }
  }

  &.battle, &.attack {
    background-color: #111;
    border: 1px solid #808080;
    justify-content: center;

    &.active {
      background-color: #151111;
      border: 1px solid #e88080;

      &.selected {
        border: 1px solid #f8ff25;
      }

      &:hover {
        background-color: darken(#e88080, 60%);
      }
    }

    .slot-label {
      font-size: 16px;
      line-height: 16px;
      text-align: center;
    }
  }

  &.harvest, &.flee {
    background-color: #111;
    border: 1px solid #808080;
    justify-content: center;

    &.active {
      background-color: #151511;
      border: 1px solid #c6c60c;

      &.selected {
        border: 1px solid #f8ff25;
      }

      &:hover {
        background-color: darken(#c6c60c, 33%);
      }
    }

    .slot-label {
      font-size: 16px;
      line-height: 16px;
      text-align: center;
    }
  }

  &.loot, &.defend {
    background-color: #111;
    border: 1px solid #808080;
    justify-content: center;

    &.active {
      background-color: #111515;
      border: 1px solid #0cc6c6;

      &.selected {
        border: 1px solid #f8ff25;
      }

      &:hover {
        background-color: darken(#0cc6c6, 33%);
      }
    }

    .slot-label {
      font-size: 16px;
      line-height: 16px;
      text-align: center;
    }
  }
}
</style>
