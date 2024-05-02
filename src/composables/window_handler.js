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

    let outputLine = output.querySelector('.line')
    if (!outputLine) {
      return { width: 80, height: 25 }
    }

    let outputStyle = getComputedStyle(outputLine)

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

  function setFontSize (fontSize) {
    state.options.fontSize = fontSize
    document.getElementById('app').style.fontSize = fontSize

    let modalContainers = document.getElementsByClassName('n-modal-container')
    console.log(modalContainers)
    for (let modalContainer of modalContainers) {
      modalContainer.style.fontSize = fontSize
    }

    triggerResize()
  }

  function setFontFamily (fontFamily) {
    state.options.fontFamily = fontFamily
    document.getElementById('app').style.fontFamily = fontFamily

    let modalContainers = document.getElementsByClassName('n-modal-container')
    for (let modalContainer of modalContainers) {
      modalContainer.style.fontFamily = fontFamily
    }

    triggerResize()
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

  return { onResize, triggerResize, calcTerminalSize, setFontSize, setFontFamily }
}
