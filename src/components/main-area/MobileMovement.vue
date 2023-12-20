<template>
  <div class="mobile-movement">
    <div class="row">
      <n-icon :class="getMovementClass('northwest')" @click="move('northwest')"><NorthWestOutlined></NorthWestOutlined></n-icon>
      <n-icon :class="getMovementClass('north')" @click="move('north')"><NorthOutlined></NorthOutlined></n-icon>
      <n-icon :class="getMovementClass('northeast')" @click="move('northeast')"><NorthEastOutlined></NorthEastOutlined></n-icon>
    </div>
    <div class="row">
      <n-icon :class="getMovementClass('west')" @click="move('west')"><WestOutlined></WestOutlined></n-icon>
      <n-icon :class="getEnterClass()" @click="enter()"><MeetingRoomOutlined></MeetingRoomOutlined></n-icon>
      <n-icon :class="getMovementClass('east')" @click="move('east')"><EastOutlined></EastOutlined></n-icon>
    </div>
    <div class="row">
      <n-icon :class="getMovementClass('southwest')" @click="move('southwest')"><SouthWestOutlined></SouthWestOutlined></n-icon>
      <n-icon :class="getMovementClass('south')" @click="move('south')"><SouthOutlined></SouthOutlined></n-icon>
      <n-icon :class="getMovementClass('southeast')" @click="move('southeast')"><SouthEastOutlined></SouthEastOutlined></n-icon>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

import NorthOutlined from '@vicons/material/NorthOutlined'
import SouthOutlined from '@vicons/material/SouthOutlined'
import EastOutlined from '@vicons/material/EastOutlined'
import WestOutlined from '@vicons/material/WestOutlined'
import MeetingRoomOutlined from '@vicons/material/MeetingRoomOutlined'
import NorthEastOutlined from '@vicons/material/NorthEastOutlined'
import NorthWestOutlined from '@vicons/material/NorthWestOutlined'
import SouthEastOutlined from '@vicons/material/SouthEastOutlined'
import SouthWestOutlined from '@vicons/material/SouthWestOutlined'

import { NIcon } from 'naive-ui'

import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/composables/state'

const { cmd } = useWebSocket()

let moveTimeout = null
let selectedDirection = ref('enter')

const directionMap = {
  0: 'enter',
  1: 'north',
  2: 'northwest',
  3: 'west',
  4: 'southwest',
  5: 'south',
  6: 'southeast',
  7: 'east',
  8: 'northeast'
}

function move (dir) {
  if (moveTimeout) {
    return
  }

  let { room } = state.gameState
  if (!room || !room.exits.includes(dir)) {
    return
  }
  cmd(dir)

  moveTimeout = setTimeout(() => {
    moveTimeout = null
  }, 100)
}

function enter () {
  if (moveTimeout) {
    return
  }

  let { room } = state.gameState
  if (!room || !room.canEnter) {
    return
  }
  cmd('enter')

  moveTimeout = setTimeout(() => {
    moveTimeout = null
  }, 100)
}

function getMovementClass (dir) {
  let { room } = state.gameState
  if (!room) {
    return 'direction'
  }

  if (room.exits && room.exits.includes(dir)) {
    if (selectedDirection.value == dir) {
      return 'direction selected'
    }
    return 'direction active'
  } else {
    return 'direction'
  }
}

function getEnterClass () {
  let { room } = state.gameState
  if (!room) {
    return 'direction'
  }

  if (room.canEnter) {
    if (selectedDirection.value == 'enter') {
      return 'direction selected'
    }
    return 'direction active'
  } else {
    return 'direction'
  }
}

function selectMovementDirection (degree) {
  if (state.gameState.battle.active) {
    return
  }

  if (degree == false) {
    selectedDirection.value = directionMap[0]
    return
  }

  let offsetDegree = degree + (45 / 2)
  if (offsetDegree > 360) {
    offsetDegree -= 360
  }

  let itemNumber = Math.ceil(offsetDegree / 360 * 8)
  selectedDirection.value = directionMap[itemNumber]
}

function moveInSelectedDirection () {
  if (state.gameState.battle.active) {
    return
  }

  if (selectedDirection.value == 'enter') {
    enter()
  } else {
    move(selectedDirection.value)
  }
}

onMounted(() => {
  state.inputEmitter.on('selectMovementDirection', selectMovementDirection)
  state.inputEmitter.on('moveInSelectedDirection', moveInSelectedDirection)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('selectMovementDirection', selectMovementDirection)
  state.inputEmitter.off('moveInSelectedDirection', moveInSelectedDirection)
})

</script>

<style lang="less">
.mobile-movement {
  display: flex;
  flex-direction: column;
  user-select: none;
  .row {
    display: flex;
    flex-direction: row;
    .direction {
      opacity: 0;
      font-size: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      background-color: #333;
      transition: all 0.3s;
      margin-bottom: 2px;
      margin-right: 2px;
      &.active {
        opacity: 0.3;
        background-color: #222;
        &:hover {
          cursor: pointer;
          opacity: 1;
          background-color: darken(#16c60c, 30%);
        }
      }

      &.selected {
        opacity: 1;
        background-color: darken(#16c60c, 30%);
      }
    }
  }
}
</style>
