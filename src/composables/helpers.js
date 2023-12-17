import { state } from "@/composables/state"
import { action_mapper } from '@/composables/constants/action_mapper'

const AU = require('ansi_up')
const ansi_up = new AU.default
ansi_up.use_classes = true

const ansi = {
  boldBlack: String.fromCharCode(27) + '[90m',
  boldRed: String.fromCharCode(27) + '[91m',
  boldWhite: String.fromCharCode(27) + '[97m',
  reset: String.fromCharCode(27) + '[0m'
}

const replacements = [
  { from: '1;30m', to: '90m' },
  { from: '1;31m', to: '91m' },
  { from: '1;32m', to: '92m' },
  { from: '1;33m', to: '93m' },
  { from: '1;34m', to: '94m' },
  { from: '1;35m', to: '95m' },
  { from: '1;36m', to: '96m' },
  { from: '1;37m', to: '97m' },
]

export function useHelpers () {
  function copperToMoneyString (amount, short) {
    let valueString = ''
    let copperString = amount.toString()

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
    action_mapper.map(action => {
      if (action.condition(item)) {
        playerActions.push(action.action)
      }
    })

    action_mapper.map(action => {
      if (action.condition(item) && !action.crafting) {
        mercActions.push(action.action)
      }
    })

    return isPlayer ? playerActions : mercActions;
  }

  function ansiToHtml (str) {
    for (let { from, to } of replacements) {
      str = str.replace(new RegExp(from, 'g'), to)
    }

    return ansi_up.ansi_to_html(str)
  }

  function getMerc () {
    const merc = Object.values(state.gameState.charmies)
      .find(charmie => charmie && charmie.traits && charmie.traits.includes('mercenary'))

    if (!merc) {
      state.gameState.mercEid = -1
      return false
    }

    state.gameState.mercEid = merc.stats.eid
    return merc
  }

  function getSelectableElements () {
    return Array.from(document.querySelectorAll('.selectable'))
      .filter(el => {
        if (el.offsetParent === null) {
          return false
        }

        const rect = el.getBoundingClientRect()
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        )
      })
  }

  let selectDelay = false
  let selectDelayTimeout = null
  function selectNearestElement (selectedElement, degree) {
    if (degree === false) {
      // if (selectDelay) {
      //   clearTimeout(selectDelayTimeout)
      //   selectDelay = false
      // }
      return selectedElement
    }

    if (!selectedElement) {
      selectedElement = getSelectableElements()[0]
      if (!selectedElement) {
        return null
      }

      selectedElement.classList.add('selected')
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

  function distance (x1, y1, x2, y2) {
    let a = x1 - x2
    let b = y1 - y2
    return Math.sqrt(a * a + b * b)
  }

  function calcRectDistance (rect1, rect2) {
    let left = rect2.x2 < rect1.x1
    let right = rect1.x2 < rect2.x1
    let bottom = rect2.y2 < rect1.y1
    let top = rect1.y2 < rect2.y1

    if (top && left) {
      return distance(rect1.x1, rect1.y2, rect2.x2, rect2.y1)
    } else if (left && bottom) {
      return distance(rect1.x1, rect1.y1, rect2.x2, rect2.y2)
    } else if (bottom && right) {
      return distance(rect1.x2, rect1.y1, rect2.x1, rect2.y2)
    } else if (right && top) {
      return distance(rect1.x2, rect1.y2, rect2.x1, rect2.y1)
    } else if (left) {
      return rect1.x1 - rect2.x2
    } else if (right) {
      return rect2.x1 - rect1.x2
    } else if (bottom) {
      return rect1.y1 - rect2.y2
    } else if (top) {
      return rect2.y1 - rect1.y2
    } else {
      return 0
    }
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

      if (direction == 'left' && elX >= x) {
        continue
      } else if (direction == 'right' && elX <= x) {
        continue
      } else if (direction == 'up' && elY >= y) {
        continue
      } else if (direction == 'down' && elY <= y) {
        continue
      }

      let rectDistance = calcRectDistance(rect1, rect2)

      // let distanceHorizontal = Math.abs(elX - x)
      // let distanceVertical = Math.abs(elY - y)

      // if (direction == 'left' || direction == 'right') {
      //   distanceVertical *= 4
      // } else {
      //   distanceHorizontal *= 4
      // }
  
      // let distance = Math.sqrt(distanceHorizontal * distanceHorizontal + distanceVertical * distanceVertical)
      if (rectDistance < nearestDistance) {
        nearestDistance = rectDistance
        nearestElement = element
      }
    }

    return nearestElement  
  }

  return {
    copperToMoneyString, getActions, ansiToHtml, getMerc, ansi, selectNearestElement
  }
}