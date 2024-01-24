<template>
  <div></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { state } from '@/composables/state'

let gamepadStateLoopPaused = true

function handleMetaKey (ev, keyState) {
  if (ev.key == 'Control' || ev.key == 'Meta') {
    state.metaKeyState.ctrl = keyState
    return true
  }

  if (ev.key == 'Shift') {
    state.metaKeyState.shift = keyState
    return true
  }

  if (ev.key == 'Alt') {
    state.metaKeyState.alt = keyState
    return true
  }

  return false
}

function onKeyDown (ev) {
  if (handleMetaKey(ev, true)) {
    return
  }

  console.log(`onKeyDown code=${ev.code}`)

  let mappings = validMappings({ keyCode: ev.code })
    .filter(m => {
      let binding = m.bindings.find(b => b.keyCode == ev.code && b.modes.includes(state.mode))
      if (binding.ctrl && !state.metaKeyState.ctrl) {
        return false
      }
      if (binding.shift && !state.metaKeyState.shift) {
        return false
      }
      if (binding.alt && !state.metaKeyState.alt) {
        return false
      }
      return true
    })

  if (mappings.length == 0) {
    return
  }

  ev.preventDefault()

  for (let mapping of mappings) {
    console.log(`inputEmitter.emit ${mapping.event} (mode=${state.mode})`)
    state.inputEmitter.emit(mapping.event)
  }
}

function onKeyUp (ev) {
  if (handleMetaKey(ev, false)) {
    return
  }
}

function onGamePadConnected (ev) {
  console.log(`onGamePadConnected ${ev.gamepad.index}`)
  console.log(ev.gamepad)
  state.gamepads[ev.gamepad.index] = ev.gamepad.id.replace(/ \(STANDARD GAMEPAD .*\)/, '')
  gamepadStateLoopPaused = false
  gamepadStateLoop()
}

function onGamePadDisconnected (ev) {
  console.log(`onGamePadDisconnected ${ev.gamepad.index}`)
  delete state.gamepads[ev.gamepad.index]
  if (Object.values(state.gamepads).length == 0) {
    gamepadStateLoopPaused = true
  }
}

function validMappings ({ keyCode, gamepadButton, gamepadButtonReleased, gamepadAxis } = {}) {
  return state.inputMappings.filter(m =>
    m.bindings.find(m => 
      m.modes && m.modes.includes(state.mode) &&
      (
        (keyCode && m.keyCode == keyCode) ||
        (typeof gamepadButton != 'undefined' && m.gamepadButton == gamepadButton) ||
        (typeof gamepadButtonReleased != 'undefined' && m.gamepadButtonReleased == gamepadButtonReleased) ||
        (typeof gamepadAxis != 'undefined' && m.gamepadAxis == gamepadAxis)
      )
    ) &&
    (
      typeof m.inBattle == 'undefined' ||
      (m.inBattle === true && state.gameState.battle.active) ||
      (m.inBattle === false && !state.gameState.battle.active)
    )
  )
}

function gamepadStateLoop () {
  if (gamepadStateLoopPaused || Object.values(state.gamepads).length == 0) {
    return
  }

  const gamepads = navigator.getGamepads()

  for (let index in state.gamepads) {
    let gamepad = gamepads[index]
    let prevState = state.gamepadPrevStates[gamepad.index]
    if (!prevState) {
      prevState = {
        buttons: {},
        axes: { left: false, right: false }
      }
      state.gamepadPrevStates[gamepad.index] = prevState
    }

    for (let i = 0; i < gamepad.buttons.length; i++) {
      let button = gamepad.buttons[i]
      if (button.pressed) {
        if (!prevState.buttons[i]) {          
          prevState.buttons[i] = true

          let mappings = validMappings({ gamepadButton: i })
          for (let mapping of mappings) {
            state.inputEmitter.emit(mapping.event)
          }
        }
      } else {
        if (prevState.buttons[i]) {
          prevState.buttons[i] = false

          let mappings = validMappings({ gamepadButtonReleased: i })
          for (let mapping of mappings) {
            state.inputEmitter.emit(mapping.event)
          }
        }
      }
    }

    if (gamepad.axes.length > 0) {
      if (Math.abs(gamepad.axes[0]) > 0.4 || Math.abs(gamepad.axes[1]) > 0.4) {
        let angle = Math.atan2(gamepad.axes[0], gamepad.axes[1])
        let degree = (angle * 180 / Math.PI) - 180
        if (degree < 0) {
          degree += 360
        }
        prevState.axes.left = degree

        let mappings = validMappings({ gamepadAxis: 'left' })
        for (let mapping of mappings) {
          state.inputEmitter.emit(mapping.event, degree)
        }

      } else if (prevState.axes.left !== false) {
        prevState.axes.left = false

        let mappings = validMappings({ gamepadAxis: 'left' })
        for (let mapping of mappings) {
          state.inputEmitter.emit(mapping.event, false)
        }

      } else if (Math.abs(gamepad.axes[2]) > 0.4 || Math.abs(gamepad.axes[3]) > 0.4) {
        let angle = Math.atan2(gamepad.axes[2], gamepad.axes[3])
        let degree = (angle * 180 / Math.PI) - 180
        if (degree < 0) {
          degree += 360
        }
        prevState.axes.right = degree

        let mappings = validMappings({ gamepadAxis: 'right' })
        for (let mapping of mappings) {
          state.inputEmitter.emit(mapping.event, degree)
        }

      } else if (prevState.axes.right !== false) {
        prevState.axes.right = false

        let mappings = validMappings({ gamepadAxis: 'right' })
        for (let mapping of mappings) {
          state.inputEmitter.emit(mapping.event, false)
        }
      }
    }
  }

  requestAnimationFrame(gamepadStateLoop)
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('gamepadconnected', onGamePadConnected)
  window.addEventListener('gamepaddisconnected', onGamePadDisconnected)

  const gamepads = navigator.getGamepads()
  for (let gamepad of gamepads.filter(gp => gp)) {
    state.gamepads[gamepad.index] = gamepad.id.replace(/ \(STANDARD GAMEPAD .*\)/, '')
  }

  gamepadStateLoopPaused = false

  gamepadStateLoop()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('gamepadconnected', onGamePadConnected)
  window.removeEventListener('gamepaddisconnected', onGamePadDisconnected)

  gamepadStateLoopPaused = true
})
</script>