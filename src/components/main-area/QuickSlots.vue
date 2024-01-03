<template>
  <div class="quick-container">
    <div class="quick-actions" v-show="state.activeTab == 'output'">

      <div class="quick-slot battle" v-if="state.gameState.battle.active && state.options.hideSidebar" @click="cmd('attack')">
        <div class="slot-label">
          <span class="bold-yellow">A</span><span class="bold-red">ttack</span>
        </div>
        <img src="@/assets/icons/xbox/x.png" class="icon" />
      </div>

      <div class="quick-slot loot" v-if="state.gameState.battle.active && state.options.hideSidebar" @click="cmd('defend')">
        <div class="slot-label">
          <span class="bold-yellow">D</span><span class="bold-cyan">efend</span>
        </div>
        <img src="@/assets/icons/xbox/y.png" class="icon" />
      </div>

      <div class="quick-slot harvest" v-if="state.gameState.battle.active && state.options.hideSidebar" @click="cmd('flee')">
        <div class="slot-label">
          <span class="bold-yellow">F</span><span class="yellow">lee</span>
        </div>
        <img src="@/assets/icons/xbox/b.png" class="icon" />
      </div>

      <div class="quick-slot battle" v-if="!state.gameState.battle.active && state.options.hideSidebar" @click="cmd('battle')">
        <div class="slot-label">
          <span class="bold-yellow">B</span><span class="bold-red">attle</span>
        </div>
        <img src="@/assets/icons/xbox/x.png" class="icon" />
      </div>

      <div class="quick-slot harvest" v-if="!state.gameState.battle.active && state.options.hideSidebar" @click="cmd('harvest')">
        <div class="slot-label">
          <span class="bold-yellow">H</span><span class="yellow">arvest</span>
        </div>
        <img src="@/assets/icons/xbox/y.png" class="icon" />
      </div>

      <div class="quick-slot loot" v-if="!state.gameState.battle.active && state.options.hideSidebar" @click="cmd('loot')">
        <div class="slot-label">
          <span class="bold-yellow">L</span><span class="bold-cyan">oot</span>
        </div>
        <img src="@/assets/icons/xbox/b.png" class="icon" />
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
import { NProgress } from 'naive-ui'
import { useWebSocket } from '@/composables/web_socket'

import { state } from '@/composables/state'

const { cmd } = useWebSocket()

let actionTimeout = null

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
  return (state.gameState.skills || []).find(sk => sk.name == slot.label)
}

function getSlotClass (slot) {
  let skill = getSkill(slot)
  if (skill) {
    if (skill.timeLeft) {
      return 'quick-slot selectable'
    }
    if (!skill.type.includes('combat') && state.gameState.battle.active) {
      return 'quick-slot selectable'
    }
    if (!skill.type.includes('overworld') && !state.gameState.battle.active) {
      return 'quick-slot selectable'
    }
  }
  return 'quick-slot selectable active'
}
</script>

<style scoped lang="less">

.quick-container {
  display: flex;
  flex-direction: row;
  margin-left: 8px;
  justify-content: flex-start;
  padding-bottom: 5px;
  .quick-actions {
    margin-left: 1px;
    margin-right: 8px;
    overflow-x: scroll;
  }

  .quick-slots {
    margin-right: 8px;
  }

  .quick-slots, .quick-actions {
    user-select: none;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 45px;
    &.show-mobile {
      margin: 0 5px;
    }
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
