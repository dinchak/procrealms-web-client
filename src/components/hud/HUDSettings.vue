<template>
  <div class="settings-container">

    <h3>Bottom Area</h3>
    <div class="settings">
      <NButton size="small"
        :type="getOptionType('showQuickSlots')"
        @click="toggleOption('showQuickSlots')"
      >
        <NIcon><BoltOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        :type="getOptionType('showOverlayMinimap')"
        @click="toggleOption('showOverlayMinimap')"
      >
        <NIcon><ExploreOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        :type="getOptionType('hudMovementControls')"
        @click="toggleOption('hudMovementControls')"
      >
        <NIcon><OpenWithOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        :type="getOptionType('hudCommandControls')"
        @click="toggleOption('hudCommandControls')"
      >
        <NIcon><SmartButtonOutlined/></NIcon>
      </NButton>
    </div>

    <div class="settings">
      <NButton size="small"
        :type="getOptionType('showRoomInfo')"
        @click="toggleOption('showRoomInfo')"
      >
        <NIcon><MeetingRoomOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        :type="getOptionType('showAllies')"
        @click="toggleOption('showAllies')"
      >
        <NIcon><GroupsOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        :type="getOptionType('showAffects')"
        @click="toggleOption('showAffects')"
      >
        <NIcon><AlignHorizontalLeftOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        :type="getOptionType('showQuests')"
        @click="toggleOption('showQuests')"
      >
        <NIcon><AnnouncementOutlined/></NIcon>
      </NButton>
    </div>

    <h3>Side Area</h3>
    <div class="settings">
      <NButton size="small"
        :type="getOptionType('showSideMap')"
        @click="toggleOption('showSideMap')"
      >
        <NIcon><MapOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        :type="getOptionType('showSideMovement')"
        @click="toggleOption('showSideMovement')"
      >
        <NIcon><OpenWithOutlined/></NIcon>
      </NButton>
    </div>


    <h3>Map Size</h3>

    <div class="settings">
      <NSlider class="slider" v-model:value="state.options.mapWidth" :step="2">
        <template #thumb>
          <NIconWrapper :size="24" :border-radius="12">
            <NIcon :size="18" :component="SwapHorizOutlined" />
          </NIconWrapper>
        </template>
      </NSlider>
    </div>

    <div class="settings">
      <NSlider class="slider" v-model:value="state.options.mapHeight" :step="2">
        <template #thumb>
          <NIconWrapper :size="24" :border-radius="12">
            <NIcon :size="18" :component="SwapVertOutlined" />
          </NIconWrapper>
        </template>
      </NSlider>
    </div>

  </div>
</template>
<script setup>
import { NButton, NIconWrapper, NIcon, NSlider } from 'naive-ui'

import { state } from '@/composables/state'

import AlignHorizontalLeftOutlined from '@vicons/material/AlignHorizontalLeftOutlined'
import AnnouncementOutlined from '@vicons/material/AnnouncementOutlined'
import BoltOutlined from '@vicons/material/BoltOutlined'
import ExploreOutlined from '@vicons/material/ExploreOutlined'
import GroupsOutlined from '@vicons/material/GroupsOutlined'
import MapOutlined from '@vicons/material/MapOutlined'
import MeetingRoomOutlined from '@vicons/material/MeetingRoomOutlined'
import OpenWithOutlined from '@vicons/material/OpenWithOutlined'
import SmartButtonOutlined from '@vicons/material/SmartButtonOutlined'
import SwapHorizOutlined from '@vicons/material/SwapHorizOutlined'
import SwapVertOutlined from '@vicons/material/SwapVertOutlined'

function getOptionType (option) {
  return state.options[option] ? 'success' : ''
}

function toggleOption (option) {
  state.options[option] = !state.options[option]
}
</script>

<style scoped lang="less">
.settings-container {
  display: flex;
  flex-direction: column;
  padding-top: 5px;
  background-color: rgba(0, 0, 0, 0.75);

  h3 {
    padding: 0;
    margin: 5px;
    font-weight: normal;
    font-size: 16px;
    color: #fff;
  }
  .settings {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 5px;
    margin-bottom: 5px;
    .n-button {
      margin-right: 0px;
      &:last-child {
        margin-right: 0;
      }
    }

    .slider {
      margin-top: 10px;
      margin-bottom: 3px;
    }
  }
}
</style>