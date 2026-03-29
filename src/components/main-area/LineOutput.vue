<template>
  <div class="output-container">
    <div id="output" class="output" ref="output" @scroll.passive="onScroll()">
      <div v-for="(line, i) in renderedOutput"
        class="line"
        v-html-safe="line"
        :key="`line-${renderStartIndex + i}`"
        @click="lineClick"
        @mouseover="lineMouseover"
        @mouseleave="lineMouseleave">
      </div>
      <BattleStatus v-if="state.gameState.battle.active && !state.options.battleTableMode"></BattleStatus>
      <BattleTable v-if="state.gameState.battle.active && state.options.battleTableMode"></BattleTable>
    </div>
    <div v-show="isScrolledBack" class="scrollback-control" @click="scrollDown()">
      <NIcon>
        <SouthOutlined></SouthOutlined>
      </NIcon>
      More
      <NIcon>
        <SouthOutlined></SouthOutlined>
      </NIcon>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { watch, onMounted, onBeforeUnmount, computed, ref } from 'vue'

import { state } from '@/static/state'
import { useWebSocket } from '@/composables/web_socket'
import { useWindowHandler } from '@/composables/window_handler'

import BattleStatus from '@/components/battle/BattleStatus.vue'
import BattleTable from '@/components/battle/BattleTable.vue'

import SouthOutlined from '@vicons/material/SouthOutlined'
import { NIcon } from 'naive-ui'

const { send, runCommand } = useWebSocket()
const { onResize, offResize, calcTerminalSize } = useWindowHandler()

const outputId = 'output'
const scrollbackThreshold = 30
const maxVisibleOutputLines = 400

const output = ref(null)
const isScrolledBack = computed(() => !!state.scrolledBack)
const renderStartIndex = computed(() => {
  if (isScrolledBack.value) {
    return 0
  }
  return Math.max(0, state.output.length - maxVisibleOutputLines)
})
const renderedOutput = computed(() => state.output.slice(renderStartIndex.value))

let resizeTimeout = null
let outputSyncFrame = 0
let scrollStateFrame = 0
let pendingForceScroll = false
let resizeObserver = null

function getOutputElement () {
  return output.value || document.getElementById(outputId)
}

function getResizeTarget () {
  return getOutputElement()?.parentElement || null
}

function doResize () {
  if (resizeTimeout) {
    return
  }

  resizeTimeout = setTimeout(() => {
    let { width, height } = calcTerminalSize()
    send('terminal', { width, height, ttype: 'play.proceduralrealms.com' })
    resizeTimeout = null
  }, 500)
}

function scrollToBottom (el = getOutputElement()) {
  if (!el) {
    return
  }

  let target = Math.max(0, el.scrollHeight - el.clientHeight)
  el.scrollTop = target
}

function syncOutputState (forceScroll = false) {
  let el = getOutputElement()
  if (!el) {
    return
  }

  let { scrollTop, scrollHeight, offsetHeight } = el

  let atBottom = Math.round(scrollTop + offsetHeight) >= Math.round(scrollHeight - scrollbackThreshold)

  const shouldScrollToBottom = forceScroll || atBottom
  state.scrolledBack = !shouldScrollToBottom

  if (shouldScrollToBottom) {
    scrollToBottom(el)
  }
}

function scheduleOutputSync ({ forceScroll = false } = {}) {
  pendingForceScroll = pendingForceScroll || forceScroll

  if (outputSyncFrame) {
    return
  }

  outputSyncFrame = requestAnimationFrame(() => {
    outputSyncFrame = 0
    const shouldForceScroll = pendingForceScroll
    pendingForceScroll = false
    syncOutputState(shouldForceScroll)
  })
}

function scrollDown () {
  scheduleOutputSync({ forceScroll: true })
}

function onScroll () {
  if (scrollStateFrame) {
    return
  }

  scrollStateFrame = requestAnimationFrame(() => {
    scrollStateFrame = 0
    let el = getOutputElement()
    if (!el) {
      return
    }

    let { scrollTop, scrollHeight, offsetHeight } = el
    state.scrolledBack = Math.round(scrollTop + offsetHeight + scrollbackThreshold) <= scrollHeight
  })
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

function pageUp () {
  let activeTabElement = getOutputElement()
  if (!activeTabElement) {
    return
  }

  activeTabElement.scrollTop = activeTabElement.scrollTop - activeTabElement.clientHeight * 9 / 10
}

function pageDown () {
  let activeTabElement = getOutputElement()
  if (!activeTabElement) {
    return
  }

  activeTabElement.scrollTop = activeTabElement.scrollTop + activeTabElement.clientHeight * 9 / 10
}

function observeOutputResize () {
  if (typeof ResizeObserver == 'undefined') {
    return
  }

  const target = getResizeTarget()
  if (!target) {
    return
  }

  resizeObserver = new ResizeObserver(() => {
    doResize()
  })
  resizeObserver.observe(target)
}

let watchers = []
onMounted(() => {
  dayjs.extend(relativeTime)
  onResize(doResize)
  observeOutputResize()

  let el = getOutputElement()
  if (el) {
    scrollToBottom(el)
  }

  doResize()

  // state.inputEmitter.on('selectOutputTab', selectOutputTab)
  // state.inputEmitter.on('selectChatTab', selectChatTab)
  // state.inputEmitter.on('selectTradeTab', selectTradeTab)
  // state.inputEmitter.on('selectNewbieTab', selectNewbieTab)
  // state.inputEmitter.on('selectPrevOutputTab', selectPrevOutputTab)
  // state.inputEmitter.on('selectNextOutputTab', selectNextOutputTab)
  state.inputEmitter.on('pageUp', pageUp)
  state.inputEmitter.on('pageDown', pageDown)
  state.inputEmitter.on('scrollDown', scrollDown)

  watchers.push(watch(() => state.output.length, () => {
    scheduleOutputSync({ forceScroll: !state.scrolledBack })
  }, { flush: 'post' }))

  watchers.push(watch(() => state.gameState.battle.active, () => scrollDown(), { flush: 'post' }))
  watchers.push(watch(() => `${state.gameState.battle.active}|${state.options.battleTableMode}|${Object.keys(state.gameState.battle.participants || {}).join('|')}`, () => {
    scheduleOutputSync({ forceScroll: !state.scrolledBack })
  }, { flush: 'post' }))
})

onBeforeUnmount(() => {
  state.inputEmitter.off('pageUp', pageUp)
  state.inputEmitter.off('pageDown', pageDown)
  state.inputEmitter.off('scrollDown', scrollDown)
  offResize(doResize)

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
    resizeTimeout = null
  }

  if (outputSyncFrame) {
    cancelAnimationFrame(outputSyncFrame)
    outputSyncFrame = 0
  }

  if (scrollStateFrame) {
    cancelAnimationFrame(scrollStateFrame)
    scrollStateFrame = 0
  }

  for (let watcher of watchers) {
    watcher()
  }
})

</script>

<style lang="less">
.output-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.output {
  position: relative;
  /* fill the .line-area height so this element is the scrolling container */
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  width: 100%;
  display: block;
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

@media screen and (max-height: 500px) {
  .output {
    .line {
      font-size: 1rem;
      line-height: 1rem;
    }
  }
}

</style>
