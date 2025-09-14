<template>
  <div v-if="false"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { state } from '@/static/state'

let gamepadStateLoopPaused = true
let windowHasFocus = true

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
  if (ev.key == 'Control') {
    state.metaKeyState.ctrl = keyState
    return true
  }

  if (ev.key == 'Meta') {
    state.metaKeyState.meta = keyState
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
  if (!windowHasFocus) {
    return
  }

  if (handleMetaKey(ev, true)) {
    return true
  }

  state.inputEmitter.emit('keyCode', ev.code)

  let mappings = validMappings({ keyCode: ev.code, metaKeyState: state.metaKeyState })
  if (mappings.length == 0) {
    return false
  }

  ev.preventDefault()

  for (let mapping of mappings) {
    state.inputEmitter.emit(mapping.event)
  }
}

function onKeyUp (ev) {
  if (!windowHasFocus) {
    return
  }
  handleMetaKey(ev, false)
}

function onGamePadConnected (ev) {
  state.gamepads[ev.gamepad.index] = ev.gamepad.id.replace(/ \(STANDARD GAMEPAD .*\)/, '')
  // Only start processing gamepad input if window is focused
  if (!windowHasFocus || !state.options.gamepadEnabled) {
    return
  }

  gamepadStateLoopPaused = false
  gamepadStateLoop()
}

function onGamePadDisconnected (ev) {
  delete state.gamepads[ev.gamepad.index]
  if (Object.values(state.gamepads).length == 0) {
    gamepadStateLoopPaused = true
  }
}

function validMappings ({ keyCode, metaKeyState, gamepadButton, gamepadButtonReleased, gamepadAxis } = {}) {
  return state.inputMappings.filter(map =>
    map.bindings.find(m =>
      m.modes && m.modes.includes(state.mode) && (
        (
          keyCode && m.keyCode == keyCode &&
          metaKeyState.shift == !!m.shift &&
          metaKeyState.ctrl == !!m.ctrl &&
          metaKeyState.alt == !!m.alt
        ) || (
          typeof gamepadButton != 'undefined' &&
          m.gamepadButton == gamepadButton
        ) || (
          typeof gamepadButtonReleased != 'undefined' &&
          m.gamepadButtonReleased == gamepadButtonReleased
        ) || (
          typeof gamepadAxis != 'undefined' &&
          m.gamepadAxis == gamepadAxis
        )
      )) && (
      typeof map.inBattle == 'undefined' ||
        (map.inBattle === true && state.gameState.battle.active) ||
        (map.inBattle === false && !state.gameState.battle.active)
    )
  )
}

function gamepadStateLoop () {
  if (
    gamepadStateLoopPaused ||
    Object.values(state.gamepads).length == 0 ||
    !windowHasFocus ||
    !state.options.gamepadEnabled
  ) {
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
      } else if (prevState.buttons[i]) {
        prevState.buttons[i] = false

        state.inputEmitter.emit('gamepadButtonReleased', i)

        let mappings = validMappings({ gamepadButtonReleased: i })
        for (let mapping of mappings) {
          state.inputEmitter.emit(mapping.event)
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

function removeEventListeners () {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('gamepadconnected', onGamePadConnected)
  window.removeEventListener('gamepaddisconnected', onGamePadDisconnected)
  window.removeEventListener('focus', onFocus)
  window.removeEventListener('blur', onBlur)
}

function onFocus () {
  windowHasFocus = true
  // resume gamepad loop if there are gamepads connected
  if (Object.values(state.gamepads).length > 0) {
    gamepadStateLoopPaused = false
    gamepadStateLoop()
  }
}

function onBlur () {
  windowHasFocus = false
  gamepadStateLoopPaused = true
}

onMounted(() => {
  removeEventListeners()

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('gamepadconnected', onGamePadConnected)
  window.addEventListener('gamepaddisconnected', onGamePadDisconnected)
  window.addEventListener('focus', onFocus)
  window.addEventListener('blur', onBlur)

  windowHasFocus = document.hasFocus()

  const gamepads = navigator.getGamepads()
  for (let gamepad of gamepads.filter(gp => gp)) {
    state.gamepads[gamepad.index] = gamepad.id.replace(/ \(STANDARD GAMEPAD .*\)/, '')
  }

  if (windowHasFocus && Object.values(state.gamepads).length > 0) {
    gamepadStateLoopPaused = false
    gamepadStateLoop()
  }
})

onBeforeUnmount(() => {
  removeEventListeners()
  gamepadStateLoopPaused = true
})
</script>