<template>
  <div id="output" class="output" ref="output" @scroll="onScroll()">
    <div v-for="(line, i) in state.output"
      class="line"
      v-html-safe="line"
      :key="`line-${i}`"
      @click="lineClick"
      @mouseover="lineMouseover"
      @mouseleave="lineMouseleave">
    </div>
    <BattleStatus v-if="state.gameState.battle.active && !state.options.battleTableMode"></BattleStatus>
    <BattleTable v-if="state.gameState.battle.active && state.options.battleTableMode"></BattleTable>
  </div>
  <div v-show="state.scrolledBack.output" class="scrollback-control" @click="scrollDown()">
    <NIcon>
      <SouthOutlined></SouthOutlined>
    </NIcon>
    More
    <NIcon>
      <SouthOutlined></SouthOutlined>
    </NIcon>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

import { state } from '@/static/state'
import { useWebSocket } from '@/composables/web_socket'
import { useWindowHandler } from '@/composables/window_handler'

import BattleStatus from '@/components/battle/BattleStatus.vue'
import BattleTable from '@/components/battle/BattleTable.vue'

import SouthOutlined from '@vicons/material/SouthOutlined'
import { NIcon } from 'naive-ui'

const { send, runCommand } = useWebSocket()
const { onResize, calcTerminalSize } = useWindowHandler()

const outputId = 'output'
const scrollbackThreshold = 30

let resizeTimeout = null

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

function onChanged () {
  let el = document.getElementById(outputId)
  if (!el) {
    return
  }

  let { scrollTop, scrollHeight, offsetHeight } = el

  let atBottom = Math.round(scrollTop + offsetHeight) >= Math.round(scrollHeight - scrollbackThreshold)

  state.scrolledBack = !atBottom

  if (atBottom) {
    nextTick(() => scrollDown())
  }
}

function scrollDown () {
  let el = document.getElementById(outputId)
  if (el) {
    let target = Math.max(0, el.scrollHeight - el.clientHeight)
    el.scrollTop = target
  }
}

function onScroll () {
  let el = document.getElementById(outputId)
  if (el) {
    let { scrollTop, scrollHeight, offsetHeight } = el
    state.scrolledBack = Math.round(scrollTop + offsetHeight + scrollbackThreshold) <= scrollHeight
  }
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
  let activeTabElement = document.getElementById(outputId)
  activeTabElement.scrollTop = activeTabElement.scrollTop - activeTabElement.clientHeight * 9 / 10
}

function pageDown () {
  let activeTabElement = document.getElementById(outputId)
  activeTabElement.scrollTop = activeTabElement.scrollTop + activeTabElement.clientHeight * 9 / 10
}

let watchers = []
onMounted(() => {
  dayjs.extend(relativeTime)
  onResize(doResize)

  let el = document.getElementById(outputId)
  if (el) {
    el.scrollTop = el.scrollHeight
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

  watchers.push(watch(() => state.output.length, () => onChanged()))

  watchers.push(watch(() => state.gameState.battle.active, () => scrollDown()))
  watchers.push(watch(() => state.gameState.battle.participants, () => onChanged()))
  watchers.push(watch(() => state.options, () => doResize()))
})

onBeforeUnmount(() => {
  state.inputEmitter.off('pageUp', pageUp)
  state.inputEmitter.off('pageDown', pageDown)
  state.inputEmitter.off('scrollDown', scrollDown)

  for (let watcher of watchers) {
    watcher()
  }
})

</script>

<style lang="less">
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

</style>
