<template>
  <div :class="'quick-container' + getMobileLayoutClass()">
    <div :class="'quick-actions'  + getMobileLayoutClass()">

      <div :class="getAttackButtonClass()" v-if="state.gameState.battle.active" @click="cmd('attack')">
        <div class="slot-label" v-if="getAttackButtonClass().includes('active')">
          <span class="bold-yellow">A</span><span class="bold-red">ttack</span>
        </div>
        <div class="slot-label" v-else>
          <span class="white">A</span><span class="bold-black">ttack</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/x.png" class="icon" />
      </div>

      <div :class="getDefendButtonClass()" v-if="state.gameState.battle.active" @click="cmd('defend')">
        <div class="slot-label" v-if="getDefendButtonClass().includes('active')">
          <span class="bold-yellow">D</span><span class="bold-cyan">efend</span>
        </div>
        <div class="slot-label" v-else>
          <span class="white">D</span><span class="bold-black">efend</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/y.png" class="icon" />
      </div>

      <div :class="getFleeButtonClass()" v-if="state.gameState.battle.active" @click="cmd('flee')">
        <div class="slot-label" v-if="getFleeButtonClass().includes('active')">
          <span class="bold-yellow">F</span><span class="yellow">lee</span>
        </div>
        <div class="slot-label" v-else>
          <span class="white">F</span><span class="bold-black">lee</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/b.png" class="icon" />
      </div>

      <div :class="getBattleButtonClass()" v-if="!state.gameState.battle.active" @click="cmd('battle')">
        <div class="slot-label" v-if="getBattleButtonClass().includes('active')">
          <span class="bold-yellow">B</span><span class="bold-red">attle</span>
        </div>
        <div class="slot-label" v-else>
          <span class="white">B</span><span class="bold-black">attle</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/x.png" class="icon" />
      </div>

      <div :class="getHarvestButtonClass()" v-if="!state.gameState.battle.active" @click="cmd('harvest')">
        <div class="slot-label" v-if="getHarvestButtonClass().includes('active')">
          <span class="bold-yellow">H</span><span class="yellow">arvest</span>
        </div>
        <div class="slot-label" v-else>
          <span class="white">H</span><span class="bold-black">arvest</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/y.png" class="icon" />
      </div>

      <div :class="getLootButtonClass()" v-if="!state.gameState.battle.active" @click="cmd('loot')">
        <div class="slot-label" v-if="getLootButtonClass().includes('active')">
          <span class="bold-yellow">L</span><span class="bold-cyan">oot</span>
        </div>
        <div class="slot-label" v-else>
          <span class="white">L</span><span class="bold-black">oot</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/b.png" class="icon" />
      </div>

      <div v-for="slot in slots()" :key="slot.slot" :class="getSlotClass(slot)" @click="runQuickSlot(slot)">
        <n-progress v-if="getSkill(slot) && getSkill(slot).timeLeft" type="line" status="success" :percentage="100 - getSkill(slot).timeLeft / getSkill(slot).cooldownTime * 100" :show-indicator="false" />
        <div class="slot-label">{{ slot.label }}</div>
        <div class="slot-number">{{ slot.slot }}</div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { defineProps, toRefs } from 'vue'
import { NProgress } from 'naive-ui'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

import { state } from '@/static/state'

const { cmd } = useWebSocket()
const { isGamepadConnected } = useHelpers()

const props = defineProps({
  layoutMode: String
})

const { layoutMode } = toRefs(props)

let actionTimeout = null

function getAttackButtonClass () {
  let classes = ['quick-slot', 'attack']
  if (state.gameState.battle.active && state.gameState.battle.myTurn) {
    classes.push('active')
    classes.push('selectable')
  }
  return classes.join(' ')
}

function getDefendButtonClass () {
  let classes = ['quick-slot', 'defend']
  if (state.gameState.battle.active && state.gameState.battle.myTurn) {
    classes.push('active')
    classes.push('selectable')
  }
  return classes.join(' ')
}

function getFleeButtonClass () {
  let classes = ['quick-slot', 'flee']
  if (state.gameState.battle.active && state.gameState.battle.myTurn) {
    classes.push('active')
    classes.push('selectable')
  }
  return classes.join(' ')
}

function getBattleButtonClass () {
  let classes = ['quick-slot', 'battle']
  if (state.gameState.player.canBattle) {
    classes.push('active')
    classes.push('selectable')
  }
  return classes.join(' ')
}

function getHarvestButtonClass () {
  let classes = ['quick-slot', 'harvest']
  if (state.gameState.player.canHarvest) {
    classes.push('active')
    classes.push('selectable')
  }
  return classes.join(' ')
}

function getLootButtonClass () {
  let classes = ['quick-slot', 'loot']
  if (state.gameState.player.canLoot) {
    classes.push('active')
    classes.push('selectable')
  }
  return classes.join(' ')
}

function showCombatActions () {
  return state.gameState.battle.active && 
    state.gameState.battle.myTurn && 
    !state.options.showMobileMenu
}

function slots () {
  let slots = state.gameState.slots || []
  let isNumberSlot = s => s.slot >= '1' && s.slot <= '9';
  let numberSlots = slots.filter(isNumberSlot)
  numberSlots.sort((a, b) => a.slot.charCodeAt(0) > b.slot.charCodeAt(0) ? 1 : -1)

  let nonNumberSlotsMap = new Map(slots
      .filter(s => !isNumberSlot(s))
      .map((s) => [s.slot, s]))

  let addNonNumberSlot = slotChar => nonNumberSlotsMap.has(slotChar) && numberSlots.push(nonNumberSlotsMap.get(slotChar))
  addNonNumberSlot('0')
  addNonNumberSlot('-')
  addNonNumberSlot('=')
  return numberSlots
}

function runQuickSlot (slot) {
  if (actionTimeout) {
    return
  }
  cmd(slot.slot)
  actionTimeout = setTimeout(() => {
    actionTimeout = null
  }, 100)
}

function getSkill (slot) {
  return (state.gameState.skills || {})[slot.label]
}

function getMobileLayoutClass () {
  if (layoutMode.value === 'mobile') {
    return ' mobile-layout-mode'
  }
  return ''
}

function getSlotClass (slot) {
  let skill = getSkill(slot)
  let classes = ['quick-slot', 'selectable']
  if (layoutMode.value === 'mobile') {
    classes.push('mobile-layout-mode')
  }

  if (skill) {
    if (skill.timeLeft) {
      return classes.join(' ')
    }
    if (!skill.type.includes('combat') && state.gameState.battle.active) {
      return classes.join(' ')
    }
    if (!skill.type.includes('overworld') && (!state.gameState.battle.active || !state.gameState.battle.myTurn)) {
      return classes.join(' ')
    }
  }

  classes.push('active')
  return classes.join(' ')
}

</script>

<style scoped lang="less">

.quick-container {
  display: flex;
  flex-direction: row;
  margin-left: 8px;
  justify-content: space-between;
  min-height: 56px;
  background-color: rgb(16, 18, 22);
  
  &.mobile-layout-mode {
    overflow-x: initial;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-left: 5px;
    margin-right: 5px;
  }

  .quick-actions {
    margin-left: 1px;
    margin-right: 8px;
    overflow-x: scroll;
    padding-bottom: 5px;
    &.mobile-layout-mode {
      margin-left: 1px;
      margin-right: 8px;
      overflow-x: initial;
      padding-bottom: 15px;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-right: 0;
    }
  }

  .quick-slots {
    margin-right: 8px;
  }

  .quick-slots, .quick-actions {
    user-select: none;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .quick-slot {
      background-color: #222;
      border: 1px solid #222;
      display: flex;
      position: relative;
      padding: 2px;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      transition: all 0.3s;
      color: #767676;
      margin-right: 5px;
      border-radius: 4px;
      cursor: pointer;
      height: 45px;

      &.mobile-layout-mode {
        margin-right: 0;
        margin-top: 5px;
      }

      &:last-child {
        margin-right: 0;
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
        &.selected {
          border: 1px solid #f8ff25;
        }
        @media (hover: hover) {
          &:hover {
            cursor: pointer;
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
        font-size: 11px;
        width: 70px;
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
    }
  }
}
</style>
