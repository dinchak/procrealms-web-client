import { onMounted, onBeforeUnmount } from 'vue'

// import { state } from './state'
const keyState = {
  ctrl: false,
  shift: false,
  alt: false
}

export function useKeyHandler () {
  let keydownHandlers = []
  let keyupHandlers = []
  let handlerAttached = false

  function handleMetaKey (key, state) {
    if (key == 'Control' || key == 'Meta') {
      keyState.ctrl = state
      return true
    }

    if (key == 'Shift') {
      keyState.shift = state
      return true
    }

    if (key == 'Alt') {
      keyState.alt = state
      return true
    }

    return false
  }

  function onKeydown (cb) {
    if (!keydownHandlers.includes(cb)) {
      keydownHandlers.push(cb)
    }
  }

  function _onKeydown (ev) {
    if (handleMetaKey(ev.key, true)) {
      return
    }

    let handled = false

    for (let handler of keydownHandlers) {
      handled = handler(ev) || handled
    }

    if (handled) {
      ev.preventDefault()
    }

    return !handled
  }

  function onKeyup (cb) {
    if (!keyupHandlers.includes(cb)) {
      keyupHandlers.push(cb)
    }
  }

  function _onKeyup (ev) {
    if (handleMetaKey(ev.key, false)) {
      return
    }

    let handled = false

    for (let handler of keyupHandlers) {
      handled = handler(ev) || handled
    }

    if (handled) {
      ev.preventDefault()
    }

    return !handled
  }

  function onWindowFocusBlur () {
    keyState.alt = keyState.ctrl = keyState.shift = false
  }

  onMounted(() => {
    if (handlerAttached) {
      return
    }
    document.addEventListener('keydown', _onKeydown)
    document.addEventListener('keyup', _onKeyup)
    window.addEventListener('focus', onWindowFocusBlur)
    window.addEventListener('blur', onWindowFocusBlur)
    handlerAttached = true
  })

  onBeforeUnmount(() => {
    if (!handlerAttached) {
      return
    }
    document.removeEventListener('keydown', _onKeydown)
    document.removeEventListener('keyup', _onKeyup)
    window.removeEventListener('focus', onWindowFocusBlur)
    window.removeEventListener('blur', onWindowFocusBlur)
    handlerAttached = false
  })

  return {
    onKeydown, onKeyup, keyState
  }
}