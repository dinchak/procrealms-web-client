<template>
  <div class="movement">
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
import {
  NorthOutlined, SouthOutlined, EastOutlined, WestOutlined,
  MeetingRoomOutlined,
  NorthEastOutlined, NorthWestOutlined, SouthEastOutlined, SouthWestOutlined
} from '@vicons/material'

import { NIcon } from 'naive-ui'

import { useKeyHandler } from '@/composables/key_handler'
import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/composables/state'

const { onKeydown } = useKeyHandler()
const { cmd } = useWebSocket()

let moveTimeout = null

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

  if (room.exits.includes(dir)) {
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
    return 'direction active'
  } else {
    return 'direction'
  }
}

onKeydown((ev) => {
  if (ev.key == 'Home') {
    move('northwest')
    ev.preventDefault()
  } else if (ev.key == 'ArrowUp') {
    move('north')
    ev.preventDefault()
  } else if (ev.key == 'PageUp') {
    move('northeast')
    ev.preventDefault()
  } else if (ev.key == 'ArrowLeft') {
    move('west')
    ev.preventDefault()
  } else if (ev.key == 'Clear') {
    enter()
    ev.preventDefault()
  } else if (ev.key == 'ArrowRight') {
    move('east')
    ev.preventDefault()
  } else if (ev.key == 'End') {
    move('southwest')
    ev.preventDefault()
  } else if (ev.key == 'ArrowDown') {
    move('south')
    ev.preventDefault()
  } else if (ev.key == 'PageDown') {
    move('southeast')
    ev.preventDefault()
  }
})

</script>

<style lang="less">
.movement {
  display: flex;
  flex-direction: column;
  user-select: none;
  .row {
    display: flex;
    flex-direction: row;
    .direction {
      font-size: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      background-color: #333;
      border: 1px solid #222;
      transition: all 0.3s;
      border-collapse: collapse;
      &.active {
        background-color: darken(#16c60c, 30%);
        border: 1px solid #16c60c;
        &:hover {
          cursor: pointer;
          background-color: darken(#16c60c, 33%);
        }
      }
    }
  }
}
</style>
