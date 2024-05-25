<template>
  <n-el style="background-color: var(--body-color)" v-if="state.token && state.connected && !state.disconnected" class="game" :class="{
     'swap-mobile-menu': state.options.swapMobileMenuSide
  }">
    <div class="game-layout">
      <MobileMenu />
      <main class="vertical-split">
        <div class="content-split">
          <div class="line-area">
            <LineOutput />
          </div>
          <div class="side-area">
            <ButtonControls />
            <div class="row side-top">
              <SideMap v-if="!state.gameState.battle.active" />
              <GameModalShortcuts v-if="state.options.showGameModalShortcuts" />
            </div>
            <div class="row side-bottom" v-if="state.options.showSideAliases || state.options.showSideMovement">
              <SideAliases />
              <SideMovement v-if="!state.gameState.battle.active" />
            </div>
          </div>
        </div>
        <OverworldHUD v-if="!state.gameState.battle.active" />
        <QuickSlots v-if="state.options.showQuickSlots" />
        <QuickSlotHandlers />
        <PartyStats v-if="state.options.showPartyStats && !state.gameState.battle.active" />
        <KeyboardInput :focus-mode="'input'" :active-modes="['hotkey', 'input']" />
      </main>
    </div>
    <LogoutModal/>
    <HelpModal/>
    <TriggersModal/>
    <GameModal/>
    <MercModal/>
    <RadialOverlay/>
  </n-el>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { NEl, NLayout } from 'naive-ui'

import ButtonControls from '@/components/main-area/ButtonControls.vue'
import GameModal from '@/components/modals/GameModal.vue'
import GameModalShortcuts from '@/components/main-area/GameModalShortcuts.vue'
import HelpModal from '@/components/modals/HelpModal.vue'
import SideAliases from '@/components/main-area/SideAliases.vue'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'
import LineOutput from '@/components/main-area/LineOutput.vue'
import LogoutModal from '@/components/modals/LogoutModal.vue'
import MercModal from '@/components/modals/MercModal.vue'
import PartyStats from '@/components/hud/PartyStats.vue'
import QuickSlots from '@/components/hud/QuickSlots.vue'
import QuickSlotHandlers from '@/components/main-area/QuickSlotHandlers.vue'
import OverworldHUD from '@/components/main-area/OverworldHUD.vue'
import RadialOverlay from '@/components/modals/RadialOverlay.vue'
import SideMap from '@/components/main-area/SideMap.vue'
import MobileMenu from '@/components/mobile-menu/MobileMenu.vue'
import SideMovement from '@/components/main-area/SideMovement.vue'
import TriggersModal from '@/components/modals/TriggersModal.vue'

import { state, setMode } from '@/static/state'
import { USER_GESTURE_EVENTS } from '@/static/constants'

import { useHelpers } from '@/composables/helpers'
import { useLocalStorageHandler } from '@/composables/local_storage_handler'
import { useWebSocket } from '@/composables/web_socket'
import { useWindowHandler } from '@/composables/window_handler'

const { selectMovementDirection, moveInSelectedDirection } = useHelpers()
const { triggerResize } = useWindowHandler()
const { saveOptions } = useLocalStorageHandler()

const { cmd } = useWebSocket()

let moveTimeout = null

function openGameModal () {
  setMode('modal')
  state.modals.gameModal = true
}

function openScore () {
  setMode('modal')
  state.modals.gameModal = true
  state.gamepadTab = 'score'
}

function openInventory () {
  setMode('modal')
  state.modals.gameModal = true
  state.gamepadTab = 'inventory'
}

function openQuests () {
  setMode('modal')
  state.modals.gameModal = true
  state.gamepadTab = 'quests'
}

function openHelpModal () {
  setMode('modal')
  state.modals.helpModal = true
}

function onWindowFocusBlur () {
  state.metaKeyState.alt = state.metaKeyState.ctrl = state.metaKeyState.shift = false
}

function onFullscreenChange () {
  if (document.fullscreenElement) {
    state.isFullscreen = true
  } else {
    state.isFullscreen = false
  }
  triggerResize()
}

function startAudioContext (ev) {
  if (state.music.audioContext) {
    return
  }

  state.music.audioContext = new AudioContext()

  state.music.audioAnalyzer = state.music.audioContext.createAnalyser()
  state.music.audioAnalyzer.connect(state.music.audioContext.destination)

  state.music.gainNode = state.music.audioContext.createGain()
  state.music.gainNode.connect(state.music.audioAnalyzer)
  state.music.gainNode.gain.value = state.options.volume / 100.0

  for (let eventName of USER_GESTURE_EVENTS) {
    window.removeEventListener(eventName, startAudioContext)
  }
}

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

let watchers = []
onMounted(() => {
  state.inputEmitter.on('openGameModal', openGameModal)
  state.inputEmitter.on('openHelpModal', openHelpModal)
  state.inputEmitter.on('openScore', openScore)
  state.inputEmitter.on('openQuests', openQuests)
  state.inputEmitter.on('openInventory', openInventory)
  state.inputEmitter.on('selectMovementDirection', selectMovementDirection)
  state.inputEmitter.on('moveInSelectedDirection', moveInSelectedDirection)

  state.inputEmitter.on('moveNorth', moveNorth)
  state.inputEmitter.on('moveSouth', moveSouth)
  state.inputEmitter.on('moveEast', moveEast)
  state.inputEmitter.on('moveWest', moveWest)
  state.inputEmitter.on('moveNorthEast', moveNorthEast)
  state.inputEmitter.on('moveNorthWest', moveNorthWest)
  state.inputEmitter.on('moveSouthEast', moveSouthEast)
  state.inputEmitter.on('moveSouthWest', moveSouthWest)
  state.inputEmitter.on('enter', enter)

  window.addEventListener('resize', triggerResize)
  window.addEventListener('focus', onWindowFocusBlur)
  window.addEventListener('blur', onWindowFocusBlur)

  for (let eventName of USER_GESTURE_EVENTS) {
    window.addEventListener(eventName, startAudioContext)
  }

  document.addEventListener('fullscreenchange', onFullscreenChange)

  watchers.push(watch(state.options, saveOptions))

  watchers.push(watch(() => state.options.textInputAlwaysFocused, () => {
    if (state.options.textInputAlwaysFocused) {
      state.inputEmitter.emit('focusTextInput')
    }
  }))
})

onBeforeUnmount(() => {
  state.inputEmitter.off('openGameModal', openGameModal)
  state.inputEmitter.off('openInventory', openInventory)
  state.inputEmitter.off('openScore', openScore)
  state.inputEmitter.off('openHelpModal', openHelpModal)
  state.inputEmitter.off('openQuests', openQuests)
  state.inputEmitter.off('selectMovementDirection', selectMovementDirection)
  state.inputEmitter.off('moveInSelectedDirection', moveInSelectedDirection)

  state.inputEmitter.off('moveNorth', moveNorth)
  state.inputEmitter.off('moveSouth', moveSouth)
  state.inputEmitter.off('moveEast', moveEast)
  state.inputEmitter.off('moveWest', moveWest)
  state.inputEmitter.off('moveNorthEast', moveNorthEast)
  state.inputEmitter.off('moveNorthWest', moveNorthWest)
  state.inputEmitter.off('moveSouthEast', moveSouthEast)
  state.inputEmitter.off('moveSouthWest', moveSouthWest)
  state.inputEmitter.off('enter', enter)

  for (let eventName of USER_GESTURE_EVENTS) {
    window.removeEventListener(eventName, startAudioContext)
  }

  state.music.audioContext.close()

  window.removeEventListener('resize', triggerResize)
  window.removeEventListener('focus', onWindowFocusBlur)
  window.removeEventListener('blur', onWindowFocusBlur)

  document.removeEventListener('fullscreenchange', onFullscreenChange)

  watchers.forEach(w => w())
})
</script>

<style scoped lang="less">
.game {
  height: 100%;
  width: 100%;
  position: relative;

  &.swap-mobile-menu {
    .game-layout {
      flex-direction: row-reverse;
    }
  }
}

.game-layout {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
}

.vertical-split {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-basis: max-content;
  align-items: stretch;
  padding-bottom: 5px;
  width: 0;

  > * {
    flex-grow: 0;
    padding: 5px 10px;
  }
}

.content-split {
  flex-grow: 1 !important;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
}

.line-area {
  flex-grow: 1;
  flex-basis: max-content;
}
.side-area {
  flex-basis: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  .row {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 5px;
  }

  .side-top {
    &:last-child {
      flex-grow: 1;
    }
  }
  .side-bottom {
    flex-grow: 1;
    height: 0;
  }
}
</style>
