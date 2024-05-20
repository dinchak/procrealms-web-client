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
import { NIcon } from 'naive-ui'

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
