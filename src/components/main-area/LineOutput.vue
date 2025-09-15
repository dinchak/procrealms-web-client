<template>
  <n-tabs class="output-tabs" ref="tabsInstance" v-model:value="currentPane" @before-leave="onBeforeChangeTab"
          @update:value="onAfterChangeTab" :bar-width="20">
    <n-tab-pane name="output" tab="Main" display-directive="show">
      <div id="output" class="output" ref="output" @scroll="onScroll('output')">
        <div v-for="(line, i) in state.output"
          class="line"
          v-html-safe="line"
          :key="`line-${i}`"
          @click="lineClick"
          @mouseover="lineMouseover"
          @mouseleave="lineMouseleave">
        </div>
        <BattleStatus v-if="state.gameState.battle.active"></BattleStatus>
      </div>
      <div v-show="state.scrolledBack.output" class="scrollback-control" @click="scrollDownTab('output')">
        <NIcon>
          <SouthOutlined></SouthOutlined>
        </NIcon>
        More
        <NIcon>
          <SouthOutlined></SouthOutlined>
        </NIcon>
      </div>
    </n-tab-pane>

    <n-tab-pane v-for="tabName in ['chat', 'trade', 'newbie']" :name="tabName" :tab="getTab(tabName)" display-directive="show" :key="tabName">
      <div :id="tabName" class="output" :ref="refs[tabName]" @scroll="onScroll(tabName)">
        <div v-for="(line, i) in state[tabName]" class="message" :key="`line-${i}`">
          <div class="from">
            <div class="name bold-yellow">{{ line.from }}</div>
            <div class="timestamp black">{{ getTimeSince(line.timestamp) }}</div>
          </div>
          <div class="body bold-white" v-html-safe="line.message"></div>
        </div>
      </div>
      <div v-show="state.scrolledBack[tabName]" class="scrollback-control" @click="scrollDownTab(tabName)">
        <NIcon>
          <SouthOutlined />
        </NIcon>
        More
        <NIcon>
          <SouthOutlined />
        </NIcon>
      </div>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { ref, watch, nextTick, onMounted, onBeforeUnmount, h } from 'vue'

import { state } from '@/static/state'
import { useWebSocket } from '@/composables/web_socket'
import { useWindowHandler } from '@/composables/window_handler'

import BattleStatus from '@/components/battle/BattleStatus.vue'

import SouthOutlined from '@vicons/material/SouthOutlined'
import { NIcon, NTabs, NTabPane, NBadge, NSpace } from 'naive-ui'

const output = ref(null)
const chat = ref(null)
const trade = ref(null)
const newbie = ref(null)
const tabsInstance = ref(null)
const currentPane = ref('output') // chat, trade, or newbie
const refs = { output, chat, trade, newbie }

const { send, runCommand } = useWebSocket()
const { onResize, calcTerminalSize } = useWindowHandler()

let resizeTimeout = null

function doResize () {
  if (resizeTimeout) {
    return
  }

  resizeTimeout = setTimeout(() => {
    if (!output.value) {
      return
    }

    let { width, height } = calcTerminalSize()
    send('terminal', { width, height, ttype: 'play.proceduralrealms.com' })
    resizeTimeout = null
  }, 500)
}

function onChanged (id) {
  let el = document.getElementById(id)
  if (!el) {
    return
  }

  let { scrollTop, scrollHeight, offsetHeight } = el

  let scrollPosition = Math.round(scrollTop + offsetHeight + 5)
  let scrolledBack = scrollPosition <= scrollHeight

  if (!scrolledBack) {
    nextTick(() => scrollDownTab(id))
  }
}

function scrollDownTab (id) {
  let el = document.getElementById(id)
  if (el) {
    el.scrollTo(0, el.scrollHeight)
  }
}

function getTimeSince (timestamp) {
  return dayjs(timestamp).fromNow()
}

function onScroll (id) {
  let el = document.getElementById(id)
  if (el) {
    let { scrollTop, scrollHeight, offsetHeight } = el
    state.scrolledBack[id] = Math.round(scrollTop + offsetHeight + 5) <= scrollHeight
  }
}

function onBeforeChangeTab (activeName) {
  if (['chat', 'trade', 'newbie'].includes(activeName)) {
    state[activeName].forEach(msg => {
      msg.unread = false
    })
  }
  state.activeTab = activeName
  return true
}

function onAfterChangeTab (activeName) {
  setTimeout(() => {
    scrollDownTab(activeName)
  })
}

function getTab (name) {
  let numUnread = state[name].filter(msg => msg.unread).length
  let children = [name.charAt(0).toUpperCase() + name.slice(1)]
  if (numUnread > 0) {
    children.push(h(NBadge, { value: numUnread }))
  }
  return h(NSpace, {}, () => children)
}

function lineClick (ev) {
  const el = ev.srcElement
  if (el.style['text-decoration-line']) {
    runCommand(el.innerText)
  }
}

function lineMouseover (ev) {
  const el = ev.srcElement
  if (el.style['text-decoration-line']) {
    el.style.cursor = 'pointer'
  }
}

function lineMouseleave (ev) {
  const el = ev.srcElement
  if (el.style['text-decoration-line']) {
    el.style.cursor = 'default'
  }
}

function selectOutputTab () {
  onBeforeChangeTab('output')
  currentPane.value = 'output'
  state.activeTab = 'output'
  nextTick(() => tabsInstance.value?.syncBarPosition())
  onAfterChangeTab(currentPane.value)
}

function selectChatTab () {
  onBeforeChangeTab('chat')
  currentPane.value = 'chat'
  state.activeTab = 'chat'
  nextTick(() => tabsInstance.value?.syncBarPosition())
  onAfterChangeTab(currentPane.value)
}

function selectTradeTab () {
  onBeforeChangeTab('trade')
  currentPane.value = 'trade'
  state.activeTab = 'trade'
  nextTick(() => tabsInstance.value?.syncBarPosition())
  onAfterChangeTab(currentPane.value)
}

function selectNewbieTab () {
  onBeforeChangeTab('newbie')
  currentPane.value = 'newbie'
  state.activeTab = 'newbie'
  nextTick(() => tabsInstance.value?.syncBarPosition())
  onAfterChangeTab(currentPane.value)
}

function selectPrevOutputTab () {
  let index = state.outputTabs.indexOf(state.activeTab)
  if (index > 0) {
    let prevTab = state.outputTabs[index - 1]
    onBeforeChangeTab(prevTab)
    currentPane.value = prevTab
    state.activeTab = prevTab
    nextTick(() => tabsInstance.value?.syncBarPosition())
    onAfterChangeTab(currentPane.value)
  }
}

function selectNextOutputTab () {
  let index = state.outputTabs.indexOf(state.activeTab)
  if (index < state.outputTabs.length - 1) {
    let nextTab = state.outputTabs[index + 1]
    onBeforeChangeTab(nextTab)
    currentPane.value = nextTab
    state.activeTab = nextTab
    nextTick(() => tabsInstance.value?.syncBarPosition())
    onAfterChangeTab(currentPane.value)
  }
}

function pageUp () {
  let activeTabElement = document.getElementById(state.activeTab)
  activeTabElement.scrollTo(0, activeTabElement.scrollTop - activeTabElement.clientHeight * 9 / 10)
}

function pageDown () {
  let activeTabElement = document.getElementById(state.activeTab)
  activeTabElement.scrollTo(0, activeTabElement.scrollTop + activeTabElement.clientHeight * 9 / 10)
}

function scrollDown () {
  let activeTabElement = document.getElementById(state.activeTab)
  if (activeTabElement) {
    activeTabElement.scrollTo(0, activeTabElement.scrollHeight)
  }
}

function showHideTabs () {
  let tabs = document.querySelector('.n-tabs-nav')
  if (tabs) {
    if (state.options.showTabs) {
      tabs.classList.remove('hide')
    } else {
      tabs.classList.add('hide')
    }
  }

}

let watchers = []
onMounted(() => {
  dayjs.extend(relativeTime)
  onResize(doResize)

  for (let id in refs) {
    let el = document.getElementById(id)
    if (el) {
      el.scrollTo(0, el.scrollHeight)
    }
  }

  doResize()
  showHideTabs()

  state.inputEmitter.on('selectOutputTab', selectOutputTab)
  state.inputEmitter.on('selectChatTab', selectChatTab)
  state.inputEmitter.on('selectTradeTab', selectTradeTab)
  state.inputEmitter.on('selectNewbieTab', selectNewbieTab)
  state.inputEmitter.on('selectPrevOutputTab', selectPrevOutputTab)
  state.inputEmitter.on('selectNextOutputTab', selectNextOutputTab)
  state.inputEmitter.on('pageUp', pageUp)
  state.inputEmitter.on('pageDown', pageDown)
  state.inputEmitter.on('scrollDown', scrollDown)

  watchers.push(watch(() => state.output.length, () => onChanged('output')))
  watchers.push(watch(() => state.chat.length, () => onChanged('chat')))
  watchers.push(watch(() => state.trade.length, () => onChanged('trade')))
  watchers.push(watch(() => state.newbie.length, () => onChanged('newbie')))

  watchers.push(watch(() => state.gameState.battle.active, () => scrollDownTab('output')))
  watchers.push(watch(() => state.gameState.battle.participants, () => onChanged('output')))
  watchers.push(watch(() => state.options, () => doResize()))
  watchers.push(watch(() => state.options.showTabs, () => showHideTabs()))
})

onBeforeUnmount(() => {
  state.inputEmitter.off('selectOutputTab', selectOutputTab)
  state.inputEmitter.off('selectChatTab', selectChatTab)
  state.inputEmitter.off('selectTradeTab', selectTradeTab)
  state.inputEmitter.off('selectNewbieTab', selectNewbieTab)
  state.inputEmitter.off('selectPrevOutputTab', selectPrevOutputTab)
  state.inputEmitter.off('selectNextOutputTab', selectNextOutputTab)
  state.inputEmitter.off('pageUp', pageUp)
  state.inputEmitter.off('pageDown', pageDown)
  state.inputEmitter.off('scrollDown', scrollDown)

  for (let watcher of watchers) {
    watcher()
  }
})

</script>

<style lang="less">
.line-area {
  .n-tabs.n-tabs--bar-type {
    .n-tabs-tab {
      padding: 5px;
    }

    .n-tabs-nav-scroll-wrapper {
      width: 0;
    }

    .n-tabs-nav {
      display: none;
      &.hide {
        display: none;
      }
    }
  }

  .n-tab-pane {
    position: relative; // for scrollback
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow-y: auto;
    width: 100%;
    height: 100%;
  }
}
</style>
<style scoped lang="less">
.output-tabs {
  margin-top: -3px;
  padding: 0;
  width: 100%;
  height: 100%;
}

.output {
  display: flex;
  flex-direction: column;
  flex-basis: fit-content;
  overflow-y: auto;
}


.scrollback-control {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 40px;
  line-height: 40px;
  background-color: rgba(20, 80, 20, 0.4);
  font-size: 1.5rem;
  text-align: center;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;

  .n-icon {
    margin: 0 15px;
  }
}

#chat {
  .message {
    border-top: 1px solid #433f17;

    &:first-child {
      border: 0;
    }
  }
}

#trade {
  .message {
    border-top: 1px solid #193e17;

    &:first-child {
      border: 0;
    }
  }
}

#newbie {
  .message {
    border-top: 1px solid #33163f;

    &:first-child {
      border: 0;
    }
  }
}


.line {
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
  font-weight: normal !important;

  .player-cmd-caret {
    color: #f8ff25;
  }

  .player-cmd {
    color: #fff;
  }
}

.message {
  display: grid;
  grid-template-columns: 110px calc(100% - 200px) 90px;
  border-top: 1px solid #181818;
  margin-top: 5px;
  padding-top: 5px;
  align-items: center;

  &:first-child {
    border: 0;
  }

  .from {
    .name {
      font-size: 0.9rem;
      line-height: 0.8rem;
      text-align: right;
      word-break: break-all;
    }

    .timestamp {
      font-size: 0.6rem;
      line-height: 0.6rem;
      text-align: right;
    }
  }

  .body {
    display: flex;
    margin-left: 10px;
  }
}

@media screen and (max-height: 500px) {
  .tabs {
    .output {
      .line {
        font-size: 1rem;
        line-height: 1rem;
      }

      .message {
        grid-template-columns: 90px calc(100% - 90px);

        .body {
          font-size: 1rem;
          line-height: 1rem;
        }
      }
    }
  }
}

</style>
