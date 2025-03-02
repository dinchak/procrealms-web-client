<template>
  <n-el style="background-color: var(--body-color)" v-if="state.token && state.connected && !state.disconnected"
        class="game" :class="{
     'show-mobile-menu': state.options.showMobileMenu,
     'swap-mobile-menu': state.options.swapMobileMenuSide,
     'show-modal-shortcuts': state.options.showGameModalShortcuts
  }">
    <ButtonControls/>
    <div class="game-layout">
      <MobileMenu/>
      <main class="vertical-split">
        <div class="content-split">
          <div class="line-area">
            <LineOutput/>
          </div>
          <div class="side-area" v-if="(state.options.showSideMap && !state.gameState.battle.active) || (state.options.showSideAliases || (state.options.showSideMovement && !state.gameState.battle.active))">
            <div class="row side-top" v-if="state.options.showSideMap && !state.gameState.battle.active">
              <SideMap />
            </div>
            <div class="row side-bottom" v-if="state.options.showSideAliases || (state.options.showSideMovement && !state.gameState.battle.active)">
              <SideAliases/>
              <SideMovement/>
            </div>
          </div>
        </div>
        <div class="bottom-split">
          <BottomHUD v-if="!state.gameState.battle.active"/>
          <QuickSlots v-if="state.options.showQuickSlots"/>
          <QuickSlotHandlers/>
          <PartyStats v-if="state.options.showPartyStats && !state.gameState.battle.active"/>
          <KeyboardInput :focus-mode="'input'" :active-modes="['hotkey', 'input']"/>
        </div>
      </main>
    </div>
    <DebugModal/>
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
import { NEl } from 'naive-ui'

import DebugModal from '@/components/modals/DebugModal.vue'
import GameModal from '@/components/modals/GameModal.vue'
import HelpModal from '@/components/modals/HelpModal.vue'
import LogoutModal from '@/components/modals/LogoutModal.vue'
import MercModal from '@/components/modals/MercModal.vue'
import RadialOverlay from '@/components/modals/RadialOverlay.vue'
import TriggersModal from '@/components/modals/TriggersModal.vue'

import MobileMenu from '@/components/mobile-menu/MobileMenu.vue'

import ButtonControls from '@/components/main-area/ButtonControls.vue'
import SideAliases from '@/components/main-area/SideAliases.vue'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'
import LineOutput from '@/components/main-area/LineOutput.vue'
import QuickSlotHandlers from '@/components/main-area/QuickSlotHandlers.vue'
import BottomHUD from '@/components/main-area/BottomHUD.vue'
import SideMap from '@/components/main-area/SideMap.vue'
import SideMovement from '@/components/main-area/SideMovement.vue'

import PartyStats from '@/components/hud/PartyStats.vue'
import QuickSlots from '@/components/hud/QuickSlots.vue'

import { state, setMode } from '@/static/state'
import { USER_GESTURE_EVENTS } from '@/static/constants'

import { useHelpers } from '@/composables/helpers'
import { useLocalStorageHandler } from '@/composables/local_storage_handler'
import { useWebSocket } from '@/composables/web_socket'
import { useWindowHandler } from '@/composables/window_handler'

const { selectMovementDirection, moveInSelectedDirection } = useHelpers()
const { triggerResize } = useWindowHandler()
const { saveOptions } = useLocalStorageHandler()

const { runCommand } = useWebSocket()

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

function showDebug () {
  setMode('modal')
  state.modals.debugModal = true
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

function startAudioContext () {
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
  runCommand(dir)

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
  runCommand('enter')

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

  state.inputEmitter.on('showDebug', showDebug)

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

  state.inputEmitter.off('showDebug', showDebug)

  for (let eventName of USER_GESTURE_EVENTS) {
    window.removeEventListener(eventName, startAudioContext)
  }

  if (state.music.audioContext) {
    state.music.audioContext.close()
  }

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

}

.game-layout {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;

  .game.swap-mobile-menu & {
    flex-direction: row-reverse;
  }

  @media screen and (max-width: 650px) {
    flex-direction: column;
    .game.swap-mobile-menu & {
      flex-direction: column-reverse;
    }
  }
}

.vertical-split {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-bottom: 5px;
  flex: 1 1 auto;

  > * {
    padding: 5px 10px;
    flex: 0 0 content;
  }
}

.content-split {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: stretch;
  flex: 1 1 0;
  overflow: auto;

  .line-area {
    flex: 1 1 auto;
    overflow: visible;

    &:last-child {
      padding-right: 34px + 10px;
    }
  }

  .side-area {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow-y: auto;

    .row {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      gap: 5px;

      &:first-child {
        padding-top: 34px + 10px;

        .game.show-modal-shortcuts & {
          padding-right: 34px + 10px;
        }
      }
    }

    .side-top {
      min-height: 300px;

      &:last-child {
        flex-grow: 1;
      }
    }

    .side-bottom {
      flex-grow: 1;
    }
  }
}

.bottom-split {
  padding: 0;
  flex: 0 0 content;
  > * {
    padding: 5px 10px 5px 10px;
  }
}
</style>
