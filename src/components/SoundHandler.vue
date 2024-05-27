<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { state } from '@/static/state.js'

const watchers = []

const sounds = {
  chat: {
    audio: new Audio('http://proceduralrealms.com:8080/sounds/com/info.mp3'),
    enabled: () => !!state.options.chatSounds,
  },
  newbie: {
    audio: new Audio('http://proceduralrealms.com:8080/sounds/com/newbie.mp3'),
    enabled: () => !!state.options.chatSounds,
  },
  announce: {
    audio: new Audio('http://proceduralrealms.com:8080/sounds/com/announcement.mp3'),
    enabled: () => !!state.options.chatSounds,
  },
  tell: {
    audio: new Audio('http://proceduralrealms.com:8080/sounds/com/gossip.mp3'),
    enabled: () => !!state.options.chatSounds,
  }
}

const soundPlayback = (name) => {
  if (!(name in sounds)) return;
  if (!sounds[name].enabled()) return;
  sounds[name].audio.play();
}

const processSoundQueue = () => {
  if (!state.soundQueue) return;
  soundPlayback(state.soundQueue)
  state.soundQueue = null;
}

onMounted(() => {
  watchers.push(watch(() => state.soundQueue, () => processSoundQueue()))
});

onBeforeUnmount(() => {
  for (const watcher of watchers) {
    watcher()
  }
});
</script>

<template />

<style scoped lang="less">

</style>