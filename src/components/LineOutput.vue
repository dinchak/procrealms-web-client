<template>

  <n-tabs class="tabs" @update:value="onChangeTab">
    <n-tab-pane name="output" tab="Main" display-directive="show">
      <div id="output" class="output" ref="output" @scroll="onScroll('output')">
        <div v-for="(line, i) in state.output" class="line" v-html="line" :key="`line-${i}`"></div>
      </div>
      <div v-show="state.scrolledBack.output" class="scrollback-control" @click="scrollDown('output')">
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
        More
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
      </div>
    </n-tab-pane>

    <n-tab-pane name="gossip" tab="Gossip" display-directive="show">
      <div id="gossip" class="output" ref="gossip" @scroll="onScroll('gossip')">
        <div v-for="(line, i) in state.gossip" class="message" :key="`line-${i}`">
          <div class="from">
            <div class="name">{{ line.name }}</div>
            <div class="timestamp white">{{ getTimeSince(line.timestamp) }}</div>
          </div>
          <div class="body" v-html="line.message"></div>
        </div>
      </div>
      <div v-show="state.scrolledBack.gossip" class="scrollback-control" @click="scrollDown('gossip')">
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
        More
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
      </div>
    </n-tab-pane>

    <n-tab-pane name="trade" tab="Trade" display-directive="show">
      <div id="trade" class="output" ref="trade" @scroll="onScroll('trade')">
        <div v-for="(line, i) in state.trade" class="line" v-html="line" :key="`line-${i}`"></div>
      </div>
      <div v-show="state.scrolledBack.trade" class="scrollback-control" @click="scrollDown('trade')">
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
        More
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
      </div>
    </n-tab-pane>

    <n-tab-pane name="newbie" tab="Newbie" display-directive="show">
      <div id="newbie" class="output" ref="newbie" @scroll="onScroll('newbie')">
        <div v-for="(line, i) in state.newbie" class="line" v-html="line" :key="`line-${i}`"></div>
      </div>
      <div v-show="state.scrolledBack.newbie" class="scrollback-control" @click="scrollDown('newbie')">
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
        More
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
      </div>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { ref, watch, nextTick, onMounted } from 'vue'

import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import { useWindowHandler } from '@/composables/window_handler'

import SouthOutlined from '@vicons/material/SouthOutlined'
import { NIcon, NTabs, NTabPane } from 'naive-ui'

dayjs.extend(relativeTime)

const output = ref(null)
const gossip = ref(null)
const trade = ref(null)
const newbie = ref(null)

const refs = { output, gossip, trade, newbie }

const { send } = useWebSocket()
const { onResize } = useWindowHandler()

onResize(calcTerminalSize)

let resizeTimeout = null

function calcTerminalSize () {
  if (resizeTimeout) {
    return
  }

  resizeTimeout = setTimeout(() => {
    if (!output.value) {
      return
    }

    let charWidth = 10
    let charHeight = 21

    if (window.innerHeight < 500) {
      charWidth = 8
      charHeight = 16
    }

    let terminalWidth = Math.floor(output.value.offsetWidth  / charWidth)
    let terminalHeight = Math.floor(output.value.offsetHeight  / charHeight)

    send('terminal', { width: terminalWidth, height: terminalHeight })

    resizeTimeout = null
  }, 500)
}

function onChanged (id) {
  let el = document.getElementById(id)
  if (!el) {
    return
  }

  let { scrollTop, scrollHeight, offsetHeight } = el
  console.log(scrollTop)
  let scrolledBack = Math.round(scrollTop + offsetHeight + 5) <= scrollHeight
  if (!scrolledBack) {
    nextTick(() => scrollDown(id))
  }
}

watch(() => state.gameState.battle.active, () => scrollDown())

function scrollDown (id) {
  console.log(`scrollDown(${id})`)
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

function onChangeTab (name) {
  state.activeTab = name
}

onMounted(() => {
  for (let id in refs) {
    let el = document.getElementById(id)
    if (el) {
      el.scrollTo(0, el.scrollHeight)
    }
  }

  calcTerminalSize()

  watch(() => state.output.length, () => onChanged('output'))
  watch(() => state.gossip.length, () => onChanged('gossip'))
  watch(() => state.trade.length, () => onChanged('trade'))
  watch(() => state.newbie.length, () => onChanged('newbie'))
})

</script>

<style lang="less">
.tabs {
  height: 100%;

  .n-tabs-nav {
    margin: 0 10px;
  }

  .scrollback-control {
    position: absolute;
    bottom: 45px;
    left: 0;
    right: 0;
    height: 40px;
    line-height: 40px;
    width: 100%;
    background-color: rgba(20, 80, 20, 0.4);
    font-size: 24px;
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

  .output {
    margin: 5px 10px;
    overflow-y: scroll;
    height: ~"calc(100vh - 140px)";
    position: relative;

    .line {
      font-size: 20px;
      line-height: 22px;
      display: block;
      white-space: pre-wrap;
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
      grid-template-columns: 100px  calc(100% - 100px);
      border-top: 1px solid #333;
      margin-top: 10px;
      padding-top: 10px;
      &:first-child {
        border: 0;
      }
      .from {
        .name {
          font-size: 14px;
          line-height: 10px;
          text-align: right;
        }
        .timestamp {
          font-size: 10px;
          line-height: 10px;
          text-align: right;
        }
      }
      .body {
        display: flex;
        align-items: center;
        font-size: 16px;
        line-height: 16px;
        margin-left: 10px;
      }
    }
  }
}


@media screen and (max-height: 500px) {
  .tabs {
    .scrollback-control {
      bottom: 70px;
    }
    .output {
      .line {
        font-size: 16px;
        height: 16px;
        line-height: 16px;
      }
    }
  }
}

@media screen and (max-width: 1000px) {
  .tabs {
    .output {
      height: ~"calc(100vh - 130px)";
    }
  }
}

</style>
