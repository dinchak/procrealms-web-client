import { AnsiUp } from 'ansi_up'

import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'
import { ACTION_MAP, ANSI_REPLACEMENTS, DIRECTION_MAP } from '@/composables/constants'

const ansi_up = new AnsiUp()
ansi_up.use_classes = true

const { move, enter } = useWebSocket()

export function useHelpers () {
  function copperToMoneyString (amount, short) {
    let valueString = ''
    let copperString = (amount || 0).toString()

    const gold = short ? 'g ' : ' gold, '
    const silver = short ? 's ' : ' silver, '
    const copper = short ? 'c ' : ' copper '

    if (copperString.length > 4) {
      valueString = "<span class='bold-yellow'>" + copperString.slice(0, copperString.length - 4) + gold + "</span>"
      copperString = copperString.slice(copperString.length - 4, copperString.length)
    }

    if (copperString.length > 2) {
      valueString += "<span class='bold-white'>" + copperString.slice(0, copperString.length - 2) + silver + "</span>"
      copperString = copperString.slice(copperString.length - 2, copperString.length)
    }

    if (copperString === "00") {
      return valueString
    }

    valueString += "<span class='bold-cyan'>" + copperString + copper + "</span>"

    return valueString
  }

  function getActions (item, isPlayer) {
    const playerActions = []
    const mercActions = []
    ACTION_MAP.map(action => {
      if (action.condition(item)) {
        playerActions.push(action.action)
      }
    })

    ACTION_MAP.map(action => {
      if (action.condition(item) && !action.crafting) {
        mercActions.push(action.action)
      }
    })

    return isPlayer ? playerActions : mercActions;
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

  function getSelectableElements () {
    return Array.from(document.querySelectorAll('.selectable'))
      .filter(el => {
        if (el.offsetParent === null) {
          return false
        }

        const gameModal = document.querySelector('.game-modal')
        if (gameModal && !gameModal.contains(el)) {
          return false
        }

        return true

        // const rect = el.getBoundingClientRect()
        // return (
        //   rect.top >= 0 &&
        //   rect.left >= 0 &&
        //   rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        //   rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        // )
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
  function selectNearestElement (selectedElement, degree) {
    if (degree === false) {
      return selectedElement
    }

    if (!selectedElement) {
      selectedElement = getSelectableElements()[0]
      if (!selectedElement) {
        return null
      }

      selectedElement.classList.add('selected')
      scrollParentToElement(selectedElement)
      return selectedElement
    }
  
    if (degree === 'false' && selectDelay) {
      clearTimeout(selectDelayTimeout)
      selectDelay = false
    }
  
    if (selectDelay) {
      return selectedElement
    }
  
    selectDelay = true
    let delayTime = 175
    selectDelayTimeout = setTimeout(() => selectDelay = false, delayTime)
  
    let direction = degreeToDirection(degree)
    let nearestElement = findNearestSelectableElement(selectedElement, direction)
  
    if (nearestElement) {
      selectedElement.classList.remove('selected')
      selectedElement = nearestElement
      selectedElement.classList.add('selected')
    }

    scrollParentToElement(selectedElement)
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

  function getPosition (element) {
    let xPosition = 0
    let yPosition = 0
    let width = element.offsetWidth
    let height = element.offsetHeight
  
    while (element) {
      xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft)
      yPosition += (element.offsetTop - element.scrollTop + element.clientTop)
      element = element.offsetParent
    }

    let x = xPosition + width / 2
    let y = yPosition + height / 2
  
    return { x, y }
  }

  function findNearestSelectableElement (selectedElement, direction) {
    const rect1 = getBoundingRect(selectedElement)
    const { x, y } = getPosition(selectedElement)

    let nearestElement = null
    let nearestDistance = Infinity
    let selectableElements = getSelectableElements()

    for (let element of selectableElements) {
      if (element === selectedElement) {
        continue
      }

      const rect2 = getBoundingRect(element)
      const elementPosition = getPosition(element)
      const elX = elementPosition.x
      const elY = elementPosition.y

      if (direction == 'left' && (elX >= x || rect1.y1 > rect2.y2 || rect1.y2 < rect2.y1)) {
        continue
      } else if (direction == 'right' && (elX <= x || rect1.y1 > rect2.y2 || rect1.y2 < rect2.y1)) {
        continue
      } else if (direction == 'up' && elY >= y) {
        continue
      } else if (direction == 'down' && elY <= y) {
        continue
      }      

      let rectDistance = calcRectDistance(rect1, rect2, direction)
      if (rectDistance < nearestDistance) {
        nearestDistance = rectDistance
        nearestElement = element
      }
    }

    return nearestElement  
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
    if (value == Math.floor(value)) return Math.round(value) + ''
    return value.toFixed(digits)
  }

  function listToString (list, seperator='and') {
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
  
    if (degree == false) {
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

  return {
    ucfirst, renderNumber, listToString, ansiToHtml,
    copperToMoneyString, getActions, getMerc,
    selectNearestElement, isGamepadConnected,
    selectMovementDirection, moveInSelectedDirection
  }
}