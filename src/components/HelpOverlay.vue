<template>
  <n-modal
    v-model:show="state.showHelp"
  >
    <n-card
      style="width: 600px"
      title="Help"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >

      <n-carousel show-arrow :show-dots=false>
        <div class="slide">
          <div class="movement">
            <div class="row">
              <n-icon class="direction active"><NorthWestOutlined></NorthWestOutlined></n-icon>
              <n-icon class="direction active"><NorthOutlined></NorthOutlined></n-icon>
              <n-icon class="direction active"><NorthEastOutlined></NorthEastOutlined></n-icon>
            </div>
            <div class="row">
              <n-icon class="direction active"><WestOutlined></WestOutlined></n-icon>
              <n-icon class="direction active"><MeetingRoomOutlined></MeetingRoomOutlined></n-icon>
              <n-icon class="direction active"><EastOutlined></EastOutlined></n-icon>
            </div>
            <div class="row">
              <n-icon class="direction active"><SouthWestOutlined></SouthWestOutlined></n-icon>
              <n-icon class="direction active"><SouthOutlined></SouthOutlined></n-icon>
              <n-icon class="direction active"><SouthEastOutlined></SouthEastOutlined></n-icon>
            </div>
          </div>

          <div class="caption">
            Move around the world by tapping or clicking the arrow buttons. The door button in the middle is used to enter places such as buildings, dungeons, or portals.
          </div>
        </div>

        <div class="slide">
          <div class="movement">
            <div class="row">
              <div class="direction active">Q</div>
              <div class="direction active bold-yellow">W</div>
              <div class="direction active">E</div>
            </div>
            <div class="row">
              <div class="direction active bold-yellow">A</div>
              <div class="direction active">X</div>
              <div class="direction active bold-yellow">D</div>
            </div>
            <div class="row">
              <div class="direction active">Z</div>
              <div class="direction active bold-yellow">S</div>
              <div class="direction active">C</div>
            </div>
          </div>

          <div class="caption">
            The WASD keys can also be used for movement. QEZC can be used to move diagonally. X can be used to enter.
          </div>
        </div>

        <div class="slide">
          <div class="movement">
            <div class="row">
              <div class="direction active">7</div>
              <div class="direction active">8</div>
              <div class="direction active">9</div>
            </div>
            <div class="row">
              <div class="direction active">4</div>
              <div class="direction active">5</div>
              <div class="direction active">6</div>
            </div>
            <div class="row">
              <div class="direction active">1</div>
              <div class="direction active">2</div>
              <div class="direction active">3</div>
            </div>
          </div>
          <div class="caption">
            You can also use the Num Pad to move around. Make sure Num Lock is turned off. This is also the same as using the arrow keys.
          </div>
        </div>
      </n-carousel>

    </n-card>

  </n-modal>
</template>

<script setup>
import { NModal, NCard, NIcon, NCarousel } from 'naive-ui'

import { state } from '@/composables/state'

import NorthOutlined from '@vicons/material/NorthOutlined'
import SouthOutlined from '@vicons/material/SouthOutlined'
import EastOutlined from '@vicons/material/EastOutlined'
import WestOutlined from '@vicons/material/WestOutlined'
import MeetingRoomOutlined from '@vicons/material/MeetingRoomOutlined'
import NorthEastOutlined from '@vicons/material/NorthEastOutlined'
import NorthWestOutlined from '@vicons/material/NorthWestOutlined'
import SouthEastOutlined from '@vicons/material/SouthEastOutlined'
import SouthWestOutlined from '@vicons/material/SouthWestOutlined'

</script>

<style lang="less">
  .slide {
    display: flex;
    flex-direction: row;
    .caption {
      margin: 0 20px;
    }
  }

</style>