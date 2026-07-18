import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { prevMode, setMode, state } from '@/static/state'

export function useHudPopup (rootElement, getPopupKeys = null) {
  const hoveredKey = ref('')
  const pinnedKey = ref('')
  const activeTarget = ref(null)
  const fixedPanelTop = ref('0px')
  const fixedPanelBottom = ref('auto')
  const fixedPanelLeft = ref(0)
  const fixedPanelMaxHeight = ref('55vh')
  const fixedPanelWidth = ref('min(500px, calc(100vw - 24px))')
  const modalModePushed = ref(false)
  const elementsByKey = new Map()

  function hasPopupKey (key) {
    return key !== '' && key !== null && key !== undefined
  }

  function hasPinnedPopup () {
    return hasPopupKey(pinnedKey.value)
  }

  function getActiveKey () {
    return hasPinnedPopup() ? pinnedKey.value : hoveredKey.value
  }

  function getFixedPanelStyle () {
    return {
      bottom: fixedPanelBottom.value,
      left: `${fixedPanelLeft.value}px`,
      maxHeight: fixedPanelMaxHeight.value,
      top: fixedPanelTop.value,
      width: fixedPanelWidth.value
    }
  }

  function clampNumber (value, min, max) {
    return Math.min(Math.max(value, min), max)
  }

  function usesAboveHudLayout () {
    return window.innerWidth < 700
  }

  function getEventTarget (event) {
    return event && event.currentTarget ? event.currentTarget : null
  }

  function hasBlockingModalOpen () {
    return Object.entries(state.modals).some(([key, value]) => {
      if (key === 'inventoryModals') {
        return Object.values(value).some(modalRef => Boolean(modalRef && modalRef.value))
      }

      return Boolean(value)
    })
  }

  function getHudRects () {
    const el = rootElement.value
    const bottomHudElement = el?.closest ? el.closest('.bottom-hud') : null
    const bottomSplitElement = el?.closest ? el.closest('.bottom-split') : null
    const anchorElement = bottomHudElement || bottomSplitElement || el
    const boundsElement = bottomSplitElement || bottomHudElement || el

    if (anchorElement?.getBoundingClientRect && boundsElement?.getBoundingClientRect) {
      return {
        anchor: anchorElement.getBoundingClientRect(),
        bounds: boundsElement.getBoundingClientRect()
      }
    }

    const fallbackRect = {
      bottom: window.innerHeight,
      height: window.innerHeight,
      left: 0,
      top: 0,
      right: window.innerWidth
    }

    return { anchor: fallbackRect, bounds: fallbackRect }
  }

  function updateFixedPanelPosition (target) {
    if (!target || !target.getBoundingClientRect) {
      return
    }

    activeTarget.value = target
    const rect = target.getBoundingClientRect()
    const { bounds: boundsRect, anchor: anchorRect } = getHudRects()
    const gap = 6
    const inset = 8

    if (usesAboveHudLayout()) {
      const panelInset = 12
      const availableHeight = Math.max(80, boundsRect.top - gap - panelInset)

      fixedPanelBottom.value = `${Math.max(0, window.innerHeight - boundsRect.top + gap)}px`
      fixedPanelLeft.value = panelInset
      fixedPanelTop.value = 'auto'
      fixedPanelWidth.value = `${Math.max(0, window.innerWidth - (panelInset * 2))}px`
      fixedPanelMaxHeight.value = `${availableHeight}px`
      return
    }

    const hudLeft = Math.max(inset, boundsRect.left + inset)
    const hudRight = Math.min(window.innerWidth - inset, boundsRect.right - inset)
    const hudWidth = Math.max(0, hudRight - hudLeft)
    const maxPanelWidth = Math.min(500, hudWidth)
    const minPanelWidth = Math.min(260, maxPanelWidth)
    const desiredLeft = rect.right + gap
    const maxLeft = Math.max(hudLeft, hudRight - minPanelWidth)
    const left = clampNumber(desiredLeft, hudLeft, maxLeft)
    const availableWidth = Math.max(minPanelWidth, hudRight - left)
    const panelWidth = Math.min(maxPanelWidth, availableWidth)
    const top = Math.max(0, anchorRect.top)
    const bottomLimit = Math.min(window.innerHeight - inset, boundsRect.bottom - inset)

    fixedPanelBottom.value = 'auto'
    fixedPanelLeft.value = left
    fixedPanelTop.value = `${top}px`
    fixedPanelWidth.value = `${panelWidth}px`
    fixedPanelMaxHeight.value = `${Math.max(80, bottomLimit - top)}px`
  }

  function updateFixedPanelPositionForActiveKey () {
    const target = elementsByKey.get(getActiveKey()) || activeTarget.value
    updateFixedPanelPosition(target)
  }

  function setPopupElement (key, el) {
    if (el) {
      elementsByKey.set(key, el)

      if (key === getActiveKey()) {
        updateFixedPanelPosition(el)
      }
      return
    }

    nextTick(() => {
      const current = elementsByKey.get(key)
      if (current && !current.isConnected) {
        elementsByKey.delete(key)
      }
    })
  }

  function pushModalMode () {
    if (modalModePushed.value) {
      return
    }

    setMode('modal', 'hudPopup')
    modalModePushed.value = true
  }

  function restoreModalMode () {
    if (!modalModePushed.value) {
      return
    }

    modalModePushed.value = false
    prevMode('hudPopup')
  }

  function closePinned () {
    if (!hasPinnedPopup()) {
      return false
    }

    pinnedKey.value = ''
    hoveredKey.value = ''
    activeTarget.value = null
    restoreModalMode()
    return true
  }

  function onCloseModal () {
    if (!hasPinnedPopup() || hasBlockingModalOpen()) {
      return
    }

    closePinned()
  }

  // Returns true if the popup was shown, false if blocked by a pinned popup.
  function showPopup (key, event) {
    if (hasPinnedPopup()) {
      return false
    }

    hoveredKey.value = key
    updateFixedPanelPosition(getEventTarget(event))
    return true
  }

  function hidePopup (key) {
    if (hoveredKey.value === key && pinnedKey.value !== key) {
      hoveredKey.value = ''
    }
  }

  // Returns true if the popup was pinned open, false if it was closed.
  function togglePopup (key, event) {
    if (pinnedKey.value === key) {
      closePinned()
      return false
    }

    pushModalMode()
    pinnedKey.value = key
    hoveredKey.value = ''
    updateFixedPanelPosition(getEventTarget(event))
    return true
  }

  if (getPopupKeys) {
    watch(getPopupKeys, popupKeys => {
      const currentKeys = new Set(popupKeys || [])

      if (hasPinnedPopup() && !currentKeys.has(pinnedKey.value)) {
        closePinned()
      }

      if (hasPopupKey(hoveredKey.value) && !currentKeys.has(hoveredKey.value)) {
        hoveredKey.value = ''
      }
    })
  }

  async function updatePopupPosition () {
    await nextTick()
    updateFixedPanelPositionForActiveKey()
  }

  onMounted(() => {
    updatePopupPosition()
    window.addEventListener('resize', updatePopupPosition)
    window.addEventListener('scroll', updatePopupPosition, true)
    state.inputEmitter.on('closeModal', onCloseModal)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updatePopupPosition)
    window.removeEventListener('scroll', updatePopupPosition, true)
    state.inputEmitter.off('closeModal', onCloseModal)
    restoreModalMode()
  })

  return {
    pinnedKey,
    getActiveKey,
    getFixedPanelStyle,
    setPopupElement,
    showPopup,
    hidePopup,
    togglePopup,
    closePinned
  }
}
