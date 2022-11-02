<template>

  <n-tabs class="tabs" @before-leave="onBeforeChangeTab" @update:value="onAfterChangeTab" :bar-width="20">
    <n-tab-pane name="output" tab="Main" display-directive="show">
      <div id="output" :class="getOutputClass()" ref="output" @scroll="onScroll('output')">
        <div v-for="(line, i) in state.output" class="line" v-html="line" :key="`line-${i}`"></div>
        <BattleStatus v-if="state.gameState.battle.active"></BattleStatus>
      </div>
      <div v-show="state.scrolledBack.output" :class="getScrollbackControlClass()" @click="scrollDown('output')">
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
        More
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
      </div>
    </n-tab-pane>

    <n-tab-pane name="gossip" :tab="getTab('gossip')" display-directive="show">
      <div id="gossip" class="output" ref="gossip" @scroll="onScroll('gossip')">
        <div v-for="(line, i) in state.gossip" class="message" :key="`line-${i}`">
          <div class="from">
            <div class="name bold-yellow">{{ line.from }}</div>
            <div class="timestamp black">{{ getTimeSince(line.timestamp) }}</div>
          </div>
          <div class="body bold-white" v-html="line.message"></div>
        </div>
      </div>
      <div v-show="state.scrolledBack.gossip" :class="getScrollbackControlClass()" @click="scrollDown('gossip')">
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
        More
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
      </div>
    </n-tab-pane>

    <n-tab-pane name="trade" :tab="getTab('trade')" display-directive="show">
      <div id="trade" class="output" ref="trade" @scroll="onScroll('trade')">
        <div v-for="(line, i) in state.trade" class="message" :key="`line-${i}`">
          <div class="from">
            <div class="name bold-green">{{ line.from }}</div>
            <div class="timestamp black">{{ getTimeSince(line.timestamp) }}</div>
          </div>
          <div class="body bold-white" v-html="line.message"></div>
        </div>
      </div>
      <div v-show="state.scrolledBack.trade" :class="getScrollbackControlClass()" @click="scrollDown('trade')">
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
        More
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
      </div>
    </n-tab-pane>

    <n-tab-pane name="newbie" :tab="getTab('newbie')" display-directive="show">
      <div id="newbie" class="output" ref="newbie" @scroll="onScroll('newbie')">
        <div v-for="(line, i) in state.newbie" class="message" :key="`line-${i}`">
          <div class="from">
            <div class="name bold-magenta">{{ line.from }}</div>
            <div class="timestamp black">{{ getTimeSince(line.timestamp) }}</div>
          </div>
          <div class="body bold-white" v-html="line.message"></div>
        </div>
      </div>
      <div v-show="state.scrolledBack.newbie" :class="getScrollbackControlClass()" @click="scrollDown('newbie')">
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

import { ref, watch, nextTick, onMounted, h } from 'vue'

import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import { useWindowHandler } from '@/composables/window_handler'

import BattleStatus from '@/components/main-area/BattleStatus.vue'

import SouthOutlined from '@vicons/material/SouthOutlined'
import { NIcon, NTabs, NTabPane, NBadge, NSpace } from 'naive-ui'

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

    send('terminal', { width: terminalWidth, height: terminalHeight, ttype: 'play.proceduralrealms.com' })

    resizeTimeout = null
  }, 500)
}

function onChanged (id) {
  let el = document.getElementById(id)
  if (!el) {
    return
  }

  let { scrollTop, scrollHeight, offsetHeight } = el
  let scrolledBack = Math.round(scrollTop + offsetHeight + 5) <= scrollHeight
  if (!scrolledBack) {
    nextTick(() => scrollDown(id))
  }
}

function scrollDown (id) {
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
  if (['gossip', 'trade', 'newbie'].includes(activeName)) {
    state[activeName].forEach(msg => msg.unread = false)
  }
  state.activeTab = activeName
  return true
}

function onAfterChangeTab (activeName) {
  setTimeout(() => {
    scrollDown(activeName)
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

function getOutputClass () {
  let cls = 'output'
  if (state.gameState.slots.length > 0) {
    cls += ' has-quickslots'
  }
  if (!state.options.showTabs) {
    cls += ' tabs-hidden'
  }
  return cls
}

function doHideShowTabs () {
  let tabNav = document.getElementsByClassName('n-tabs-nav')
  if (tabNav[0]) {
    let classes = tabNav[0].className.split(' ')
    if (!state.options.showTabs) {
      classes.push('hide')
    } else {
      classes = classes.filter(cls => cls != 'hide')
    }
    tabNav[0].className = classes.join(' ')
  }
}

function getScrollbackControlClass () {
  let cls = 'scrollback-control'
  if (state.gameState.slots.length > 0) {
    cls += ' has-quickslots'
  }
  return cls
}

onMounted(() => {
  for (let id in refs) {
    let el = document.getElementById(id)
    if (el) {
      el.scrollTo(0, el.scrollHeight)
    }
  }

  calcTerminalSize()
  doHideShowTabs()

  watch(() => state.output.length, () => onChanged('output'))
  watch(() => state.gossip.length, () => onChanged('gossip'))
  watch(() => state.trade.length, () => onChanged('trade'))
  watch(() => state.newbie.length, () => onChanged('newbie'))
  watch(() => state.options.showTabs, () => doHideShowTabs())
})

</script>

<style lang="less">
.tabs {

  .n-tab-pane {
    padding: 0;
  }

  .n-tabs-nav {
    margin: 0 10px;
    &.hide {
      display: none;
    }
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
    &.has-quickslots {
      &.show-mobile {
        bottom: 80px;
      }
    }
    .n-icon {
      margin: 0 15px;
    }
  }

  #gossip {
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

  .output {
    display: flex;
    flex-direction: column;
    flex-basis: fit-content;
    margin: 5px 10px;
    position: relative;
    height: ~"calc(100vh - 85px)";
    overflow-y: scroll;
    overflow-x: hidden;

    &.tabs-hidden {
      height: ~"calc(100vh - 52px)";
    }

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
          font-size: 14px;
          line-height: 12px;
          text-align: right;
          word-break: break-all;
        }
        .timestamp {
          font-size: 10px;
          line-height: 8px;
          text-align: right;
        }
      }
      .body {
        display: flex;
        font-size: 20px;
        line-height: 20px;
        margin-left: 10px;
      }
    }
  }
}


@media screen and (max-height: 500px) {
  .tabs {
    .scrollback-control {
      // bottom: 80px;
    }
    .output {
      .line {
        font-size: 16px;
        line-height: 16px;
      }
      .message {
        grid-template-columns: 90px calc(100% - 90px);
        .body {
          font-size: 16px;
          line-height: 16px;
        }
      }
    }
  }
}

@media screen and (max-width: 1000px) {
  .tabs {
    .scrollback-control {
      &.has-quickslots {
        bottom: 80px;
      }
    }
    .output {
      &.has-quickslots {
        height: ~"calc(100vh - 123px)";
        &.tabs-hidden {
          height: ~"calc(100vh - 90px)";
        }
      }
    }
  }
}

</style>
