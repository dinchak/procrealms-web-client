<template>
  <div class="minimap-container">
    <div class="minimap-wrapper">
      <div class="minimap-overlay">
        <div
          v-for="cell in overlayCells"
          :key="cell.direction"
          class="movement-overlay-cell"
          :class="{ selected: isSelectedDirection(cell.direction) }"
          :style="cell.style"
        >
          <NIcon v-if="showOverlayIcon(cell.direction)" class="overlay-icon">
            <component :is="cell.icon" />
          </NIcon>
        </div>
      </div>
      <div class="minimap">
      <div class="line"
        :style="{ height: state.options.fontSize }"
        v-for="(line, i) in renderMinimap()"
        :key="'line-' + i"
        v-html-safe="line"
      ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml } = useHelpers()

const overlayConfig = {
  north: { row: 3, col: 4, icon: NorthOutlined },
  northeast: { row: 3, col: 5, icon: NorthEastOutlined },
  east: { row: 4, col: 5, icon: EastOutlined },
  southeast: { row: 5, col: 5, icon: SouthEastOutlined },
  south: { row: 5, col: 4, icon: SouthOutlined },
  southwest: { row: 5, col: 3, icon: SouthWestOutlined },
  west: { row: 4, col: 3, icon: WestOutlined },
  northwest: { row: 3, col: 3, icon: NorthWestOutlined },
  enter: { row: 4, col: 4, icon: MeetingRoomOutlined },
}

const overlayCells = computed(() => {
  return Object.entries(overlayConfig).map(([direction, config]) => ({
    direction,
    icon: config.icon,
    style: {
      gridRow: `${config.row} / span 1`,
      gridColumn: `${config.col} / span 1`,
    }
  }))
})

function renderMinimap () {
  const minimap = []
  if (state.gameState.minimap) {
    for (let line of state.gameState.minimap) {
      minimap.push(ansiToHtml(line))
    }
  }

  return minimap.slice(0, 7)
}

function isSelectedDirection (direction) {
  if (direction === 'enter') {
    return state.gameState.room?.canEnter && state.selectedDirection == 'enter'
  }

  return state.gameState.room?.exits?.includes(direction) && state.selectedDirection == direction
}

function showOverlayIcon (direction) {
  return isSelectedDirection(direction)
}

</script>

<style scoped lang="less">
.minimap-container {
  display: flex;
  align-items: center;
  flex-basis: 65px;
  flex-grow: 0;

  .minimap-wrapper {
    position: relative;
    display: inline-block;

    .minimap-overlay {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-columns: repeat(7, 1ch);
      grid-template-rows: repeat(7, v-bind('state.options.fontSize'));
      pointer-events: none;
      z-index: 1;

      .movement-overlay-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        color: #000;
        opacity: 0.75;

        &.selected {
          background-color: #63e2b7;
        }
      }

      .overlay-icon {
        font-size: 0.6em;
      }
    }

    .minimap {
      position: relative;
      user-select: none;
      white-space: pre;

      .line {
        word-break: keep-all;
      }
    }
  }
}
</style>
