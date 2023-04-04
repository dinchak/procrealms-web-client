<template>
  <div class="quick-container">
    <div class="quick-actions" v-show="state.activeTab == 'output' && state.options.hideSidebar">
      <div class="quick-slot battle" v-if="state.gameState.battle.active" @click="cmd('attack')">
        <div class="slot-label"><span class="bold-yellow">A</span><span class="bold-red">ttack</span></div>
      </div>
      <div class="quick-slot loot" v-if="state.gameState.battle.active" @click="cmd('defend')">
        <div class="slot-label"><span class="bold-yellow">D</span><span class="bold-cyan">efend</span></div>
      </div>
      <div class="quick-slot harvest" v-if="state.gameState.battle.active" @click="cmd('flee')">
        <div class="slot-label"><span class="bold-yellow">F</span><span class="yellow">lee</span></div>
      </div>

      <div class="quick-slot battle" v-if="!state.gameState.battle.active" @click="cmd('battle')">
        <div class="slot-label"><span class="bold-yellow">B</span><span class="bold-red">attle</span></div>
      </div>
      <div class="quick-slot harvest" v-if="!state.gameState.battle.active" @click="cmd('harvest')">
        <div class="slot-label"><span class="bold-yellow">H</span><span class="yellow">arvest</span></div>
      </div>
      <div class="quick-slot loot" v-if="!state.gameState.battle.active" @click="cmd('loot')">
        <div class="slot-label"><span class="bold-yellow">L</span><span class="bold-cyan">oot</span></div>
      </div>
    </div>

    <div class="quick-slots" v-show="slots().length && state.activeTab == 'output'">
      <div v-for="slot in slots()" :key="slot.slot" :class="getSlotClass(slot)" @click="runQuickSlot(slot)">
        <div class="slot-number">[<span class="bold-yellow">{{ slot.slot }}</span>]</div>
        <div class="slot-label">{{ slot.label }}</div>
        <n-progress v-if="getSkill(slot) && getSkill(slot).timeLeft" type="line" status="success" :percentage="100 - getSkill(slot).timeLeft / getSkill(slot).cooldownTime * 100" :show-indicator="false" />
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
  slots.sort((a, b) => a.slot.charCodeAt(0) > b.slot.charCodeAt(0) ? 1 : -1)
  return slots
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
      return 'quick-slot'
    }
    if (!skill.type.includes('combat') && state.gameState.battle.active) {
      return 'quick-slot'
    }
    if (!skill.type.includes('overworld') && !state.gameState.battle.active) {
      return 'quick-slot'
    }
  }
  return 'quick-slot active'
}
</script>

<style scoped lang="less">

.quick-container {
  display: flex;
  flex-direction: row;
  margin-left: 8px;
  justify-content: space-between;

  .quick-actions {
    margin-left: 4px;
    margin-right: 8px;
  }

  .quick-slots {
    margin-right: 8px;
  }

  .quick-slots, .quick-actions {
    user-select: none;
    display: flex;
    flex-direction: row;
    // justify-content: space-between;
    height: 40px;
    &.show-mobile {
      margin: 0 5px;
    }
    .quick-slot {
      background-color: #222;
      display: flex;
      padding: 2px;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      transition: all 0.3s;
      color: #767676;
      margin-right: 5px;
      border-radius: 4px;

      &:last-child {
        margin-right: 0;
      }

      &.active {
        color: #fff;
        background-color: #111511;
        border: 1px solid #16c60c;
        &:hover {
          cursor: pointer;
          color: #f9f1a5;
          background-color: darken(#16c60c, 33%);
        }
      }

      &.battle {
        background-color: #151111;
        border: 1px solid #e88080;
      }

      &.harvest {
        background-color: #151511;
        border: 1px solid #c6c60c;
      }

      &.loot {
        background-color: #111515;
        border: 1px solid #0cc6c6;
      }

      .slot-number {
        height: 12px;
        font-size: 14px;
        line-height: 12px;
      }

      .slot-label {
        font-size: 10px;
        width: 50px;
        max-height: 16px;
        overflow: hidden;
        word-wrap: break-word;
        line-height: 8px;
        text-align: center;
      }

      .n-progress {
        --n-rail-height: 4px !important;
      }
    }
  }
}

@media screen and (max-width: 1000px) {
  .quick-slots {
    // justify-content: space-between;
    overflow-x: scroll;
  }
}
</style>
