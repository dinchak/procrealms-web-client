<template>
  <div></div>
</template>

<script setup>
// @ts-check
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { state } from '@/static/state.js'

const watchers = []

const sounds = {
  chat: {
    audio: new Audio('/sounds/com/gossip.mp3'),
    enabled: () => !!state.options.chatSounds,
  },
  newbie: {
    audio: new Audio('/sounds/com/newbie.mp3'),
    enabled: () => !!state.options.chatSounds,
  },
  announce: {
    audio: new Audio('/sounds/com/announcement.mp3'),
    enabled: () => !!state.options.chatSounds,
  },
  tell: {
    audio: new Audio('/sounds/com/tell.mp3'),
    enabled: () => !!state.options.chatSounds,
  }
}

const soundPlayback = name => {
  if (!Object.hasOwn(sounds, name)) {
    return
  }
  if (!sounds[name].enabled()) {
    return
  }
  sounds[name].audio.play().catch(() => {})
}

const processSoundQueue = () => {
  if (!state.soundQueue) {
    return
  }
  soundPlayback(state.soundQueue)
  state.soundQueue = null
}

onMounted(() => {
  watchers.push(watch(() => state.soundQueue, () => processSoundQueue(), { immediate: true }))
})

onBeforeUnmount(() => {
  for (const watcher of watchers) {
    watcher()
  }

  for (const sound of Object.values(sounds)) {
    sound.audio.pause()
    sound.audio.currentTime = 0
  }
})
</script>
