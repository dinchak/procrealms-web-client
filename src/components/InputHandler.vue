<template>
  <div></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { state } from '@/composables/state'

let stopLoop = true

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

  for (let mapping of validMappings().filter(m => m.keyCodes)) {
    for (let code of mapping.keyCodes) {
      if (typeof code == 'string') {
        if (state.metaKeyState.alt || state.metaKeyState.ctrl) {
          continue
        }
        if (code != ev.code) {
          continue
        }
      } else {
        if (code.code != ev.code) {
          continue
        }
        if (typeof code.ctrl != 'undefined' && code.ctrl != state.metaKeyState.ctrl) {
          continue
        }
        if (typeof code.shift != 'undefined' && code.shift != state.metaKeyState.shift) {
          continue
        }
        if (typeof code.alt != 'undefined' && code.alt != state.metaKeyState.alt) {
          continue
        }
      }

      console.log(`inputEmitter.emit ${mapping.event} (mode=${state.mode})`)
      state.inputEmitter.emit(mapping.event)
      ev.preventDefault()

      if (mapping.stopLoop) {
        return
      }
    }
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
  stopLoop = false
  gamepadStateLoop()
}

function onGamePadDisconnected (ev) {
  console.log(`onGamePadDisconnected ${ev.gamepad.index}`)
  delete state.gamepads[ev.gamepad.index]
  if (Object.values(state.gamepads).length == 0) {
    stopLoop = true
  }
}

function validMappings () {
  return state.inputMappings.filter(m =>
    (!m.modes || m.modes.includes(state.mode)) &&
    (
      typeof m.inBattle == 'undefined' ||
      (m.inBattle === true && state.gameState.battle.active) ||
      (m.inBattle === false && !state.gameState.battle.active)
    )
  )
}

function gamepadStateLoop () {
  if (Object.values(state.gamepads).length == 0 || stopLoop) {
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
          console.log(`gamepad button pressed: ${i} (mode=${state.mode})`)
          prevState.buttons[i] = true

          let mappings = validMappings().filter(m =>
            m.gamepadButtons && m.gamepadButtons.includes(i)
          )

          for (let mapping of mappings) {
            console.log(`inputEmitter.emit ${mapping.event} (mode=${state.mode})`)
            state.inputEmitter.emit(mapping.event)
          }
        }
      } else {
        if (prevState.buttons[i]) {
          console.log(`gamepad button released: ${i} (mode=${state.mode})`)
          prevState.buttons[i] = false

          let mappings = validMappings().filter(m =>
            m.gamepadButtonsReleased && m.gamepadButtonsReleased.includes(i)
          )

          for (let mapping of mappings) {
            console.log(`inputEmitter.emit ${mapping.event} (mode=${state.mode})`)
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

        // console.log(`pressed: ${degree}`)

        prevState.axes.left = degree

        let mappings = validMappings().filter(m =>
          m.axis && m.axis == 'left'
        )

        // console.log(`gamepad left stick pressed: ${degree} (mode=${state.mode})`)
        for (let mapping of mappings) {
          // console.log(`inputEmitter.emit ${mapping.event} (mode=${state.mode})`)
          state.inputEmitter.emit(mapping.event, degree)
        }
      } else {
        if (prevState.axes.left !== false) {
          // console.log(`released`)
          prevState.axes.left = false
          let mappings = validMappings().filter(m =>
            m.axis && m.axis == 'left'
          )

          for (let mapping of mappings) {
            // console.log(`inputEmitter.emit ${mapping.event} false (mode=${state.mode})`)
            state.inputEmitter.emit(mapping.event, false)
          }
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

  stopLoop = false

  gamepadStateLoop()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('gamepadconnected', onGamePadConnected)
  window.removeEventListener('gamepaddisconnected', onGamePadDisconnected)

  stopLoop = true
})
</script>