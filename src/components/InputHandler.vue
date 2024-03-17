<template>
  <div></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { state } from '@/composables/state'

let gamepadStateLoopPaused = true

const axesConfig = [
  {
    axis: 'left',
    xIndex: 0,
    yIndex: 1
  },
  {
    axis: 'right',
    xIndex: 2,
    yIndex: 3
  }
]


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
    return true
  }

  state.inputEmitter.emit('keyCode', ev.code)

  // console.log(`onKeyDown mode=${state.mode} code=${ev.code}`)

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
    // console.log(`inputEmitter.emit ${mapping.event} (mode=${state.mode})`)
    state.inputEmitter.emit(mapping.event)
  }
}

function onKeyUp (ev) {
  if (handleMetaKey(ev, false)) {
    return
  }
}

function onGamePadConnected (ev) {
  // console.log(`onGamePadConnected ${ev.gamepad.index}`)
  // console.log(ev.gamepad)
  state.gamepads[ev.gamepad.index] = ev.gamepad.id.replace(/ \(STANDARD GAMEPAD .*\)/, '')
  gamepadStateLoopPaused = false
  gamepadStateLoop()
}

function onGamePadDisconnected (ev) {
  // console.log(`onGamePadDisconnected ${ev.gamepad.index}`)
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

          state.inputEmitter.emit('gamepadButtonPressed', i)

          let mappings = validMappings({ gamepadButton: i })
          for (let mapping of mappings) {
            state.inputEmitter.emit(mapping.event)
          }
        }
      } else {
        if (prevState.buttons[i]) {
          prevState.buttons[i] = false

          state.inputEmitter.emit('gamepadButtonReleased', i)

          let mappings = validMappings({ gamepadButtonReleased: i })
          for (let mapping of mappings) {
            state.inputEmitter.emit(mapping.event)
          }
        }
      }
    }

    for (let { axis, xIndex, yIndex } of axesConfig) {
      let x = gamepad.axes[xIndex]
      let y = gamepad.axes[yIndex]

      if (Math.abs(x) > 0.4 || Math.abs(y) > 0.4) {
        let angle = Math.atan2(x, y)

        let degree = (angle * 180 / Math.PI) - 180
        if (degree < 0) {
          degree += 360
        }

        prevState.axes[axis] = degree

        state.inputEmitter.emit('gamepadAxis', { axis, degree })

        let mappings = validMappings({ gamepadAxis: axis })
        for (let mapping of mappings) {
          state.inputEmitter.emit(mapping.event, degree)
        }
      } else if (prevState.axes[axis] !== false) {
        prevState.axes[axis] = false

        state.inputEmitter.emit('gamepadAxis', { axis, degree: false })

        let mappings = validMappings({ gamepadAxis: axis })
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