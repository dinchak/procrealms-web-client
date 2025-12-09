<template>
  <div class="chat-box">
    <div class="line" v-for="message in state.messages" :key="message.id" v-html-safe="renderMessage(message)">
      <!-- <div class="channel"><span class="black">[</span><span :class="getChannelClass(message.channel)">{{ message.channel }}</span><span class="black">]</span></div>
      <div class="from">{{ message.from }}</div>
      <div class="content" v-html-safe="message.message"></div> -->
    </div>
  </div>
</template>

<script setup>
import { state } from '@/static/state'
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useHelpers } from '@/composables/helpers'

const { renderMessage } = useHelpers()

function scrollDown () {
  const chatBox = document.querySelector('.chat-box')
  if (!chatBox) {
    return
  }

  nextTick(() => {
    chatBox.scrollTop = chatBox.scrollHeight
  })
}


let chatWatcher
onMounted(() => {
  chatWatcher = watch(
    () => {
      return state.messages[state.messages.length - 1] ? state.messages[state.messages.length - 1].id : ''
    },
    () => {
      scrollDown()
    }
  )

  scrollDown()
})

onBeforeUnmount(() => {
  chatWatcher()
})

</script>

<style lang="less" scoped>
.chat-box {
  display: flex;
  flex-direction: column;
  flex-basis: 200px;
  overflow-y: scroll;
  flex-grow: 1;
  height: 110px;
  font-size: 0.8rem;
  .line {
    display: block;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>