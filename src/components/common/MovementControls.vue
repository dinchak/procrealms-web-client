<template>
  <div class="mobile-movement">
    <div class="row">
      <NIcon :class="getMovementClass('northwest')" @click="move('northwest')"><NorthWestOutlined></NorthWestOutlined></NIcon>
      <NIcon :class="getMovementClass('north')" @click="move('north')"><NorthOutlined></NorthOutlined></NIcon>
      <NIcon :class="getMovementClass('northeast')" @click="move('northeast')"><NorthEastOutlined></NorthEastOutlined></NIcon>
    </div>
    <div class="row">
      <NIcon :class="getMovementClass('west')" @click="move('west')"><WestOutlined></WestOutlined></NIcon>
      <NIcon :class="getEnterClass()" @click="enter()"><MeetingRoomOutlined></MeetingRoomOutlined></NIcon>
      <NIcon :class="getMovementClass('east')" @click="move('east')"><EastOutlined></EastOutlined></NIcon>
    </div>
    <div class="row">
      <NIcon :class="getMovementClass('southwest')" @click="move('southwest')"><SouthWestOutlined></SouthWestOutlined></NIcon>
      <NIcon :class="getMovementClass('south')" @click="move('south')"><SouthOutlined></SouthOutlined></NIcon>
      <NIcon :class="getMovementClass('southeast')" @click="move('southeast')"><SouthEastOutlined></SouthEastOutlined></NIcon>
    </div>
  </div>
</template>

<script setup>
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
import { state } from '@/static/state'

const { move, enter } = useWebSocket()

function getMovementClass (dir) {
  let { room } = state.gameState
  if (!room) {
    return 'direction'
  }

  if (room.exits && room.exits.includes(dir)) {
    if (state.selectedDirection == dir) {
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
    if (state.selectedDirection == 'enter') {
      return 'direction selected'
    }
    return 'direction active'
  } else {
    return 'direction'
  }
}

</script>

<style lang="less">
.mobile-movement {
  display: flex;
  flex-direction: column;
  user-select: none;
  .row {
    display: flex;
    flex-direction: row;
    margin-bottom: 5px;
    .direction {
      opacity: 0;
      font-size: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 41px;
      height: 41px;
      background-color: #333;
      transition: all 0.3s;
      margin-left: 5px;
      &.active {
        opacity: 0.3;
        background-color: #222;
        &:hover {
          cursor: pointer;
          opacity: 1;
          background-color: #63e2b7;
          color: #000;
        }
      }

      &.selected {
        opacity: 1;
        background-color: #63e2b7;
        color: #000;
      }
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
