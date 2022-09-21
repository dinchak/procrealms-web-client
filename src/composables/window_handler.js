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

  onMounted(() => {
    window.addEventListener('resize', triggerResize)
  })

  onBeforeUnmount(() => window.removeEventListener('resize', triggerResize))

  return { onResize, triggerResize }
}