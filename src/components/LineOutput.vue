<template>
  <div id="output" class="output" ref="output" @scroll="onScroll">
    <div v-for="(line, i) in state.output" class="line" v-html="line" :key="`line-${i}`"></div>
    <div v-if="state.scrolledBack" class="scrollback-control" @click="scrollDown()">
      <n-icon><SouthOutlined></SouthOutlined></n-icon>
      More
      <n-icon><SouthOutlined></SouthOutlined></n-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'

import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import { useWindowHandler } from '@/composables/window_handler'

import SouthOutlined from '@vicons/material/SouthOutlined'
import { NIcon } from 'naive-ui'

const output = ref(null)

const { send } = useWebSocket()
const { onResize } = useWindowHandler()

onResize(doOnResize)

let resizeTimeout = null

function doOnResize () {
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

watch(() => state.output.length, () => {
  let { scrollTop, scrollHeight, offsetHeight } = output.value
  let scrolledBack = Math.round(scrollTop + offsetHeight + 5) <= scrollHeight
  if (!scrolledBack) {
    nextTick(() => scrollDown())
  }
})

function scrollDown () {
  output.value.scrollTo(0, output.value.scrollHeight)
}

onMounted(() => {
  output.value.scrollTo(0, output.value.scrollHeight)
  doOnResize()
})

function onScroll () {
  let { scrollTop, scrollHeight, offsetHeight } = output.value
  state.scrolledBack = Math.round(scrollTop + offsetHeight + 5) <= scrollHeight
}
</script>

<style lang="less">
.output {
  height: 100%;
  margin: 5px 10px;
  overflow-y: scroll;
  height: ~"calc(100vh - 45px)";
  position: relative;

  .line {
    font-size: 20px;
    height: 22px;
    line-height: 22px;
    display: block;
    white-space: pre;
    font-weight: normal !important;

    .player-cmd-caret {
      color: #f8ff25;
    }

    .player-cmd {
      color: #fff;
    }
  }
  .scrollback-control {
    position: sticky;
    bottom: 0;
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
}


@media screen and (max-height: 500px) {
  .output {
    .line {
      font-size: 16px;
      height: 16px;
      line-height: 16px;
    }
  }
}

</style>
