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
    let charWidth = 7
    let charHeight = 21

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