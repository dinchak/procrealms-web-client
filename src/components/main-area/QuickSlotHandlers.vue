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

function quickSlotEqual () {
  let slot = state.gameState.slots.find(s => s.slot == '=')
  if (slot) {
    runCommand('=')
  }
}

function quickSlotCtrl1 () {
  let slot = state.gameState.slots.find(s => s.slot == 'c1')
  if (slot) {
    runCommand('c1')
  }
}

function quickSlotCtrl2 () {
  let slot = state.gameState.slots.find(s => s.slot == 'c2')
  if (slot) {
    runCommand('c2')
  }
}

function quickSlotCtrl3 () {
  let slot = state.gameState.slots.find(s => s.slot == 'c3')
  if (slot) {
    runCommand('c3')
  }
}

function quickSlotCtrl4 () {
  let slot = state.gameState.slots.find(s => s.slot == 'c4')
  if (slot) {
    runCommand('c4')
  }
}

function quickSlotCtrl5 () {
  let slot = state.gameState.slots.find(s => s.slot == 'c5')
  if (slot) {
    runCommand('c5')
  }
}

function quickSlotCtrl6 () {
  let slot = state.gameState.slots.find(s => s.slot == 'c6')
  if (slot) {
    runCommand('c6')
  }
}

function quickSlotCtrl7 () {
  let slot = state.gameState.slots.find(s => s.slot == 'c7')
  if (slot) {
    runCommand('c7')
  }
}

function quickSlotCtrl8 () {
  let slot = state.gameState.slots.find(s => s.slot == 'c8')
  if (slot) {
    runCommand('c8')
  }
}

function quickSlotCtrl9 () {
  let slot = state.gameState.slots.find(s => s.slot == 'c9')
  if (slot) {
    runCommand('c9')
  }
}

function quickSlotCtrl0 () {
  let slot = state.gameState.slots.find(s => s.slot == 'c0')
  if (slot) {
    runCommand('c0')
  }
}

function quickSlotCtrlMinus () {
  let slot = state.gameState.slots.find(s => s.slot == 'c-')
  if (slot) {
    runCommand('c-')
  }
}

function quickSlotCtrlEqual () {
  let slot = state.gameState.slots.find(s => s.slot == 'c=')
  if (slot) {
    runCommand('c=')
  }
}

function quickSlotAlt1 () {
  let slot = state.gameState.slots.find(s => s.slot == 'a1')
  if (slot) {
    runCommand('a1')
  }
}

function quickSlotAlt2 () {
  let slot = state.gameState.slots.find(s => s.slot == 'a2')
  if (slot) {
    runCommand('a2')
  }
}

function quickSlotAlt3 () {
  let slot = state.gameState.slots.find(s => s.slot == 'a3')
  if (slot) {
    runCommand('a3')
  }
}

function quickSlotAlt4 () {
  let slot = state.gameState.slots.find(s => s.slot == 'a4')
  if (slot) {
    runCommand('a4')
  }
}

function quickSlotAlt5 () {
  let slot = state.gameState.slots.find(s => s.slot == 'a5')
  if (slot) {
    runCommand('a5')
  }
}

function quickSlotAlt6 () {
  let slot = state.gameState.slots.find(s => s.slot == 'a6')
  if (slot) {
    runCommand('a6')
  }
}

function quickSlotAlt7 () {
  let slot = state.gameState.slots.find(s => s.slot == 'a7')
  if (slot) {
    runCommand('a7')
  }
}

function quickSlotAlt8 () {
  let slot = state.gameState.slots.find(s => s.slot == 'a8')
  if (slot) {
    runCommand('a8')
  }
}

function quickSlotAlt9 () {
  let slot = state.gameState.slots.find(s => s.slot == 'a9')
  if (slot) {
    runCommand('a9')
  }
}

function quickSlotAlt0 () {
  let slot = state.gameState.slots.find(s => s.slot == 'a0')
  if (slot) {
    runCommand('a0')
  }
}

function quickSlotAltMinus () {
  let slot = state.gameState.slots.find(s => s.slot == 'a-')
  if (slot) {
    runCommand('a-')
  }
}

function quickSlotAltEqual () {
  let slot = state.gameState.slots.find(s => s.slot == 'a=')
  if (slot) {
    runCommand('a=')
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
  state.inputEmitter.on('quickSlotEqual', quickSlotEqual)

  state.inputEmitter.on('quickSlotCtrl1', quickSlotCtrl1)
  state.inputEmitter.on('quickSlotCtrl2', quickSlotCtrl2)
  state.inputEmitter.on('quickSlotCtrl3', quickSlotCtrl3)
  state.inputEmitter.on('quickSlotCtrl4', quickSlotCtrl4)
  state.inputEmitter.on('quickSlotCtrl5', quickSlotCtrl5)
  state.inputEmitter.on('quickSlotCtrl6', quickSlotCtrl6)
  state.inputEmitter.on('quickSlotCtrl7', quickSlotCtrl7)
  state.inputEmitter.on('quickSlotCtrl8', quickSlotCtrl8)
  state.inputEmitter.on('quickSlotCtrl9', quickSlotCtrl9)
  state.inputEmitter.on('quickSlotCtrl0', quickSlotCtrl0)
  state.inputEmitter.on('quickSlotCtrlMinus', quickSlotCtrlMinus)
  state.inputEmitter.on('quickSlotCtrlEqual', quickSlotCtrlEqual)

  state.inputEmitter.on('quickSlotAlt1', quickSlotAlt1)
  state.inputEmitter.on('quickSlotAlt2', quickSlotAlt2)
  state.inputEmitter.on('quickSlotAlt3', quickSlotAlt3)
  state.inputEmitter.on('quickSlotAlt4', quickSlotAlt4)
  state.inputEmitter.on('quickSlotAlt5', quickSlotAlt5)
  state.inputEmitter.on('quickSlotAlt6', quickSlotAlt6)
  state.inputEmitter.on('quickSlotAlt7', quickSlotAlt7)
  state.inputEmitter.on('quickSlotAlt8', quickSlotAlt8)
  state.inputEmitter.on('quickSlotAlt9', quickSlotAlt9)
  state.inputEmitter.on('quickSlotAlt0', quickSlotAlt0)
  state.inputEmitter.on('quickSlotAltMinus', quickSlotAltMinus)
  state.inputEmitter.on('quickSlotAltEqual', quickSlotAltEqual)
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
  state.inputEmitter.off('quickSlotEqual', quickSlotEqual)

  state.inputEmitter.off('quickSlotCtrl1', quickSlotCtrl1)
  state.inputEmitter.off('quickSlotCtrl2', quickSlotCtrl2)
  state.inputEmitter.off('quickSlotCtrl3', quickSlotCtrl3)
  state.inputEmitter.off('quickSlotCtrl4', quickSlotCtrl4)
  state.inputEmitter.off('quickSlotCtrl5', quickSlotCtrl5)
  state.inputEmitter.off('quickSlotCtrl6', quickSlotCtrl6)
  state.inputEmitter.off('quickSlotCtrl7', quickSlotCtrl7)
  state.inputEmitter.off('quickSlotCtrl8', quickSlotCtrl8)
  state.inputEmitter.off('quickSlotCtrl9', quickSlotCtrl9)
  state.inputEmitter.off('quickSlotCtrl0', quickSlotCtrl0)
  state.inputEmitter.off('quickSlotCtrlMinus', quickSlotCtrlMinus)
  state.inputEmitter.off('quickSlotCtrlEqual', quickSlotCtrlEqual)

  state.inputEmitter.off('quickSlotAlt1', quickSlotAlt1)
  state.inputEmitter.off('quickSlotAlt2', quickSlotAlt2)
  state.inputEmitter.off('quickSlotAlt3', quickSlotAlt3)
  state.inputEmitter.off('quickSlotAlt4', quickSlotAlt4)
  state.inputEmitter.off('quickSlotAlt5', quickSlotAlt5)
  state.inputEmitter.off('quickSlotAlt6', quickSlotAlt6)
  state.inputEmitter.off('quickSlotAlt7', quickSlotAlt7)
  state.inputEmitter.off('quickSlotAlt8', quickSlotAlt8)
  state.inputEmitter.off('quickSlotAlt9', quickSlotAlt9)
  state.inputEmitter.off('quickSlotAlt0', quickSlotAlt0)
  state.inputEmitter.off('quickSlotAltMinus', quickSlotAltMinus)
  state.inputEmitter.off('quickSlotAltEqual', quickSlotAltEqual)
})

</script>