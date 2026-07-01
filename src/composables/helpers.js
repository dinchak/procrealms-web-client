import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import { AnsiUp } from 'ansi_up'
const ansi_up = new AnsiUp()
ansi_up.use_classes = true

import { getOrderCmd, state } from '@/static/state'
import { ANSI, ANSI_REPLACEMENTS, CHANNELS, DIRECTION_MAP } from '@/static/constants'

import { useWebSocket } from '@/composables/web_socket'

const { runCommand, move, enter, refreshItem } = useWebSocket()

export function useHelpers () {
  function copperToMoneyString (amount, short, color = true) {
    let valueString = ''
    let copperString = (amount || 0).toString()

    const gold = short ? 'g ' : ' gold '
    const silver = short ? 's ' : ' silver '
    const copper = short ? 'c ' : ' copper '

    if (copperString.length > 4) {
      if (color) {
        valueString += "<span class='bold-yellow'>"
      }
      valueString += copperString.slice(0, copperString.length - 4) + gold
      if (color) {
        valueString += "</span>"
      }

      copperString = copperString.slice(copperString.length - 4, copperString.length)
    }

    if (copperString.length > 2) {
      if (color) {
        valueString += "<span class='bold-white'>"
      }
      valueString += copperString.slice(0, copperString.length - 2) + silver
      if (color) {
        valueString += "</span>"
      }

      copperString = copperString.slice(copperString.length - 2, copperString.length)
    }

    if (copperString === "00") {
      return valueString
    }

    if (color) {
      valueString += "<span class='bold-cyan'>"
    }
    valueString += copperString + copper
    if (color) {
      valueString += "</span>"
    }

    return valueString.trim()
  }

  async function runItemAction (command, item) {
    let commandStr = `${getOrderCmd()}${command} iid:${item.iid}`
    let outputId = `inventory-output-${item.iid}`
    await runCommand(commandStr, outputId)
    // state.inventoryOutput[item.iid] = result.msg
    await refreshItem(item.iid)
  }

  function getActions (item) {
    let actions = []

    if (state.gameState.room.flags.includes('store')) {
      actions.push({
        label: 'Sell',
        onClick: () => runItemAction('sell', item),
        class: 'bold-yellow',
        disabled: false
      })

      if (item.amount > 1) {
        actions.push({
          label: 'Sell All',
          onClick: () => runItemAction('sell all', item),
          class: 'bold-yellow',
          disabled: false
        })
      }
    }

    if (item.type == 'consumable') {
      if (item.subtype == 'food') {
        actions.push({
          label: 'Eat',
          onClick: () => runItemAction('eat', item),
          class: 'bold-green',
          disabled: false
        })
      } else if (item.subtype == 'potion') {
        actions.push({
          label: 'Drink',
          onClick: () => runItemAction('drink', item),
          class: 'bold-green',
          disabled: false
        })
      } else {
        actions.push({
          label: 'Consume',
          onClick: () => runItemAction('consume', item),
          class: 'bold-green',
          disabled: false
        })
      }
    }

    if (item.type == 'weapon') {
      actions.push({
        label: 'Wield',
        onClick: () => runItemAction('wield', item),
        class: 'bold-white',
        disabled: false
      })
    }

    if (item.type == 'armor') {
      actions.push({
        label: 'Wear',
        onClick: () => runItemAction('wear', item),
        class: 'bold-white',
        disabled: false
      })
    }

    if (item.type == 'weapon' || item.type == 'armor') {
      actions.push({
        label: 'Compare',
        onClick: () => runItemAction('compare', item),
        class: 'bold-cyan',
        disabled: false
      })
    }

    if (item.type == 'weapon' || item.type == 'armor' || item.type == 'tool' || item.type == 'bag') {
      if (hasSkillsRequired(item)) {
        actions.push({
          label: 'Salvage',
          onClick: () => runItemAction('salvage', item),
          class: 'bold-magenta',
          disabled: false
        })
        if (item.type == 'tool') {
          actions.push({
            label: 'Repair',
            onClick: () => runItemAction('repair', item),
            class: 'yellow',
            disabled: false
          })
        }
      }
    }

    if (item.type == 'material') {
      if (item.subtype == 'hide') {
        actions.push({
          label: 'Tan',
          onClick: () => runItemAction('tan', item),
          class: 'bold-magenta',
          disabled: false
        })
      }

      if (item.subtype == 'seed') {
        actions.push({
          label: 'Plant',
          onClick: () => runItemAction('plant', item),
          class: 'bold-magenta',
          disabled: false
        })
      }

      if (item.subtype == 'bandage') {
        actions.push({
          label: 'Wrap',
          onClick: () => runItemAction('wrap', item),
          class: 'bold-magenta',
          disabled: false
        })
      }

      if (item.subtype == 'fish') {
        actions.push({
          label: 'Filet',
          onClick: () => runItemAction('filet', item),
          class: 'bold-magenta',
          disabled: false
        })
      }
    }

    if (item.type == 'book' || item.type == 'scroll') {
      actions.push({
        label: 'Read',
        onClick: () => runItemAction('read', item),
        class: 'bold-magenta',
        disabled: false
      })
    }

    if (
      item.type == 'bag' ||
      (item.type == 'tool' && Object.keys(state.gameState.tools).includes(item.subtype))
    ) {
      actions.push({
        label: 'Hold',
        onClick: () => runItemAction('hold', item),
        class: 'bold-magenta',
        disabled: false
      })
    }

    if (item.type == 'tool') {
      if (item.subtype == 'penned animal') {
        actions.push({
          label: 'Unpen',
          onClick: () => runItemAction('unpen', item),
          class: 'bold-magenta',
          disabled: false
        })
      }

      if (item.subtype == 'deployable') {
        actions.push({
          label: 'Unpack',
          onClick: () => runItemAction('unpack', item),
          class: 'bold-magenta',
          disabled: false
        })
      }
    }

    if (item.keeping) {
      actions.push({
        label: 'Unkeep',
        onClick: () => runItemAction('unkeep', item),
        class: 'bold-blue',
        disabled: false
      })
    } else {
      actions.push({
        label: 'Keep',
        onClick: () => runItemAction('keep', item),
        class: 'bold-blue',
        disabled: false
      })
    }

    actions.push({
      label: 'Drop',
      onClick: () => runItemAction('drop', item),
      class: 'bold-red',
      disabled: false
    })

    if (item.amount > 1) {
      actions.push({
        label: 'Drop All',
        onClick: () => runItemAction('drop all', item),
        class: 'bold-red',
        disabled: false
      })
    }

    return actions
  }

  function hasSkillsRequired (item) {
    if (!item.skillsRequired || item.skillsRequired.length == 0) {
      return false
    }

    for (let skill of item.skillsRequired) {
      let playerSkill = state.gameState.skills[skill.name]
      if (!playerSkill || playerSkill.level < skill.level) {
        return false
      }
    }

    return true
  }

  function ansiToHtml (str) {
    if (typeof str !== 'string') {
      return ''
    }

    for (let { from, to } of ANSI_REPLACEMENTS) {
      str = str.replace(new RegExp(from, 'g'), to)
    }

    return ansi_up.ansi_to_html(str)
  }

  function getPetEid () {
    for (let eid in state.gameState.charmies) {
      let charmie = state.gameState.charmies[eid]
      if (charmie && charmie.traits && charmie.traits.includes('pet')) {
        return eid
      }
    }
  }

  function getMerc () {
    let charmies = Object.values(state.gameState.charmies)

    const merc = charmies.find(charmie =>
      charmie && charmie.traits && charmie.traits.includes('mercenary')
    )

    if (!merc) {
      state.mercEid = -1
      return false
    }

    state.mercEid = merc.stats.eid
    return merc
  }

  let modalClasses = ['game-modal', 'login-modal', 'new-player-modal']
  function getSelectableElements () {
    return Array.from(document.querySelectorAll('.selectable'))
      .filter(el => {
        if (el.offsetParent === null) {
          return false
        }

        for (let modalClass of modalClasses) {
          let modal = document.querySelector(`.${modalClass}`)
          if (modal && !modal.contains(el)) {
            return false
          }
        }

        return true
      })
  }

  function scrollParentToElement (element) {
    if (!element) {
      return
    }

    let parent = element.parentElement
    while (parent) {
      if (
        parent.scrollHeight == parent.clientHeight && parent.scrollTop == 0 &&
        parent.scrollWidth == parent.clientWidth && parent.scrollLeft == 0
      ) {
        parent = parent.parentElement
        continue
      }

      let elementRect = element.getBoundingClientRect()
      if (elementRect.top > parent.clientHeight / 2) {
        parent.scrollTop += elementRect.bottom - parent.clientHeight / 2
      } else if (elementRect.top < parent.clientHeight / 2) {
        parent.scrollTop -= parent.clientHeight / 2 - elementRect.top
      }

      parent = parent.parentElement
    }
  }

  let selectDelay = false
  let selectDelayTimeout = null
  let lastSelectedRect = null
  let currentSelectedElement = null
  let stopSelectableRepairWatcher = null
  const gamepadSelectedClass = 'gamepad-selected'

  function rememberSelectedRect (element) {
    if (!element || !element.isConnected) {
      return
    }

    lastSelectedRect = getBoundingRect(element)
  }

  function setSelectedElement (element) {
    if (!element) {
      return null
    }

    clearGamepadSelectedElements(element)
    element.classList.add('selected')
    element.classList.add(gamepadSelectedClass)
    currentSelectedElement = element
    rememberSelectedRect(element)
    scrollParentToElement(element)
    return element
  }

  function clearGamepadSelectedElements (exceptElement = null) {
    for (let element of document.querySelectorAll(`.${gamepadSelectedClass}`)) {
      if (element === exceptElement) {
        continue
      }

      element.classList.remove('selected')
      element.classList.remove(gamepadSelectedClass)
    }
  }

  function isSelectableElementActive (element, selectableElements = null) {
    if (!element || !element.isConnected) {
      return false
    }

    let availableElements = selectableElements || getSelectableElements()
    return availableElements.includes(element)
  }

  function refreshSelectedElement (selectedElement, preferredElements = null) {
    let selectableElements = getSelectableElements()
    if (selectableElements.length == 0) {
      return null
    }

    if (preferredElements && preferredElements.length > 0) {
      return setSelectedElement(findClosestSelectableElementFromRect(lastSelectedRect, preferredElements) || preferredElements[0])
    }

    if (isSelectableElementActive(selectedElement, selectableElements)) {
      return setSelectedElement(selectedElement)
    }

    return setSelectedElement(findClosestSelectableElementFromRect(lastSelectedRect, selectableElements) || selectableElements[0])
  }

  function watchForSelectableRepair (selectedElement, onRepair, timeout = 5000, removalFallbackDelay = 100) {
    if (typeof MutationObserver == 'undefined') {
      return () => {}
    }

    let initialElements = new Set(getSelectableElements())
    let selectedRect = selectedElement && isSelectableElementActive(selectedElement)
      ? getBoundingRect(selectedElement)
      : lastSelectedRect
    let stopped = false
    let frameId = null
    let timeoutId = null
    let fallbackTimeoutId = null
    let observer = null

    function stop () {
      stopped = true

      if (observer) {
        observer.disconnect()
        observer = null
      }

      if (frameId) {
        cancelAnimationFrame(frameId)
        frameId = null
      }

      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      if (fallbackTimeoutId) {
        clearTimeout(fallbackTimeoutId)
        fallbackTimeoutId = null
      }
    }

    function repairSelection (preferredElements = null) {
      let repairedElement = refreshSelectedElement(selectedElement, preferredElements)
      stop()

      if (repairedElement) {
        onRepair(repairedElement)
      }
    }

    function scheduleRemovalFallback () {
      if (fallbackTimeoutId || stopped) {
        return
      }

      fallbackTimeoutId = setTimeout(() => {
        fallbackTimeoutId = null

        if (stopped) {
          return
        }

        let selectableElements = getSelectableElements()
        if (selectedElement && isSelectableElementActive(selectedElement, selectableElements)) {
          return
        }

        repairSelection()
      }, removalFallbackDelay)
    }

    function repairIfSelectableChanged () {
      frameId = null

      if (stopped) {
        return
      }

      let selectableElements = getSelectableElements()
      let newSelectableElements = selectableElements.filter(element => !initialElements.has(element))
      let selectedElementRemoved = selectedElement && !isSelectableElementActive(selectedElement, selectableElements)

      if (!selectedElementRemoved) {
        return
      }

      scheduleRemovalFallback()

      let overlappingElements = newSelectableElements.filter(element => rectsOverlap(selectedRect, getBoundingRect(element)))
      if (overlappingElements.length == 0) {
        return
      }

      repairSelection(overlappingElements)
    }

    function scheduleRepairCheck () {
      if (frameId || stopped) {
        return
      }

      frameId = requestAnimationFrame(repairIfSelectableChanged)
    }

    observer = new MutationObserver(scheduleRepairCheck)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden'],
      childList: true,
      subtree: true
    })

    timeoutId = setTimeout(stop, timeout)
    return stop
  }

  function getCurrentGamepadSelectedElement (scopeSelector = null) {
    let scope = scopeSelector ? document.querySelector(scopeSelector) : document
    if (!scope) {
      return null
    }

    return scope.querySelector(`.selectable.${gamepadSelectedClass}`)
  }

  function stopWatchingForSelectableRepair () {
    if (stopSelectableRepairWatcher) {
      stopSelectableRepairWatcher()
      stopSelectableRepairWatcher = null
    }
  }

  function performSelectedElementAction (selectedElement, scopeSelector = null) {
    selectedElement = getCurrentGamepadSelectedElement(scopeSelector) || currentSelectedElement || selectedElement
    if (!selectedElement) {
      return null
    }

    if (!isSelectableElementActive(selectedElement)) {
      selectedElement = refreshSelectedElement(selectedElement)
      if (!selectedElement) {
        return null
      }
    }

    setSelectedElement(selectedElement)
    stopWatchingForSelectableRepair()
    stopSelectableRepairWatcher = watchForSelectableRepair(selectedElement, repairedElement => {
      if (repairedElement) {
        repairedElement.focus()
      }
      stopSelectableRepairWatcher = null
    })

    selectedElement.click()
    return selectedElement
  }

  function selectNearestElement (selectedElement, degree) {
    stopWatchingForSelectableRepair()
    selectedElement = currentSelectedElement || getCurrentGamepadSelectedElement() || selectedElement

    if (degree === false) {
      return selectedElement
    }

    if (degree === false && selectDelay) {
      clearTimeout(selectDelayTimeout)
      selectDelay = false
    }

    if (selectDelay) {
      return selectedElement
    }

    selectDelay = true
    let delayTime = 175

    selectDelayTimeout = setTimeout(() => {
      selectDelay = false
    }, delayTime)

    let direction = degreeToDirection(degree)
    let selectableElements = getSelectableElements()
    if (selectableElements.length == 0) {
      currentSelectedElement = null
      return null
    }

    if (!selectedElement) {
      return setSelectedElement(selectableElements[0])
    }

    if (!isSelectableElementActive(selectedElement, selectableElements)) {
      let recoveredElement = recoverSelectableElement(direction, selectableElements)
      if (recoveredElement) {
        return setSelectedElement(recoveredElement)
      }

      return setSelectedElement(selectableElements[0])
    }

    rememberSelectedRect(selectedElement)

    let nearestElement = findNearestSelectableElement(selectedElement, direction, selectableElements)

    if (nearestElement) {
      selectedElement.classList.remove('selected')
      selectedElement.classList.remove(gamepadSelectedClass)
      return setSelectedElement(nearestElement)
    }

    return selectedElement
  }

  function degreeToDirection (degree) {
    if (degree < 45 || degree > 315) {
      return 'up'
    } else if (degree >= 45 && degree < 135) {
      return 'left'
    } else if (degree >= 135 && degree < 225) {
      return 'down'
    } else {
      return 'right'
    }
  }

  function getBoundingRect (element) {
    let x = 0
    let y = 0
    let width = element.offsetWidth
    let height = element.offsetHeight

    while (element) {
      x += (element.offsetLeft - element.scrollLeft + element.clientLeft)
      y += (element.offsetTop - element.scrollTop + element.clientTop)
      element = element.offsetParent
    }

    return { x1: x, y1: y, x2: x + width, y2: y + height }
  }

  function calcRectDistance (rect1, rect2, favorDirection = false) {
    let rect1CenterX = (rect1.x1 + rect1.x2) / 2
    let rect1CenterY = (rect1.y1 + rect1.y2) / 2
    let rect2CenterX = (rect2.x1 + rect2.x2) / 2
    let rect2CenterY = (rect2.y1 + rect2.y2) / 2

    if (favorDirection) {
      if (favorDirection == 'left') {
        rect2CenterX = rect2.x1
      } else if (favorDirection == 'right') {
        rect2CenterX = rect2.x2
      } else if (favorDirection == 'up') {
        rect2CenterY = rect2.y1
      } else if (favorDirection == 'down') {
        rect2CenterY = rect2.y2
      }
    }

    let dx = Math.max(rect1CenterX, rect2CenterX) - Math.min(rect1CenterX, rect2CenterX)
    let dy = Math.max(rect1CenterY, rect2CenterY) - Math.min(rect1CenterY, rect2CenterY)

    return Math.sqrt(dx * dx + dy * dy)
  }

  function rectsOverlap (rect1, rect2) {
    if (!rect1 || !rect2) {
      return false
    }

    return rect1.x1 < rect2.x2 &&
      rect1.x2 > rect2.x1 &&
      rect1.y1 < rect2.y2 &&
      rect1.y2 > rect2.y1
  }

  function getRectCenter (rect) {
    return {
      x: (rect.x1 + rect.x2) / 2,
      y: (rect.y1 + rect.y2) / 2
    }
  }

  function calcAxisGap (min1, max1, min2, max2) {
    if (max1 < min2) {
      return min2 - max1
    }

    if (max2 < min1) {
      return min1 - max2
    }

    return 0
  }

  function getDirectionalMetrics (rect1, rect2, direction) {
    let rect1Center = getRectCenter(rect1)
    let rect2Center = getRectCenter(rect2)
    let deltaX = rect2Center.x - rect1Center.x
    let deltaY = rect2Center.y - rect1Center.y

    let forwardDistance = 0
    let axisGap = 0
    let centerOffset = 0

    if (direction == 'left') {
      forwardDistance = -deltaX
      axisGap = calcAxisGap(rect1.y1, rect1.y2, rect2.y1, rect2.y2)
      centerOffset = Math.abs(deltaY)
    } else if (direction == 'right') {
      forwardDistance = deltaX
      axisGap = calcAxisGap(rect1.y1, rect1.y2, rect2.y1, rect2.y2)
      centerOffset = Math.abs(deltaY)
    } else if (direction == 'up') {
      forwardDistance = -deltaY
      axisGap = calcAxisGap(rect1.x1, rect1.x2, rect2.x1, rect2.x2)
      centerOffset = Math.abs(deltaX)
    } else {
      forwardDistance = deltaY
      axisGap = calcAxisGap(rect1.x1, rect1.x2, rect2.x1, rect2.x2)
      centerOffset = Math.abs(deltaX)
    }

    if (forwardDistance <= 0) {
      return null
    }

    let sourceSize = direction == 'left' || direction == 'right'
      ? rect1.y2 - rect1.y1
      : rect1.x2 - rect1.x1
    let targetSize = direction == 'left' || direction == 'right'
      ? rect2.y2 - rect2.y1
      : rect2.x2 - rect2.x1
    let effectiveCenterOffset = centerOffset

    if ((direction == 'up' || direction == 'down') && sourceSize > targetSize * 2) {
      effectiveCenterOffset = Math.abs(rect2.x1 - rect1.x1)
    }

    let centerDistance = calcRectDistance(rect1, rect2, direction)
    let laneTolerance = Math.min(18, Math.max(6, sourceSize * 0.25))
    let sameLane = axisGap <= laneTolerance

    return {
      sameLane,
      score: (forwardDistance * 1.5) + (axisGap * 4) + (effectiveCenterOffset * 0.75) + (centerDistance * 0.05)
    }
  }

  function findNearestSelectableElementFromRect (rect1, direction, selectableElements) {
    let candidates = []

    for (let element of selectableElements) {
      const rect2 = getBoundingRect(element)
      let metrics = getDirectionalMetrics(rect1, rect2, direction)
      if (!metrics) {
        continue
      }

      candidates.push({
        element,
        sameLane: metrics.sameLane,
        score: metrics.score
      })
    }

    let sameLaneCandidates = candidates.filter(candidate => candidate.sameLane)
    if (sameLaneCandidates.length > 0) {
      candidates = sameLaneCandidates
    }

    let nearestElement = null
    let nearestScore = Infinity

    for (let candidate of candidates) {
      if (candidate.score < nearestScore) {
        nearestScore = candidate.score
        nearestElement = candidate.element
      }
    }

    return nearestElement
  }

  function findNearestSelectableElement (selectedElement, direction, selectableElements = getSelectableElements()) {
    const rect1 = getBoundingRect(selectedElement)
    let candidateElements = selectableElements.filter(element => element !== selectedElement)
    return findNearestSelectableElementFromRect(rect1, direction, candidateElements)
  }

  function findClosestSelectableElementFromRect (rect1, selectableElements) {
    if (!rect1) {
      return null
    }

    let nearestElement = null
    let nearestDistance = Infinity

    for (let element of selectableElements) {
      let rect2 = getBoundingRect(element)
      let rectDistance = calcRectDistance(rect1, rect2)
      if (rectDistance < nearestDistance) {
        nearestDistance = rectDistance
        nearestElement = element
      }
    }

    return nearestElement
  }

  function recoverSelectableElement (direction, selectableElements) {
    if (!lastSelectedRect) {
      return null
    }

    return findNearestSelectableElementFromRect(lastSelectedRect, direction, selectableElements) ||
      findClosestSelectableElementFromRect(lastSelectedRect, selectableElements)
  }

  function ucfirst (str) {
    if (typeof str !== 'string') {
      return ''
    }
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  function renderNumber (value, digits = 2) {
    if (typeof value != 'number') {
      return value
    }
    if (value == Math.floor(value)) {
      return Math.round(value) + ''
    }
    return value.toFixed(digits)
  }

  function listToString (list, seperator = 'and') {
    if (!list) {
      return ''
    }

    if (list.length == 1) {
      return list[0]
    }

    let firstItems = list.slice(0, list.length - 1)
    let lastItem = list[list.length - 1]

    return `${firstItems.join(', ')} ${seperator} ${lastItem}`
  }

  function isGamepadConnected () {
    return Object.values(state.gamepads).length > 0
  }

  function selectMovementDirection (degree) {
    if (state.gameState.battle.active) {
      return
    }

    if (degree === false) {
      state.selectedDirection = DIRECTION_MAP[0]
      return
    }

    let offsetDegree = degree + (45 / 2)
    if (offsetDegree > 360) {
      offsetDegree -= 360
    }

    let itemNumber = Math.ceil(offsetDegree / 360 * 8)
    state.selectedDirection = DIRECTION_MAP[itemNumber]
  }

  function moveInSelectedDirection () {
    if (state.gameState.battle.active) {
      return
    }

    if (state.selectedDirection == 'enter') {
      enter()
    } else {
      move(state.selectedDirection)
    }
  }

  function calcMapSize () {
    let width = Math.round(5 + (state.options.sideMapWidth / 2))
    let height = Math.round(5 + (state.options.sideMapHeight / 2))
    return { width, height }
  }

  function strToLines (str) {
    let lines = str.trim().split('\n')
    return lines.map(line => ansiToHtml(line))
  }

  function progressStatus (percentage) {
    if (percentage > 50) {
      return 'success'
    }

    if (percentage > 25) {
      return 'warning'
    }

    return 'error'
  }

  function effectBonuses (effect) {
    let bonuses = []

    if (effect.charges) {
      bonuses.push({
        value: `<span class="bold-white">${effect.charges}</span> charges remaining`
      })
    }

    if (effect.healOverTime) {
      let { healLow, healHigh } = effect.healOverTime
      bonuses.push({
        value: `Heals <span class="bold-green">${healLow.toFixed(0)}</span>-<span class="bold-green">${healHigh.toFixed(0)}</span> every <span class="bold-yellow">${effect.triggerTime}</span>s`
      })
    }

    if (effect.damageOverTime) {
      let { damLow, damHigh, damageType } = effect.damageOverTime
      bonuses.push({
        value: `Deals <span class="bold-red">${damLow.toFixed(0)}</span>-<span class="bold-red">${damHigh.toFixed(0)}</span> ${damageType} damage every <span class="bold-yellow">${effect.triggerTime}</span>s` })
    }

    return bonuses.concat(effect.bonuses)
  }

  function isOverflowX (element) {
    return element.scrollWidth !== Math.max(element.offsetWidth, element.clientWidth)
  }

  function isOverflowY (element) {
    return element.scrollHeight !== Math.max(element.offsetHeight, element.clientHeight)
  }

  function getEffectFlags (entity, effects) {
    let flags = []

    if (entity.dead) {
      flags.push(ANSI.boldRed + 'DEAD' + ANSI.reset)
    }

    if (entity.incapacitated) {
      flags.push(ANSI.boldRed + 'DOWN' + ANSI.reset)
    }

    if (entity.hidden) {
      flags.push(ANSI.boldYellow + 'HIDDEN' + ANSI.reset)
    }

    let hungerLevel = getHungerLevel(entity)
    if (hungerLevel == 0) {
      flags.push(ANSI.red + 'S' + ANSI.reset)
    } else if (hungerLevel == 1) {
      flags.push(ANSI.boldRed + 'VH' + ANSI.reset)
    } else if (hungerLevel == 2) {
      flags.push(ANSI.boldYellow + 'H' + ANSI.reset)
    }

    if (entity.combo > 0) {
      flags.push(ANSI.boldYellow + entity.combo + ANSI.reset)
    }

    if (entity.rage > 0) {
      flags.push(ANSI.boldRed + entity.rage + ANSI.reset)
    }

    flags = flags.concat(Object.entries(effects)
      .map(p => p[1].shortFlag))

    flags = flags.map(s => ansiToHtml(s))
      .filter(s => s.trim().length)

    return flags.join(' ')
  }

  function getEffectNames (entity, effects) {
    let names = []

    if (entity.dead) {
      names.push('Dead')
    }

    if (entity.incapacitated) {
      names.push('Down')
    }

    if (entity.hidden) {
      names.push('Hidden')
    }

    let hungerLevel = getHungerLevel(entity)
    if (hungerLevel == 0) {
      names.push('Starving')
    } else if (hungerLevel == 1) {
      names.push('Very Hungry')
    } else if (hungerLevel == 2) {
      names.push('Hungry')
    } else if (hungerLevel == 3) {
      names.push('Satiated')
    } else if (hungerLevel == 4) {
      names.push('Satisfied')
    } else if (hungerLevel == 5) {
      names.push('Full')
    }

    if (entity.combo > 0) {
      names.push(`${entity.combo} Combo`)
    }

    if (entity.rage > 0) {
      names.push(`${entity.rage} Rage`)
    }

    names = names.concat(Object.entries(effects)
      .map(p => p[1].longFlag || p[1].name))

    names = names.map(s => ansiToHtml(s))
      .filter(s => s.trim().length)

    return names
  }

  function getHungerLevel (entity) {
    return Math.floor(entity.food * 5 / entity.maxFood)
  }

  function range (start, end) {
    return Array.from({
      length: end - start + 1
    }, (_, i) => start + i)
  }

  function renderMessage ({ channel, from, to, message }) {
    let out = ''

    const channelConfig = CHANNELS.find(c => c.name == channel)
    let color = 'white'
    let label = channel

    if (channelConfig) {
      color = channelConfig.color
      label = channelConfig.label
    }

    let channelOut = ''

    if (channel == 'announce') {
      out = '<span class="bold-black">[</span><span class="bold-red">Announcement</span><span class="bold-black">]</span> <span class="bold-white">' + message + '</span>'
    } else if (channel == 'events') {
      out = '<span class="bold-black">[</span><span class="bold-magenta">Event</span><span class="bold-black">]</span> <span class="bold-white">' + message + '</span>'
    } else if (channel == 'info') {
      out = '<span class="bold-black">[</span><span class="bold-cyan">Info</span><span class="bold-black">]</span> <span class="bold-white">' + message + '</span>'
    } else {
      channelOut = `<span class="${color}">[</span><span class="bold-${color}">${label}</span><span class="${color}">]</span>`

      let fromOut = from ? `<span class="bold-yellow">${from}</span> ` : ''
      out = `${channelOut} ${fromOut}<span class="bold-white">${message}</span>`

      if (channel == 'tell') {
        if (from == 'You') {
          out = `<span class="magenta">You tell</span> <span class="bold-magenta">${to}</span> <span class="bold-white">${message}</span>`
        } else {
          out = `<span class="bold-magenta">${from}</span> <span class="magenta">tells you</span> <span class="bold-white">${message}</span>`
        }
      } else {
        out = `<span class="bold-yellow">${from}</span> <span class="bold-white">${channel}${from == 'You' ? '' : 's'}</span> '${message}'`
      }
    }

    return out
  }

  function renderColorGradient (colors, percent) {
    let idx = Math.round(percent * colors.length)
    if (idx >= colors.length) {
      idx = colors.length - 1
    }
    return colors[idx] || '{{w'
  }

  function getHpColorByPercent (percent) {
    return renderColorGradient(['red', 'bold-red', 'bold-yellow', 'green', 'bold-green'], percent)
  }

  function getEnergyColorByPercent (percent) {
    return renderColorGradient(['blue', 'bold-blue', 'cyan', 'bold-cyan', 'bold-white'], percent)
  }

  function getStaminaColorByPercent (percent) {
    return renderColorGradient(['red', 'bold-red', 'magenta', 'bold-magenta', 'bold-yellow'], percent)
  }

  function getTellMessageFrom (message) {
    if (message.channel != 'tell') {
      return message.channel
    }

    let from = (message.from == 'You') ? message.to : message.from
    return from
  }

  function getRelativeTime (timestamp, suffix = true) {
    return dayjs(timestamp).fromNow(suffix)
  }

  return {
    ucfirst, renderNumber, listToString, ansiToHtml,
    copperToMoneyString, getActions, getMerc, getPetEid,
    selectNearestElement, performSelectedElementAction, isGamepadConnected,
    selectMovementDirection, moveInSelectedDirection,
    calcMapSize, strToLines, progressStatus, effectBonuses,
    isOverflowX, isOverflowY, getEffectFlags, getEffectNames,
    range, renderMessage, runItemAction,
    getHpColorByPercent, getEnergyColorByPercent, getStaminaColorByPercent,
    getTellMessageFrom, getRelativeTime
  }
}
