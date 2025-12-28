<template>
  <GameModal
    v-model="state.modals.chatModal"
    title="Chat"
    modal-class="chat-modal"
    modal-key="chatModal"
    :show-mini-output="false"
    @opened="onModalOpened"
    @closed="onModalClosed"
  >
    <div class="chat-container">
      <div class="channels">
        <div
          :class="getChannelClass(channel)"
          v-for="channel in getChannels()"
          :key="channel.name + (channel.from ? `-${channel.from}` : '')"
          @click="selectChannel(channel)"
        >
          <div class="channel-label">{{ channel.label }}</div>
          <NBadge :value="getUnseenMessageCount(channel)" :max="99"></NBadge>
        </div>
      </div>

      <div class="chat-output">
        <div class="messages">
          <div
            class="message"
            v-for="message in getMessages()"
            :key="message.id"
            v-html-safe="getMessageText(message)"
          ></div>
        </div>

        <KeyboardInput
          :focus-mode="'modal-input'"
          :active-modes="['modal', 'modal-input']"
          :placeholder="'Send ' + selectedChannel.label + ' message'"
          :command-prefix="getChannelPrefix()"
        ></KeyboardInput>
      </div>

    </div>

  </GameModal>
</template>
<script setup>
import { ref, nextTick, watch } from 'vue'
import { NBadge } from 'naive-ui'
import { state } from '@/static/state'
import { CHANNELS } from '@/static/constants'

import GameModal from '@/components/modals/GameModal.vue'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'

import { useHelpers } from '@/composables/helpers'
const { ansiToHtml, getTellMessageFrom } = useHelpers()

let selectedChannel = ref(CHANNELS[0])
let watchers = []

function getChannels () {
  let channels = CHANNELS.filter(c => !c.hideByDefault)

  let tellChannels = []
  for (let message of state.messages.filter(m => m.channel === 'tell')) {
    let tellFrom = getTellMessageFrom(message)
    if (!tellChannels.includes(tellFrom)) {
      tellChannels.push(tellFrom)
      channels.push({
        name: 'tell',
        from: tellFrom,
        label: tellFrom,
        color: 'bold-magenta'
      })
    }
  }

  return channels
}

function getChannelClass (channel) {
  let classes = ['channel']
  if (channel.name === selectedChannel.value.name) {
    if (channel.name === 'tell' && channel.from) {
      if (selectedChannel.value.from === channel.from) {
        classes.push('selected')
        classes.push(channel.color)
      }
    } else {
      classes.push('selected')
      classes.push(channel.color)
    }
  }
  return classes.join(' ')
}

function getChannelPrefix () {
  let prefix = selectedChannel.value.name
  if (prefix === 'tell' && selectedChannel.value.from) {
    prefix += ` ${selectedChannel.value.from}`
  }
  return prefix + ' '
}

function getMessageText (message) {
  let channel = CHANNELS.find(c => c.name == message.channel)
  return `<span class="${channel.color}">${message.from}</span> ${ansiToHtml(message.message)}`
}

function getMessages () {
  if (!selectedChannel.value) {
    return []
  }

  let messages = state.messages.filter(m => m.channel === selectedChannel.value.name)
  if (selectedChannel.value.name === 'tell' && selectedChannel.value.from) {
    messages = messages.filter(m => m.from === selectedChannel.value.from || m.to === selectedChannel.value.from)
  }

  return messages
}

function getUnseenMessageCount (channel) {
  let channelKey = channel.name
  if (channel.name === 'tell' && channel.from) {
    channelKey = `tell-${channel.from}`
  }
  return state.unseenMessageCount[channelKey] || 0
}

function selectChannel (channelName) {
  selectedChannel.value = channelName
  scrollToBottom()
  markMessagesSeen()
}

function markMessagesSeen () {
  let messages = getMessages()

  messages.filter(m => m.unseen).forEach(m => {
    m.unseen = false
    let channelKey = m.channel
    if (channelKey === 'tell') {
      channelKey = getTellMessageFrom(m)
      channelKey = `tell-${channelKey}`
    }

    if (state.unseenMessageCount[channelKey] > 0) {
      state.unseenMessageCount[channelKey]--
    }
  })
}

function scrollToBottom () {
  nextTick(() => {
    let container = document.querySelector('.chat-output .messages')
    container.scrollTop = container.scrollHeight
  })
}

function selectNextChannel () {
  const channels = getChannels()
  let currentIndex = channels.findIndex(c => c.name === selectedChannel.value.name && c.from === selectedChannel.value.from)
  let nextIndex = (currentIndex + 1) % channels.length
  selectedChannel.value = channels[nextIndex]
  scrollToBottom()
  markMessagesSeen()
}

function selectPrevChannel () {
  const channels = getChannels()
  let currentIndex = channels.findIndex(c => c.name === selectedChannel.value.name && c.from === selectedChannel.value.from)
  let prevIndex = (currentIndex - 1 + channels.length) % channels.length
  selectedChannel.value = channels[prevIndex]
  scrollToBottom()
  markMessagesSeen()
}

function onModalOpened () {
  state.inputEmitter.on('prevChannel', selectPrevChannel)
  state.inputEmitter.on('nextChannel', selectNextChannel)
  scrollToBottom()
  markMessagesSeen()
  watchers.push(
    watch(
      () => state.messages.length,
      () => {
        scrollToBottom()
        markMessagesSeen()
      }
    )
  )
}

function onModalClosed () {
  state.inputEmitter.off('prevChannel', selectPrevChannel)
  state.inputEmitter.off('nextChannel', selectNextChannel)
  watchers.forEach(w => w())
}
</script>
<style lang="less" scoped>
.chat-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;

  .channels {
    width: 150px;
    border-right: 1px solid #333;
    display: flex;
    flex-direction: column;
    gap: 5px;

    .channel {
      padding: 10px;
      cursor: pointer;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0);
      margin-right: -1px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 18px;

      &.selected {
        background-color: #063603;
        border-left: 1px solid #16c60c;
        border-top: 1px solid #16c60c;
        border-bottom: 1px solid #16c60c;
      }

      &:hover {
        background-color: #333;
        &.selected {
          background-color: #063603;
        }
      }

      .unseen-count {
        background-color: #e03e3e;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 0.8rem;
        font-weight: bold;
      }
    }
  }

  .chat-output {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    margin-top: 40px;
    padding: 0 0 0 10px;
    width: 100%;
    .messages {
      flex-grow: 1;
      overflow-y: auto;
      width: 100%;
      height: calc(100vh - 90px);
      .message {
        margin-bottom: 5px;
        width: 100%;
      }
    }
  }

}
</style>