<template>
  <div class="settings-container">

    <!-- <h3>Bottom Area</h3> -->
    <div class="settings">
      <NButton size="small"
        title="Quick Slots"
        :type="getOptionType('showQuickSlots')"
        @click="toggleOption('showQuickSlots')"
      >
        <NIcon><BoltOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        title="Lower Minimap"
        :type="getOptionType('showMinimap')"
        @click="toggleOption('showMinimap')"
      >
        <NIcon><ExploreOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        title="Lower Movement Controls"
        :type="getOptionType('showMovementControls')"
        @click="toggleOption('showMovementControls')"
      >
        <NIcon><OpenWithOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        title="Command Controls"
        :type="getOptionType('textInputMobileButtons')"
        @click="toggleOption('textInputMobileButtons')"
      >
        <NIcon><SmartButtonOutlined/></NIcon>
      </NButton>
    </div>

    <div class="settings">
      <NButton size="small"
        title="Room Info"
        :type="getOptionType('showRoomInfo')"
        @click="toggleOption('showRoomInfo')"
      >
        <NIcon><MeetingRoomOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        title="Allies"
        :type="getOptionType('showAllies')"
        @click="toggleOption('showAllies')"
      >
        <NIcon><GroupsOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        title="Affects"
        :type="getOptionType('showAffects')"
        @click="toggleOption('showAffects')"
      >
        <NIcon><AlignHorizontalLeftOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        title="Quests"
        :type="getOptionType('showQuests')"
        @click="toggleOption('showQuests')"
      >
        <NIcon><AnnouncementOutlined/></NIcon>
      </NButton>
    </div>

    <!-- <h3>Side Area</h3> -->
    <div class="settings">
      <NButton size="small"
        title="Tabs"
        :type="getOptionType('showTabs')"
        @click="toggleOption('showTabs')"
      >
        <NIcon><ChatOutlined/></NIcon>
      </NButton>
      
      <NButton size="small"
        title="Side Map"
        :type="getOptionType('showSideMap')"
        @click="toggleOption('showSideMap'); refreshMapSettings();"
      >
        <NIcon><MapOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        title="Side Movement"
        :type="getOptionType('showSideMovement')"
        @click="toggleOption('showSideMovement')"
      >
        <NIcon><OpenWithOutlined/></NIcon>
      </NButton>

      <NButton size="small"
        title="Aliases"
        :type="getOptionType('showSideAliases')"
        @click="toggleOption('showSideAliases')"
      >
        <NIcon><DynamicFormOutlined/></NIcon>
      </NButton>

    </div>


    <h3 v-if="state.options.showSideMap">Map Size</h3>

    <div v-if="state.options.showSideMap" class="settings">
      <NSlider class="slider" v-model:value="state.options.sideMapWidth" @update:value="refreshMapSettings" :step="2">
        <template #thumb>
          <NIconWrapper :size="24" :border-radius="12">
            <NIcon :size="18" :component="SwapHorizOutlined" />
          </NIconWrapper>
        </template>
      </NSlider>
    </div>

    <div v-if="state.options.showSideMap" class="settings">
      <NSlider class="slider" v-model:value="state.options.sideMapHeight" @update:value="refreshMapSettings" :step="2">
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
import { useWebSocket } from '@/composables/web_socket'

import AlignHorizontalLeftOutlined from '@vicons/material/AlignHorizontalLeftOutlined'
import AnnouncementOutlined from '@vicons/material/AnnouncementOutlined'
import BoltOutlined from '@vicons/material/BoltOutlined'
import ChatOutlined from '@vicons/material/ChatOutlined'
import DynamicFormOutlined from '@vicons/material/DynamicFormOutlined'
import ExploreOutlined from '@vicons/material/ExploreOutlined'
import GroupsOutlined from '@vicons/material/GroupsOutlined'
import MapOutlined from '@vicons/material/MapOutlined'
import MeetingRoomOutlined from '@vicons/material/MeetingRoomOutlined'
import OpenWithOutlined from '@vicons/material/OpenWithOutlined'
import SmartButtonOutlined from '@vicons/material/SmartButtonOutlined'
import SwapHorizOutlined from '@vicons/material/SwapHorizOutlined'
import SwapVertOutlined from '@vicons/material/SwapVertOutlined'

const { send } = useWebSocket()

function getOptionType (option) {
  return state.options[option] ? 'success' : ''
}

function toggleOption (option) {
  state.options[option] = !state.options[option]
}

function calcMapSize () {
  let width = Math.round(5 + (state.options.sideMapWidth / 2))
  let height = Math.round(5 + (state.options.sideMapHeight / 2))
  return { width, height }
}

function refreshMapSettings () {
  const { width, height } = calcMapSize()

  send('mapSettings', {
    width,
    height,
    enabled: state.options.showSideMap
  })
}
</script>

<style scoped lang="less">
.settings-container {
  display: flex;
  flex-direction: column;
  padding-top: 5px;
  background-color: rgba(0, 0, 0, 0.9);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.9);

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
      margin-right: 5px;
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