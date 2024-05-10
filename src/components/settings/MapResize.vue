<template>
  <div class="map-resize-container">
    <h3 v-if="state.options.showSideMap">Map Size</h3>

    <div v-if="state.options.showSideMap" class="map-resize-row">
      <NSlider class="slider" v-model:value="state.options.sideMapWidth" @update:value="refreshMapSettings" :step="1" :min="1" :max="25">
        <template #thumb>
          <NIconWrapper :size="24" :border-radius="12">
            <NIcon :size="18" :component="SwapHorizOutlined" />
          </NIconWrapper>
        </template>
      </NSlider>
    </div>

    <div v-if="state.options.showSideMap" class="map-resize-row">
      <NSlider class="slider" v-model:value="state.options.sideMapHeight" @update:value="refreshMapSettings" :step="1" :min="1" :max="25">
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
import { NIconWrapper, NIcon, NSlider } from 'naive-ui'

import SwapHorizOutlined from '@vicons/material/SwapHorizOutlined'
import SwapVertOutlined from '@vicons/material/SwapVertOutlined'

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { useWindowHandler } from '@/composables/window_handler'

const { calcMapSize } = useHelpers()
const { triggerResize } = useWindowHandler()
const { send } = useWebSocket()

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

<style lang="less" scoped>
.map-resize-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;

  h3 {
    padding: 0;
    margin-top: 5px;
    margin-bottom: 16px;
    font-weight: normal;
    font-size: 16px;
    color: #fff;
  }

  .map-resize-row {
    display: flex;
    flex-direction: row;
    margin-bottom: 5px;
    justify-content: space-between;
    .slider {
      margin-top: 10px;
      margin-bottom: 3px;
      width: 150px;
    }
  }
}
</style>