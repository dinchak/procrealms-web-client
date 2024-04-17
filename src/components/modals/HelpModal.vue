<template>
  <NModal
    v-model:show="state.modals.helpModal"
    title="Help"
    @after-enter="onOpenModal"
    @after-leave="onCloseModal"
    class="help-modal"
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
          :class="getTabsClass()"
          type="card"
          tab-style="min-width: 80px;"
          ref="tabs"
        >
          
          <NTabPane name="topics" tab="Topics">
            <div :class="getScrollContainerClass()">
              <h1>General</h1>
              <div class="help-topics">
                <div v-for="topic in state.help.topics.general">{{ topic }}</div>
              </div>
              <h1>Skills</h1>
              <div class="help-topics">
                <div v-for="topic in state.help.topics.skills">{{ topic }}</div>
              </div>
              <h1>Commands</h1>
              <div class="help-topics">
                <div v-for="topic in state.help.topics.commands">{{ topic }}</div>
              </div>
            </div>
          </NTabPane>

          <div v-if="miniOutputEnabled" class="mini-output" ref="mini-output" id="mini-output">
            <div v-for="(line, i) in getRecentOutput()" class="line" v-html-safe="line" :key="`line-${i}`"></div>
          </div>

          <KeyboardInput v-if="miniOutputEnabled" :focus-mode="'modal-input'" :active-modes="['modal', 'modal-input']"></KeyboardInput>
        </NTabs>
      </div>
    </div>
  </NModal>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { NModal, NTabs, NTabPane, NIcon } from 'naive-ui'
import CloseOutlined from '@vicons/material/CloseOutlined'
import KeyboardOutlined from '@vicons/material/KeyboardOutlined'

import { state, prevMode } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'

const { send } = useWebSocket()

const tabs = ref(null)
const currentPane = ref("topics")
const miniOutputEnabled = ref(false)
const panes = ref(['topics'])

function loadHelpTopics () {
  if (!state.help.topicsLoaded) {
    send('help', { cmd: 'topics'})
  }
}

function getRecentOutput () {
  return state.output.slice(-100)
}

function getTabsClass () {
  return {
    'help-modal-tabs': true,
    'mini-output-hidden': !miniOutputEnabled.value
  }
}

function getScrollContainerClass () {
  return {
    'scroll-container': true,
    'mini-output-enabled': miniOutputEnabled.value
  }
}

function onCloseModal () {
  if (!state.modals.helpModal) {
    return
  }
  state.modals.helpModal = false
  state.gamepadHelpTab = currentPane.value
  if (state.mode == 'modal-input') {
    prevMode()
  }
  prevMode()
}

function onOpenModal () {
  console.log(`gamepadHelpTab: ${state.gamepadHelpTab}`)
  currentPane.value = state.gamepadHelpTab || "topics"
  scrollDown()
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
  state.gamepadHelpTab = currentPane.value
  nextTick(() => tabs.value?.syncBarPosition())
}

function nextModalTab () {
  let index = panes.value.indexOf(currentPane.value)
  if (index == panes.value.length - 1) {
    currentPane.value = panes.value[0]
  } else {
    currentPane.value = panes.value[index + 1]
  }
  state.gamepadHelpTab = currentPane.value
  nextTick(() => tabs.value?.syncBarPosition())
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

function scrollDown () {
  nextTick(() => {
    let output = document.getElementById('mini-output')
    if (output) {
      output.scrollTop = output.scrollHeight
    }
  })
}

let watchers = []
onMounted(() => {
  loadHelpTopics()

  state.inputEmitter.on('closeModal', onCloseModal)
  state.inputEmitter.on('prevModalTab', prevModalTab)
  state.inputEmitter.on('nextModalTab', nextModalTab)

  watchers.push(
    watch(state.output, () => onOutputChanged())
  )
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', onCloseModal)
  state.inputEmitter.off('prevModalTab', prevModalTab)
  state.inputEmitter.off('nextModalTab', nextModalTab)

  watchers.forEach(w => w())
})

</script>

<style lang="less">
.help-modal {
  min-height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 1);
  padding-bottom: 0px;

  .modal-body {
    position: relative;
    padding: 10px;

    .help-modal-tabs {
      .n-tabs-nav {
        width: calc(100vw - 100px);
      }
      .n-tab-pane {
        .scroll-container {
          height: calc(100vh - 75px);
          overflow-y: scroll;
          max-width: 1200px;
          margin: 0 auto;

          &.mini-output-enabled {
            height: calc(100vh - 225px);
          }

          .help-topics {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            grid-gap: 5px 10px;
            margin-bottom: 15px;
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            div {
              font-size: 16px;
              line-height: 20px;
              color: #fff;
              padding: 5px 10px;
              background-color: #111;
              border: 1px solid #333;
              cursor: pointer;
              transition: all 0.2s;
              &:hover {
                background-color: #63e2b7;
                color: #000;
              }
            }
          }
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