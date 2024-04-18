<template>
  <NModal
    v-model:show="state.modals.gameModal"
    title="Game Menu"
    @after-enter="onOpenModal"
    @after-leave="onCloseModal"
    class="game-modal"
    :auto-focus="false"
    :close-on-esc="false"
  >

    <div>
      <div class="modal-body">
        <p class="close" @click="onCloseModal()">
          <NIcon size="24">
            <CloseOutlined />
          </NIcon>
        </p>
        <p :class="getToggleMiniOutputClass()" @click="toggleMiniOutput()">
          <NIcon size="24">
            <KeyboardOutlined />
          </NIcon>
        </p>

        <NTabs
          v-model:value="currentPane"
          :class="getGameModalTabsClass()"
          type="card"
          tab-style="min-width: 80px;"
          ref="tabs"
        >
          
          <NTabPane name="score" tab="Score">
            <NSelect v-if="getGameModalAsOptions().length > 1" v-model:value="state.gameModalAs" :options="getGameModalAsOptions()"></NSelect>
            <ScorePane :mini-output-enabled="miniOutputEnabled"></ScorePane>
          </NTabPane>

          <NTabPane name="skills" tab="Skills">
            <NSelect v-if="getGameModalAsOptions().length > 1" v-model:value="state.gameModalAs" :options="getGameModalAsOptions()"></NSelect>
            <SkillsPane :mini-output-enabled="miniOutputEnabled"></SkillsPane>
          </NTabPane>

          <NTabPane name="quests" tab="Quests">
            <QuestsPane :mini-output-enabled="miniOutputEnabled"></QuestsPane>
          </NTabPane>
          
          <NTabPane name="inventory" tab="Inventory">
            <InventoryPane :mini-output-enabled="miniOutputEnabled"></InventoryPane>
          </NTabPane>
          
          <NTabPane name="equipment" tab="Equipment">
            <EquipmentPane :mini-output-enabled="miniOutputEnabled"></EquipmentPane>
          </NTabPane>
          
          <NTabPane name="options" tab="Options">
            <OptionsPane :mini-output-enabled="miniOutputEnabled"></OptionsPane>
          </NTabPane>
          
          <NTabPane name="mappings" tab="Mappings">
            <InputMappingsPane :mini-output-enabled="miniOutputEnabled"></InputMappingsPane>
          </NTabPane>

        </NTabs>

        <div v-if="miniOutputEnabled" class="mini-output" ref="mini-output" id="mini-output">
          <div v-for="(line, i) in getRecentOutput()" class="line" v-html-safe="line" :key="`line-${i}`"></div>
        </div>

        <KeyboardInput v-if="miniOutputEnabled" :focus-mode="'modal-input'" :active-modes="['modal', 'modal-input']"></KeyboardInput>
      </div>
    </div>
  </NModal>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { NModal, NTabs, NTabPane, NIcon, NSelect } from 'naive-ui'
import { state, prevMode, getGameModalAsOptions } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'

import CloseOutlined from '@vicons/material/CloseOutlined'
import KeyboardOutlined from '@vicons/material/KeyboardOutlined'

import EquipmentPane from '@/components/game-modal/EquipmentPane.vue'
import InputMappingsPane from '@/components/game-modal/InputMappingsPane.vue'
import InventoryPane from '@/components/game-modal/InventoryPane.vue'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'
import OptionsPane from '@/components/game-modal/OptionsPane.vue'
import QuestsPane from '@/components/game-modal/QuestsPane.vue'
import ScorePane from '@/components/game-modal/ScorePane.vue'
import SkillsPane from '@/components/game-modal/SkillsPane.vue'

const { selectNearestElement } = useHelpers()

let selectedElement = null
function selectModalAction (degree) {
  selectedElement = selectNearestElement(selectedElement, degree)
  if (selectedElement) {
    selectedElement.focus()
  }
}

function performModalAction () {
  if (selectedElement) {
    selectedElement.click()
  }
}

const tabs = ref(null)
const currentPane = ref("score")
const miniOutputEnabled = ref(false)
const panes = ref(['score', 'skills', 'quests', 'inventory', 'equipment', 'options', 'mappings'])

function onOpenModal () {
  // currentPane.value = state.gamepadTab || "score"
  scrollDown()
}

function onCloseModal () {
  if (!state.modals.gameModal) {
    return
  }
  state.modals.gameModal = false
  state.gamepadTab = currentPane.value
  if (state.mode == 'modal-input') {
    prevMode()
  }
  prevMode()
}

function getToggleMiniOutputClass () {
  return {
    'toggle-mini-output': true,
    'active': miniOutputEnabled.value
  }
}

function toggleMiniOutput () {
  miniOutputEnabled.value = !miniOutputEnabled.value
  nextTick(() => {
    scrollDown()
  })
}

function prevModalTab () {
  let index = panes.value.indexOf(currentPane.value)
  if (index == 0) {
    currentPane.value = panes.value[panes.value.length - 1]
  } else {
    currentPane.value = panes.value[index - 1]
  }
  state.gamepadTab = currentPane.value
  nextTick(() => tabs.value?.syncBarPosition())
}

function nextModalTab () {
  let index = panes.value.indexOf(currentPane.value)
  if (index == panes.value.length - 1) {
    currentPane.value = panes.value[0]
  } else {
    currentPane.value = panes.value[index + 1]
  }
  state.gamepadTab = currentPane.value
  nextTick(() => tabs.value?.syncBarPosition())
}

function getRecentOutput () {
  return state.output.slice(-100)
}

function scrollDown () {
  nextTick(() => {
    let output = document.getElementById('mini-output')
    if (output) {
      output.scrollTop = output.scrollHeight
    }
  })
}

function onOutputChanged () {
  let el = document.getElementById('mini-output')
  if (!el) {
    return
  }

  let { scrollTop, scrollHeight, offsetHeight } = el

  let scrollPosition = Math.round(scrollTop + offsetHeight + 5)
  let scrolledBack = scrollPosition <= scrollHeight

  if (scrolledBack) {
    return
  }

  scrollDown()
}

function getGameModalTabsClass () {
  return {
    'game-modal-tabs': true,
    'mini-output-hidden': !miniOutputEnabled.value
  }
}

watch(() => state.gamepadTab, () => {
  currentPane.value = state.gamepadTab
})

let watchers = []
onMounted(() => {
  state.inputEmitter.on('closeModal', onCloseModal)
  state.inputEmitter.on('prevModalTab', prevModalTab)
  state.inputEmitter.on('nextModalTab', nextModalTab)
  state.inputEmitter.on('selectModalAction', selectModalAction)
  state.inputEmitter.on('performModalAction', performModalAction)

  watchers.push(
    watch(state.output, () => onOutputChanged())
  )

  watchers.push(
    watch(state.gameState.charmies, () => {
      if (!state.gameState.charmies[state.gameModalAs]) {
        state.gameModalAs = ''
      }
    })
  )
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', onCloseModal)
  state.inputEmitter.off('prevModalTab', prevModalTab)
  state.inputEmitter.off('nextModalTab', nextModalTab)
  state.inputEmitter.off('selectModalAction', selectModalAction)
  state.inputEmitter.off('performModalAction', performModalAction)

  watchers.forEach(w => w())
})
</script>

<style lang="less">
.game-modal {
  min-height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 1);
  padding-bottom: 0px;

  .modal-body {
    position: relative;
    padding: 10px;

    .game-modal-tabs {
      .n-tabs-nav {
        width: calc(100vw - 100px);
      }
      .n-tab-pane {
        .n-select {
          // max-width: 200px;
        }
      }
      height: calc(100vh - 170px);
      overflow-y: hidden;
      &.mini-output-hidden {
        height: calc(100vh - 20px);
      }
    }

    .mini-output {
      height: 100px;
      overflow-y: scroll;
      padding: 10px 10px 0 10px;
      margin-bottom: 10px;
      background-color: #000;
      border-top: 1px solid rgba(255, 255, 255, 0.09);
      .line {
        font-size: 16px;
        line-height: 14px;
        color: #fff;
        margin-bottom: 5px;
        white-space: pre-wrap;
        font-weight: normal !important;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .close {
      margin: 0;
      padding: 5px;
      background-color: #111;
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 32px;
      z-index: 2;
      line-height: 16px;
      cursor: pointer;
      &:hover {
        background-color: #e88080;
        color: #000;
      }
    }

    .toggle-mini-output {
      margin: 0 5px 0 0;
      padding: 5px;
      background-color: #111;
      position: absolute;
      top: 10px;
      right: 44px;
      font-size: 32px;
      z-index: 2;
      line-height: 16px;
      cursor: pointer;
      &:hover, &.active {
        background-color: #63e2b7;
        color: #000;
      }
    }

  }
}
</style>