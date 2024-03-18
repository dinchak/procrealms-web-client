<template>
  <div :class="'quick-container' + getMobileLayoutClass()">
    <div :class="'quick-actions'  + getMobileLayoutClass()" v-show="state.activeTab == 'output'">

      <div class="quick-slot battle" v-if="state.gameState.battle.active && !state.options.showMobileMenu" @click="cmd('attack')">
        <div class="slot-label">
          <span class="bold-yellow">A</span><span class="bold-red">ttack</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/x.png" class="icon" />
      </div>

      <div class="quick-slot loot" v-if="state.gameState.battle.active && !state.options.showMobileMenu" @click="cmd('defend')">
        <div class="slot-label">
          <span class="bold-yellow">D</span><span class="bold-cyan">efend</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/y.png" class="icon" />
      </div>

      <div class="quick-slot harvest" v-if="state.gameState.battle.active && !state.options.showMobileMenu" @click="cmd('flee')">
        <div class="slot-label">
          <span class="bold-yellow">F</span><span class="yellow">lee</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/b.png" class="icon" />
      </div>

      <div class="quick-slot battle" v-if="!state.gameState.battle.active && !state.options.showMobileMenu" @click="cmd('battle')">
        <div class="slot-label">
          <span class="bold-yellow">B</span><span class="bold-red">attle</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/x.png" class="icon" />
      </div>

      <div class="quick-slot harvest" v-if="!state.gameState.battle.active && !state.options.showMobileMenu" @click="cmd('harvest')">
        <div class="slot-label">
          <span class="bold-yellow">H</span><span class="yellow">arvest</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/y.png" class="icon" />
      </div>

      <div class="quick-slot loot" v-if="!state.gameState.battle.active && !state.options.showMobileMenu" @click="cmd('loot')">
        <div class="slot-label">
          <span class="bold-yellow">L</span><span class="bold-cyan">oot</span>
        </div>
        <img v-if="isGamepadConnected()" src="@/assets/icons/xbox/b.png" class="icon" />
      </div>
    <!-- </div>

    <div class="quick-slots" v-show="slots().length && state.activeTab == 'output'"> -->
      <div v-for="slot in slots()" :key="slot.slot" :class="getSlotClass(slot)" @click="runQuickSlot(slot)">
        <n-progress v-if="getSkill(slot) && getSkill(slot).timeLeft" type="line" status="success" :percentage="100 - getSkill(slot).timeLeft / getSkill(slot).cooldownTime * 100" :show-indicator="false" />
        <div class="slot-label">{{ slot.label }}</div>
        <div class="slot-number">{{ slot.slot }}</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, defineProps, toRefs } from 'vue'
import { NProgress } from 'naive-ui'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

import { state } from '@/composables/state'

const { cmd } = useWebSocket()
const { isGamepadConnected } = useHelpers()

const props = defineProps({
  layoutMode: String
})

const { layoutMode } = toRefs(props)

let actionTimeout = null

function getQuickContainerClass () {
  let classes = ['quick-container']
  if (layoutMode.value === 'mobile') {
    classes.push('mobile-layout-mode')
  }
  return classes
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
    if (!skill.type.includes('overworld') && !state.gameState.battle.active) {
      return classes.join(' ')
    }
  }

  classes.push('active')
  return classes.join(' ')
}

function quickSlot1 () {
  let slot = state.gameState.slots.find(s => s.slot == '1')
  if (slot) {
    cmd('1')
  }
}

function quickSlot2 () {
  let slot = state.gameState.slots.find(s => s.slot == '2')
  if (slot) {
    cmd('2')
  }
}

function quickSlot3 () {
  let slot = state.gameState.slots.find(s => s.slot == '3')
  if (slot) {
    cmd('3')
  }
}

function quickSlot4 () {
  let slot = state.gameState.slots.find(s => s.slot == '4')
  if (slot) {
    cmd('4')
  }
}

function quickSlot5 () {
  let slot = state.gameState.slots.find(s => s.slot == '5')
  if (slot) {
    cmd('5')
  }
}

function quickSlot6 () {
  let slot = state.gameState.slots.find(s => s.slot == '6')
  if (slot) {
    cmd('6')
  }
}

function quickSlot7 () {
  let slot = state.gameState.slots.find(s => s.slot == '7')
  if (slot) {
    cmd('7')
  }
}

function quickSlot8 () {
  let slot = state.gameState.slots.find(s => s.slot == '8')
  if (slot) {
    cmd('8')
  }
}

function quickSlot9 () {
  let slot = state.gameState.slots.find(s => s.slot == '9')
  if (slot) {
    cmd('9')
  }
}

function quickSlot0 () {
  let slot = state.gameState.slots.find(s => s.slot == '0')
  if (slot) {
    cmd('0')
  }
}

function quickSlotMinus () {
  let slot = state.gameState.slots.find(s => s.slot == '-')
  if (slot) {
    cmd('-')
  }
}

function quickSlotEquals () {
  let slot = state.gameState.slots.find(s => s.slot == '=')
  if (slot) {
    cmd('=')
  }
}

onMounted(() => {
  state.inputEmitter.on('quickSlot1', quickSlot1)
  state.inputEmitter.on('quickSlot2', quickSlot2)
  state.inputEmitter.on('quickSlot3', quickSlot3)
  state.inputEmitter.on('quickSlot4', quickSlot4)
  state.inputEmitter.on('quickSlot5', quickSlot5)
  state.inputEmitter.on('quickSlot6', quickSlot6)
  state.inputEmitter.on('quickSlot7', quickSlot7)
  state.inputEmitter.on('quickSlot8', quickSlot8)
  state.inputEmitter.on('quickSlot9', quickSlot9)
  state.inputEmitter.on('quickSlot0', quickSlot0)
  state.inputEmitter.on('quickSlotMinus', quickSlotMinus)
  state.inputEmitter.on('quickSlotEqual', quickSlotEquals)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('quickSlot1', quickSlot1)
  state.inputEmitter.off('quickSlot2', quickSlot2)
  state.inputEmitter.off('quickSlot3', quickSlot3)
  state.inputEmitter.off('quickSlot4', quickSlot4)
  state.inputEmitter.off('quickSlot5', quickSlot5)
  state.inputEmitter.off('quickSlot6', quickSlot6)
  state.inputEmitter.off('quickSlot7', quickSlot7)
  state.inputEmitter.off('quickSlot8', quickSlot8)
  state.inputEmitter.off('quickSlot9', quickSlot9)
  state.inputEmitter.off('quickSlot0', quickSlot0)
  state.inputEmitter.off('quickSlotMinus', quickSlotMinus)
  state.inputEmitter.off('quickSlotEqual', quickSlotEquals)
})
</script>

<style scoped lang="less">

.quick-container {
  display: flex;
  flex-direction: row;
  margin-left: 8px;
  justify-content: flex-start;
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

      &.battle {
        background-color: #151111;
        border: 1px solid #e88080;
        justify-content: center;
        &.selected {
          border: 1px solid #f8ff25;
        }
        .slot-label {
          font-size: 16px;
          line-height: 16px;
          text-align: center;
        }
        &:hover {
          background-color: darken(#e88080, 60%);
        }
      }

      &.harvest {
        background-color: #151511;
        border: 1px solid #c6c60c;
        justify-content: center;
        &.selected {
          border: 1px solid #f8ff25;
        }
        .slot-label {
          font-size: 16px;
          line-height: 16px;
          text-align: center;
        }
        &:hover {
          background-color: darken(#c6c60c, 33%);
        }
      }

      &.loot {
        background-color: #111515;
        border: 1px solid #0cc6c6;
        justify-content: center;
        &.selected {
          border: 1px solid #f8ff25;
        }
        .slot-label {
          font-size: 16px;
          line-height: 16px;
          text-align: center;
        }
        &:hover {
          background-color: darken(#0cc6c6, 33%);
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
