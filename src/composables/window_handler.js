import { onMounted, onBeforeUnmount } from 'vue'
import { state } from './state'

let resizeHandlers = []

export function useWindowHandler () {

  function onResize (cb) {
    if (!resizeHandlers.includes(cb)) {
      resizeHandlers.push(cb)
    }
  }

  function triggerResize (ev) {
    for (let handler of resizeHandlers) {
      handler(ev)
    }
  }

  function calcTerminalSize (outputWidth, outputHeight) {
    let output = document.getElementById('output')
    if (!output) {
      return { width: 80, height: 25 }
    }

    let outputStyle = getComputedStyle(output.querySelector('.line'))

    let canvas = calcTerminalSize.canvas || (calcTerminalSize.canvas = document.createElement("canvas"))
    let context = canvas.getContext("2d")
    context.font = outputStyle.fontSize + ' ' + outputStyle.fontFamily

    let charWidth = context.measureText('-').width
    let charHeight = Number(outputStyle.lineHeight.replace('px', ''))

    let width = Math.floor(outputWidth  / charWidth)
    let height = Math.floor(outputHeight  / charHeight)

    return { width, height }
  }

  function onWindowFocusBlur () {
    state.metaKeyState.alt = state.metaKeyState.ctrl = state.metaKeyState.shift = false
  }

  onMounted(() => {
    window.addEventListener('resize', triggerResize)
    window.addEventListener('focus', onWindowFocusBlur)
    window.addEventListener('blur', onWindowFocusBlur)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', triggerResize)
    window.removeEventListener('focus', onWindowFocusBlur)
    window.removeEventListener('blur', onWindowFocusBlur)
  })

  return { onResize, triggerResize, calcTerminalSize }
}
