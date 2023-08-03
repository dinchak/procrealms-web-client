import { onMounted, onBeforeUnmount } from 'vue'

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

    let outputStyle = getComputedStyle(document.getElementById('output').querySelector('.line'))

    let canvas = calcTerminalSize.canvas || (calcTerminalSize.canvas = document.createElement("canvas"))
    let context = canvas.getContext("2d")
    context.font = outputStyle.fontSize + ' ' + outputStyle.fontFamily

    let charWidth = context.measureText('-').width
    let charHeight = Number(outputStyle.lineHeight.replace('px', ''))

    let width = Math.floor(outputWidth  / charWidth)
    let height = Math.floor(outputHeight  / charHeight)

    return { width, height }
  }

  onMounted(() => {
    window.addEventListener('resize', triggerResize)
  })

  onBeforeUnmount(() => window.removeEventListener('resize', triggerResize))

  return { onResize, triggerResize, calcTerminalSize }
}
