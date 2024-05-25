import { state } from '@/static/state'
import { DEFAULT_TERMINAL_SIZE } from '@/static/constants'

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

  function calcTerminalSize () {
    let output = document.getElementById('output')?.parentElement;

    if (!output) {
      return DEFAULT_TERMINAL_SIZE
    }

    let outputLine = output.querySelector('.line')
    if (!outputLine) {
      return DEFAULT_TERMINAL_SIZE
    }

    const outputStyle = getComputedStyle(output)

    let outputWidth = output.clientWidth;
    let outputHeight = output.clientHeight;
    outputWidth -= parseFloat(outputStyle.paddingLeft) + parseFloat(outputStyle.paddingRight);
    outputHeight -= parseFloat(outputStyle.paddingTop) + parseFloat(outputStyle.paddingBottom);

    const lineStyle = getComputedStyle(outputLine)

    let canvas = calcTerminalSize.canvas || (calcTerminalSize.canvas = document.createElement("canvas"))
    let context = canvas.getContext("2d")
    context.font = lineStyle.fontSize + ' ' + lineStyle.fontFamily

    let charWidth = context.measureText('-').width
    let charHeight = Number(lineStyle.lineHeight.replace('px', ''))

    let width = Math.floor(outputWidth  / charWidth)
    let height = Math.floor(outputHeight  / charHeight)

    state.options.terminalWidth = width;
    state.options.terminalHeight = height;
    return { width, height }
  }

  function setFontSize (fontSize) {
    state.options.fontSize = fontSize
    document.getElementById('app').style.fontSize = fontSize

    let modalContainers = document.getElementsByClassName('n-modal-container')
    for (let modalContainer of modalContainers) {
      modalContainer.style.fontSize = fontSize
    }

    triggerResize()
  }

  function setFontFamily (fontFamily) {
    state.options.fontFamily = fontFamily
    document.body.style.fontFamily = fontFamily;
    document.getElementById('app').style.fontFamily = fontFamily

    let modalContainers = document.getElementsByClassName('n-modal-container')
    for (let modalContainer of modalContainers) {
      modalContainer.style.fontFamily = fontFamily
    }

    triggerResize()
  }

  async function toggleFullscreen () {
    let body = document.querySelector('body')
    if (!document.fullscreenElement) {
      await body.requestFullscreen()
    } else if (document.exitFullscreen) {
      await document.exitFullscreen()
    }
  }

  return {
    onResize, triggerResize, calcTerminalSize,
    setFontSize, setFontFamily, toggleFullscreen,
  }
}
