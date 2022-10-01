<template>
  <div class="quick-slots" v-show="slots().length && state.activeTab == 'output'">
    <div v-for="slot in slots()" :key="slot.slot" :class="getSlotClass(slot)" @click="runQuickSlot(slot)">
      <div class="slot-number">[<span class="bold-yellow">{{ slot.slot }}</span>]</div>
      <div class="slot-label">{{ slot.label }}</div>
      <n-progress v-if="getSkill(slot) && getSkill(slot).timeLeft" type="line" status="success" :percentage="getSkill(slot).timeLeft / getSkill(slot).cooldownTime * 100" :show-indicator="false" />
    </div>
  </div>
</template>

<script setup>
import { NProgress } from 'naive-ui'
import { useKeyHandler } from '@/composables/key_handler'
import { useWebSocket } from '@/composables/web_socket'

import { state } from '@/composables/state'

const { onKeydown, keyState } = useKeyHandler()

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

onKeydown((ev) => {
  if (keyState.alt || keyState.ctrl) {
    return false
  }

  if (state.mode == 'input') {
    return false
  }

  let slot = slots().find(s => s.slot == ev.key)
  if (!slot) {
    return false
  }

  cmd(slot.slot)
  return true
})

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
.quick-slots {
  user-select: none;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 33px;
  margin: 0 8px 0 0px;
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
    &:last-child {
      margin-right: 0;
    }
    &.active {
      color: #fff;
      background-color: darken(#16c60c, 30%);
      border: 1px solid #16c60c;
      border-radius: 4px;
      &:hover {
        cursor: pointer;
        color: #f9f1a5;
        background-color: darken(#16c60c, 33%);
      }
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

@media screen and (max-width: 1000px) {
  .quick-slots {
    justify-content: space-between;
    overflow-x: scroll;
  }
}
</style>
