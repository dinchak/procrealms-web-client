<template>
  <LogoutModal></LogoutModal>

  <HelpOverlay></HelpOverlay>

  <n-layout has-sider 
    v-if="state.token && state.connected" class="game" 
    :sider-placement="state.options.swapControls ? 'right' : 'left'">
    <SideMenu v-if="!state.options.swapControls"></SideMenu>
    <n-layout>
      <ModalCard></ModalCard>
      <MapModal></MapModal>
      <MercModal></MercModal>
      <div class="content-area">
        <LineOutput></LineOutput>
      </div>
      <KeyboardInput></KeyboardInput>
    </n-layout>
    <SideMenu v-if="state.options.swapControls"></SideMenu>
  </n-layout>
</template>

<script setup>
import { state } from '@/composables/state'
import { NLayout } from 'naive-ui'

import LineOutput from '@/components/main-area/LineOutput.vue'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'
import LogoutModal from '@/components/modals/LogoutModal.vue'
import HelpOverlay from '@/components/HelpOverlay.vue'
import ModalCard from '@/components/modals/ModalCard'
import MapModal from '@/components/modals/MapModal'
import MercModal from '@/components/modals/MercModal'
import SideMenu from '@/components/side-menu/SideMenu'

try {
  const options = JSON.parse(localStorage.getItem('options'))
  if (options !== null) {
    state.options = Object.assign(state.options, options)
  }
} catch (err) {
  console.log(err.stack)
  localStorage.setItem('options', '')
}

</script>

<style lang="less">
.game {
  background-color: #181818;
  height: 100vh;
  .stats-area {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    .bottom-area {
      border-top: 1px solid rgba(255, 255, 255, 0.09);
    }
    .map-area {
      align-items: center;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      width: 100%;

      .map-icon {
        font-size: 30px;
        text-align: left;
        cursor: pointer;
      }
    }
  }

  .content-area {
    // height: ~"calc(100vh - 45px)";
    flex-basis: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
    min-height: 0;
  }
}

.n-layout {
  z-index: 1;
}

.n-layout-sider {
  z-index: 2;
}

</style>
