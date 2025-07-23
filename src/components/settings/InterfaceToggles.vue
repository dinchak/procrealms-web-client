<template>
  <div class="interface-toggles">
    <div class="toggles">
      <NButton size="medium"
        title="Minimap"
        :type="getOptionType('showMinimap')"
        @click="toggleOption('showMinimap')"
      >
        <NIcon size="24"><ExploreOutlined/></NIcon>
      </NButton>

      <NButton size="medium"
        title="Room Info"
        :type="getOptionType('showRoomInfo')"
        @click="toggleOption('showRoomInfo')"
      >
        <NIcon size="24"><MeetingRoomOutlined/></NIcon>
      </NButton>

      <NButton size="medium"
        title="Effects"
        :type="getOptionType('showEffects')"
        @click="toggleOption('showEffects')"
      >
        <NIcon size="24"><AlignHorizontalLeftOutlined/></NIcon>
      </NButton>

      <NButton size="medium"
        title="Quests"
        :type="getOptionType('showQuests')"
        @click="toggleOption('showQuests')"
      >
        <NIcon size="24"><AnnouncementOutlined/></NIcon>
      </NButton>
    </div>

    <!-- middle row -->
    <div class="toggles">

      <NButton size="medium"
        title="Tabs"
        :type="getOptionType('showTabs')"
        @click="toggleOption('showTabs')"
      >
        <NIcon size="24"><ChatOutlined/></NIcon>
      </NButton>

      <NButton size="medium"
        title="Quick Slots"
        :type="getOptionType('showQuickSlots')"
        @click="toggleOption('showQuickSlots')"
      >
        <NIcon size="24"><BoltOutlined/></NIcon>
      </NButton>

      <NButton size="medium"
        title="Allies"
        :type="getOptionType('showPartyStats')"
        @click="toggleOption('showPartyStats')"
      >
        <NIcon size="24"><GroupsOutlined/></NIcon>
      </NButton>

      <NButton size="medium"
        title="Command Controls"
        :type="getOptionType('textInputMobileButtons')"
        @click="toggleOption('textInputMobileButtons')"
      >
        <NIcon size="24"><SmartButtonOutlined/></NIcon>
      </NButton>

    </div>

    <!-- bottom row -->
    <div class="toggles">
      <NButton size="medium"
        title="Side Map"
        :type="getOptionType('showSideMap')"
        @click="toggleOption('showSideMap'); refreshMapSettings();"
      >
        <NIcon size="24"><MapOutlined/></NIcon>
      </NButton>

      <NButton size="medium"
        title="Side Movement"
        :type="getOptionType('showSideMovement')"
        @click="toggleOption('showSideMovement')"
      >
        <NIcon size="24"><OpenWithOutlined/></NIcon>
      </NButton>

      <NButton size="medium"
        title="Aliases"
        :type="getOptionType('showSideAliases')"
        @click="toggleOption('showSideAliases')"
      >
        <NIcon size="24"><DynamicFormOutlined/></NIcon>
      </NButton>

      <NButton size="medium"
        title="Game Modal Shortcuts"
        :type="getOptionType('showGameModalShortcuts')"
        @click="toggleOption('showGameModalShortcuts')"
      >
        <NIcon size="24"><SplitscreenOutlined/></NIcon>
      </NButton>
    </div>
  </div>

</template>
<script setup>
import { NButton, NIcon } from 'naive-ui'

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
import SplitscreenOutlined from '@vicons/material/SplitscreenOutlined'

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { useWindowHandler } from '@/composables/window_handler'

const { calcMapSize } = useHelpers()
const { send } = useWebSocket()
const { triggerResize } = useWindowHandler()

function getOptionType (option) {
  return state.options[option] ? 'success' : ''
}

function toggleOption (option) {
  state.options[option] = !state.options[option]
}

function refreshMapSettings () {
  const { width, height } = calcMapSize()

  send('mapSettings', {
    width,
    height,
    enabled: state.options.showSideMap
  })

  triggerResize()
}

</script>
<style lang="less">
.interface-toggles {
  .toggles {
    display: flex;
    flex-direction: row;
    margin-bottom: 5px;
    justify-content: space-between;
    .n-button {
      margin-right: 7px;
      border-radius: 0;
      padding: 0;
      width: 40px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>