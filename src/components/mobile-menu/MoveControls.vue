<template>
  <div class="movement" v-if="state.options.showMobileMenuMap">
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
import { onMounted, onBeforeUnmount } from 'vue'
import { NIcon } from 'naive-ui'

import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/static/state'

import NorthOutlined from '@vicons/material/NorthOutlined'
import SouthOutlined from '@vicons/material/SouthOutlined'
import EastOutlined from '@vicons/material/EastOutlined'
import WestOutlined from '@vicons/material/WestOutlined'
import MeetingRoomOutlined from '@vicons/material/MeetingRoomOutlined'
import NorthEastOutlined from '@vicons/material/NorthEastOutlined'
import NorthWestOutlined from '@vicons/material/NorthWestOutlined'
import SouthEastOutlined from '@vicons/material/SouthEastOutlined'
import SouthWestOutlined from '@vicons/material/SouthWestOutlined'

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

  if (room.exits && room.exits.includes(dir)) {
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

function moveNorth () {
  move('north')
}

function moveSouth () {
  move('south')
}

function moveEast () {
  move('east')
}

function moveWest () {
  move('west')
}

function moveNorthEast () {
  move('northeast')
}

function moveNorthWest () {
  move('northwest')
}

function moveSouthEast () {
  move('southeast')
}

function moveSouthWest () {
  move('southwest')
}

onMounted(() => {
  state.inputEmitter.on('moveNorth', moveNorth)
  state.inputEmitter.on('moveSouth', moveSouth)
  state.inputEmitter.on('moveEast', moveEast)
  state.inputEmitter.on('moveWest', moveWest)
  state.inputEmitter.on('moveNorthEast', moveNorthEast)
  state.inputEmitter.on('moveNorthWest', moveNorthWest)
  state.inputEmitter.on('moveSouthEast', moveSouthEast)
  state.inputEmitter.on('moveSouthWest', moveSouthWest)
  state.inputEmitter.on('enter', enter)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('moveNorth', moveNorth)
  state.inputEmitter.off('moveSouth', moveSouth)
  state.inputEmitter.off('moveEast', moveEast)
  state.inputEmitter.off('moveWest', moveWest)
  state.inputEmitter.off('moveNorthEast', moveNorthEast)
  state.inputEmitter.off('moveNorthWest', moveNorthWest)
  state.inputEmitter.off('moveSouthEast', moveSouthEast)
  state.inputEmitter.off('moveSouthWest', moveSouthWest)
  state.inputEmitter.off('enter', enter)
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
      font-size: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 45px;
      height: 45px;
      background-color: #333;
      border: 1px solid #222;
      transition: all 0.3s;
      border-collapse: collapse;
      margin-bottom: -1px;
      margin-left: -1px;
      &.active {
        background-color: darken(#16c60c, 30%);
        border: 1px solid darken(#16c60c, 25%);
        @media (hover: hover) {
          &:hover {
            cursor: pointer;
            background-color: darken(#16c60c, 33%);
          }
        }
      }
    }
  }
}
</style>
