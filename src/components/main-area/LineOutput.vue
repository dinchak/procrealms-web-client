<template>

  <n-tabs class="tabs" ref="tabsInstance" v-model:value="currentPane" @before-leave="onBeforeChangeTab" @update:value="onAfterChangeTab" :bar-width="20">
    <n-tab-pane name="output" tab="Main" display-directive="show">
      <div id="output" :class="getOutputClass()" ref="output" @scroll="onScroll('output')">
        <div v-for="(line, i) in state.output" class="line" v-html-safe="line" :key="`line-${i}`" @click="lineClick" @mouseover="lineMouseover" @mouseleave="lineMouseleave"></div>
        <BattleStatus v-if="state.gameState.battle.active"></BattleStatus>
      </div>
      <div v-show="state.scrolledBack.output" :class="getScrollbackControlClass()" @click="scrollDown('output')">
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
        More
        <n-icon><SouthOutlined></SouthOutlined></n-icon>
      </div>
    </n-tab-pane>

    <n-tab-pane name="chat" :tab="getTab('chat')" display-directive="show">
      <div id="chat" class="output" ref="chat" @scroll="onScroll('chat')">
        <div v-for="(line, i) in state.chat" class="message" :key="`line-${i}`">
          <div class="from">
            <div class="name bold-yellow">{{ line.from }}</div>
            <div class="timestamp black">{{ getTimeSince(line.timestamp) }}</div>
          </div>
          <div class="body bold-white" v-html-safe="line.message"></div>
        </div>
      </div>
      <div v-show="state.scrolledBack.chat" :class="getScrollbackControlClass()" @click="scrollDown('chat')">
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
          <div class="body bold-white" v-html-safe="line.message"></div>
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
          <div class="body bold-white" v-html-safe="line.message"></div>
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

import { ref, watch, nextTick, onMounted, onBeforeUnmount, h } from 'vue'

import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import { useWindowHandler } from '@/composables/window_handler'

import BattleStatus from '@/components/main-area/BattleStatus.vue'

import SouthOutlined from '@vicons/material/SouthOutlined'
import { NIcon, NTabs, NTabPane, NBadge, NSpace } from 'naive-ui'

const output = ref(null)
const chat = ref(null)
const trade = ref(null)
const newbie = ref(null)
const tabsInstance = ref(null)
const currentPane = ref("output") // chat, trade, or newbie
const refs = { output, chat, trade, newbie }

const { send, cmd } = useWebSocket()
const { onResize, calcTerminalSize } = useWindowHandler()

let mapWasOpen = false
let resizeTimeout = null

function doResize () {
  if (resizeTimeout) {
    return
  }

  resizeTimeout = setTimeout(() => {
    if (!output.value) {
      return
    }

    let { width, height } = calcTerminalSize(output.value.offsetWidth, output.value.offsetHeight)

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
  if (['chat', 'trade', 'newbie'].includes(activeName)) {
    state[activeName].forEach(msg => msg.unread = false)
  }
  state.activeTab = activeName
  // Hide Map Modal on chat tabs
  if (activeName !== "output" && state.modals.mapModal == true) {
    mapWasOpen = true
    state.modals.mapModal = false
  }
  return true
}

function onAfterChangeTab (activeName) {
  setTimeout(() => {
    scrollDown(activeName)
  })
  // Show Map Modal on output tab if it was open before
  if (activeName == "output" && mapWasOpen == true) {
    mapWasOpen = false
    state.modals.mapModal = true
  }
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
  if (state.options.showQuickSlots && (state.gameState.slots.length > 0 || state.options.hideSidebar)) {
    cls += ' show-quickslots'
  }
  if (state.gameState.battle.active) {
    cls += ' in-battle'
  }
  // if (!state.options.showTabs) {
  //   cls += ' tabs-hidden'
  // }
  return cls
}

// function doHideShowTabs () {
//   let tabNav = document.getElementsByClassName('n-tabs-nav')
//   if (tabNav[0]) {
//     let classes = tabNav[0].className.split(' ')
//     if (!state.options.showTabs) {
//       classes.push('hide')
//     } else {
//       classes = classes.filter(cls => cls != 'hide')
//     }
//     tabNav[0].className = classes.join(' ')
//   }
// }

function getScrollbackControlClass () {
  let cls = 'scrollback-control'
  if (state.options.showQuickSlots && state.gameState.slots.length > 0) {
    cls += ' show-quickslots'
  }
  if (state.gameState.battle.active) {
    cls += ' in-battle'
  }
  return cls
}

function lineClick (ev) {
  const el = ev.srcElement
  if (el.style['text-decoration-line']) {
    cmd(el.innerText)
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
  onBeforeChangeTab("output")
  currentPane.value = "output"
  state.activeTab = "output"
  nextTick(() => tabsInstance.value?.syncBarPosition())
  onAfterChangeTab(currentPane.value)
}

function selectChatTab () {
  onBeforeChangeTab("chat")
  currentPane.value = "chat"
  state.activeTab = "chat"
  nextTick(() => tabsInstance.value?.syncBarPosition())
  onAfterChangeTab(currentPane.value)
}

function selectTradeTab () {
  onBeforeChangeTab("trade")
  currentPane.value = "trade"
  state.activeTab = "trade"
  nextTick(() => tabsInstance.value?.syncBarPosition())
  onAfterChangeTab(currentPane.value)
}

function selectNewbieTab () {
  onBeforeChangeTab("newbie")
  currentPane.value = "newbie"
  state.activeTab = "newbie"
  nextTick(() => tabsInstance.value?.syncBarPosition())
  onAfterChangeTab(currentPane.value)
}

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
  // doHideShowTabs()

  state.inputEmitter.on('selectOutputTab', selectOutputTab)
  state.inputEmitter.on('selectChatTab', selectChatTab)
  state.inputEmitter.on('selectTradeTab', selectTradeTab)
  state.inputEmitter.on('selectNewbieTab', selectNewbieTab)

  watch(() => state.output.length, () => onChanged('output'))
  watch(() => state.gameState.battle.active, () => onChanged('output'))
  watch(() => state.chat.length, () => onChanged('chat'))
  watch(() => state.trade.length, () => onChanged('trade'))
  watch(() => state.newbie.length, () => onChanged('newbie'))
  // watch(() => state.options.showTabs, () => doHideShowTabs())
  watch(() => state.options.hideSidebar, () => doResize())
})

onBeforeUnmount(() => {
  state.inputEmitter.off('selectOutputTab', selectOutputTab)
  state.inputEmitter.off('selectChatTab', selectChatTab)
  state.inputEmitter.off('selectTradeTab', selectTradeTab)
  state.inputEmitter.off('selectNewbieTab', selectNewbieTab)
})

</script>

<style lang="less">
.content-area {
  .n-tabs {
    .n-tab-pane {
      padding: 0;
    }
  }
}

.tabs {
  .n-tabs-nav {
    margin: 0 10px;
    &.hide {
      display: none;
    }
  }

  .scrollback-control {
    position: absolute;
    bottom: 182px;
    left: 0;
    right: 0;
    height: 40px;
    line-height: 40px;
    width: 100%;
    background-color: rgba(20, 80, 20, 0.4);
    font-size: 1.5rem;
    text-align: center;
    cursor: pointer;
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
    &.show-quickslots {
      bottom: 227px;
    }
    &.in-battle {
      bottom: 37px;
      &.show-quickslots {
        bottom: 93px;
      }
    }
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

  .output {
    display: flex;
    flex-direction: column;
    flex-basis: fit-content;
    margin: 5px 10px 0 10px;
    position: relative;
    overflow-y: scroll;
    overflow-x: hidden;
    height: ~"calc(100vh - 215px)";

    // &.tabs-hidden {
    //   height: ~"calc(100vh - 142px)";
    // }

    &.show-quickslots {
      height: ~"calc(100vh - 270px)";
      // &.tabs-hidden {
      //   height: ~"calc(100vh - 187px)";
      // }
    }

    &.in-battle {
      height: ~"calc(100vh - 75px)";
      &.show-quickslots {
        height: ~"calc(100vh - 130px)";
      }
    }

    .line {
      font-size: 1rem;
      line-height: 1.2rem;
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
        font-size: 1.2rem;
        line-height: 1.2rem;
        margin-left: 10px;
      }
    }
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

// @media screen and (max-width: 750px) {
//   .tabs {
//     .output {
//       margin: 2px 8px;
//       height: ~"calc(100vh - 96px)";

//       &.tabs-hidden {
//         height: ~"calc(100vh - 63px)";
//       }

//       &.show-quickslots {
//         height: ~"calc(100vh - 141px)";
//         &.tabs-hidden {
//           height: ~"calc(100vh - 108px)";
//         }
//       }

//     }
//   }
// }
</style>
