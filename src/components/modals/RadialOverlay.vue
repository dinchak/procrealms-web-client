<template>
  <div class="radial-container" v-show="visible">
    <RadialMenu
      v-for="i in getNumRadials()"
      :key="i"
      :visible="visible"
      :selected-slot="getSelectedSlot(i)"
      :items="getRadialItems(i)"
      :offset-left="(selectedRadial - 1) * 460"
    ></RadialMenu>

    <RadialMenu
      :selected-slot="getSelectedSlot(getNumRadials() + 1)"
      :visible="true"
      :items="getSuggestedCommands()"
      :offset-left="(selectedRadial - 1) * 460"
    ></RadialMenu>
  </div>
</template>
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { state, setMode, prevMode } from '@/static/state'
import { useWebSocket } from '@/composables/web_socket'
import RadialMenu from '@/components/modals/RadialMenu.vue'

const { runCommand } = useWebSocket()

const visible = ref(false)
const selectedSlot = ref(0)
const selectedRadial = ref(1)

function getSelectedSlot (radialNum) {
  if (radialNum == selectedRadial.value) {
    return selectedSlot.value
  }

  return 0
}

function getNumRadials () {
  return Object.keys(state.gameState.radials).length
}

function getRadialItems (radialNum) {
  if (state.gameState.radials[radialNum]) {
    return state.gameState.radials[radialNum]
  }
  return {}
}

function openRadialMenu () {
  visible.value = true
  setMode('radial')
}

function closeRadialMenu () {
  if (!visible.value) {
    return
  }
  visible.value = false
  prevMode()
}

function selectRadialItem (degree) {
  if (degree === false) {
    selectedSlot.value = 0
    return
  }

  let offsetDegree = degree + 15
  if (offsetDegree > 360) {
    offsetDegree -= 360
  }

  let itemNumber = Math.ceil(offsetDegree / 360 * 12)
  selectedSlot.value = itemNumber
}

function performRadialAction () {
  if (selectedSlot.value == 0) {
    return
  }

  let action
  if (selectedRadial.value > getNumRadials()) {
    action = state.suggestedCommands[selectedSlot.value - 1]
  } else {
    action = state.gameState.radials[selectedRadial.value][selectedSlot.value]
  }

  if (!action) {
    return
  }

  runCommand(action)
  state.inputEmitter.emit('closeRadialMenu')
  selectedSlot.value = 0
}

function selectPrevRadialMenu () {
  if (selectedRadial.value <= 1) {
    selectedRadial.value = getNumRadials() + 1
  } else {
    selectedRadial.value--
  }
}

function selectNextRadialMenu () {
  if (selectedRadial.value >= getNumRadials() + 1) {
    selectedRadial.value = 1
  } else {
    selectedRadial.value++
  }
}

function getSuggestedCommands () {
  let items = {}
  for (let i = 1; i <= state.suggestedCommands.length; i++) {
    items[i] = state.suggestedCommands[i - 1]
  }
  return items
}

onMounted(() => {
  state.inputEmitter.on('openRadialMenu', openRadialMenu)
  state.inputEmitter.on('closeRadialMenu', closeRadialMenu)
  state.inputEmitter.on('selectRadialItem', selectRadialItem)
  state.inputEmitter.on('performRadialAction', performRadialAction)
  state.inputEmitter.on('selectPrevRadialMenu', selectPrevRadialMenu)
  state.inputEmitter.on('selectNextRadialMenu', selectNextRadialMenu)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('openRadialMenu', openRadialMenu)
  state.inputEmitter.off('closeRadialMenu', closeRadialMenu)
  state.inputEmitter.off('selectRadialItem', selectRadialItem)
  state.inputEmitter.off('performRadialAction', performRadialAction)
  state.inputEmitter.off('selectPrevRadialMenu', selectPrevRadialMenu)
  state.inputEmitter.off('selectNextRadialMenu', selectNextRadialMenu)
})

</script>
<style scoped lang="less">
.radial-container {
  display: flex;
  flex-direction: row;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  z-index: 4;
  background-color: rgba(0, 40, 60, 0.4);
}
</style>