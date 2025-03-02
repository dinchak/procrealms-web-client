<template>
  <div></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { state } from '@/static/state'
import { useWebSocket } from '@/composables/web_socket'

const { runCommand } = useWebSocket()

function attack () {
  runCommand('attack')
}

function defend () {
  runCommand('defend')
}

function flee () {
  runCommand('flee')
}

function battle () {
  runCommand('battle')
}

function harvest () {
  runCommand('harvest')
}

function loot () {
  runCommand('loot')
}

function quickSlot1 () {
  let slot = state.gameState.slots.find(s => s.slot == '1')
  if (slot) {
    runCommand('1')
  }
}

function quickSlot2 () {
  let slot = state.gameState.slots.find(s => s.slot == '2')
  if (slot) {
    runCommand('2')
  }
}

function quickSlot3 () {
  let slot = state.gameState.slots.find(s => s.slot == '3')
  if (slot) {
    runCommand('3')
  }
}

function quickSlot4 () {
  let slot = state.gameState.slots.find(s => s.slot == '4')
  if (slot) {
    runCommand('4')
  }
}

function quickSlot5 () {
  let slot = state.gameState.slots.find(s => s.slot == '5')
  if (slot) {
    runCommand('5')
  }
}

function quickSlot6 () {
  let slot = state.gameState.slots.find(s => s.slot == '6')
  if (slot) {
    runCommand('6')
  }
}

function quickSlot7 () {
  let slot = state.gameState.slots.find(s => s.slot == '7')
  if (slot) {
    runCommand('7')
  }
}

function quickSlot8 () {
  let slot = state.gameState.slots.find(s => s.slot == '8')
  if (slot) {
    runCommand('8')
  }
}

function quickSlot9 () {
  let slot = state.gameState.slots.find(s => s.slot == '9')
  if (slot) {
    runCommand('9')
  }
}

function quickSlot0 () {
  let slot = state.gameState.slots.find(s => s.slot == '0')
  if (slot) {
    runCommand('0')
  }
}

function quickSlotMinus () {
  let slot = state.gameState.slots.find(s => s.slot == '-')
  if (slot) {
    runCommand('-')
  }
}

function quickSlotEquals () {
  let slot = state.gameState.slots.find(s => s.slot == '=')
  if (slot) {
    runCommand('=')
  }
}

onMounted(() => {
  state.inputEmitter.on('attack', attack)
  state.inputEmitter.on('defend', defend)
  state.inputEmitter.on('flee', flee)

  state.inputEmitter.on('battle', battle)
  state.inputEmitter.on('harvest', harvest)
  state.inputEmitter.on('loot', loot)

  state.inputEmitter.on('quickSlot1', quickSlot1)
  state.inputEmitter.on('quickSlot2', quickSlot2)
  state.inputEmitter.on('quickSlot3', quickSlot3)
  state.inputEmitter.on('quickSlot4', quickSlot4)
  state.inputEmitter.on('quickSlot5', quickSlot5)
  state.inputEmitter.on('quickSlot6', quickSlot6)
  state.inputEmitter.on('quickSlot7', quickSlot7)
  state.inputEmitter.on('quickSlot8', quickSlot8)
  state.inputEmitter.on('quickSlot9', quickSlot9)
  state.inputEmitter.on('quickSlot0', quickSlot0)
  state.inputEmitter.on('quickSlotMinus', quickSlotMinus)
  state.inputEmitter.on('quickSlotEqual', quickSlotEquals)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('attack', attack)
  state.inputEmitter.off('defend', defend)
  state.inputEmitter.off('flee', flee)

  state.inputEmitter.off('battle', battle)
  state.inputEmitter.off('harvest', harvest)
  state.inputEmitter.off('loot', loot)

  state.inputEmitter.off('quickSlot1', quickSlot1)
  state.inputEmitter.off('quickSlot2', quickSlot2)
  state.inputEmitter.off('quickSlot3', quickSlot3)
  state.inputEmitter.off('quickSlot4', quickSlot4)
  state.inputEmitter.off('quickSlot5', quickSlot5)
  state.inputEmitter.off('quickSlot6', quickSlot6)
  state.inputEmitter.off('quickSlot7', quickSlot7)
  state.inputEmitter.off('quickSlot8', quickSlot8)
  state.inputEmitter.off('quickSlot9', quickSlot9)
  state.inputEmitter.off('quickSlot0', quickSlot0)
  state.inputEmitter.off('quickSlotMinus', quickSlotMinus)
  state.inputEmitter.off('quickSlotEqual', quickSlotEquals)
})

</script>