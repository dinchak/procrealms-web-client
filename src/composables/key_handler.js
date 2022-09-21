import { onMounted, onBeforeUnmount } from 'vue'

// import { state } from './state'



export function useKeyHandler () {
  let keydownHandlers = []
  let keyupHandlers = []
  let handlerAttached = false

  function onKeydown (cb) {
    if (!keydownHandlers.includes(cb)) {
      keydownHandlers.push(cb)
    }
  }

  function _onKeydown (ev) {
    for (let handler of keydownHandlers) {
      handler(ev)
    }
  }

  function onKeyup (cb) {
    if (!keyupHandlers.includes(cb)) {
      keyupHandlers.push(cb)
    }
  }

  function _onKeyup (ev) {
    for (let handler of keyupHandlers) {
      handler(ev)
    }
  }

  onMounted(() => {
    if (handlerAttached) {
      return
    }
    document.addEventListener('keydown', _onKeydown)
    document.addEventListener('keyup', _onKeyup)
    handlerAttached = true
  })

  onBeforeUnmount(() => {
    if (!handlerAttached) {
      return
    }
    document.removeEventListener('keydown', _onKeydown)
    document.removeEventListener('keyup', _onKeyup)
    handlerAttached = false
  })

  return {
    onKeydown, onKeyup
  }
}