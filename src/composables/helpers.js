import { AnsiUp } from 'ansi_up'

import { getOrderCmd, state, updateCounter } from '@/static/state'
import { ANSI, ANSI_REPLACEMENTS, DIRECTION_MAP } from '@/static/constants'

import { useWebSocket } from '@/composables/web_socket'

const ansi_up = new AnsiUp()
ansi_up.use_classes = true

const { runCommand, move, enter, fetchItem } = useWebSocket()

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

  function getActions (item) {
    let actions = [{
      label: 'Drop',
      onClick: () => runCommand(`${getOrderCmd()}drop iid:${item.iid}`),
      class: 'bold-red',
      disabled: false
    }]

    if (item.amount > 1) {
      actions.push({
        label: 'Drop All',
        onClick: () => runCommand(`${getOrderCmd()}drop all iid:${item.iid}`),
        class: 'bold-red',
        disabled: false
      })
    }

    if (item.keeping) {
      actions.push({
        label: 'Unkeep',
        onClick: async () => {
          runCommand(`${getOrderCmd()}unkeep iid:${item.iid}`)
          delete state.cache.itemCache[item.iid]
          await fetchItem(item.iid)
          updateCounter.value++
        },
        class: 'bold-yellow',
        disabled: false
      })
    } else {
      actions.push({
        label: 'Keep',
        onClick: async () => {
          runCommand(`${getOrderCmd()}keep iid:${item.iid}`)
          delete state.cache.itemCache[item.iid]
          await fetchItem(item.iid)
          updateCounter.value++
        },
        class: 'bold-green',
        disabled: false
      })
    }

    if (item.type == 'consumable') {
      if (item.subtype == 'food') {
        actions.push({
          label: 'Eat',
          onClick: () => runCommand(`${getOrderCmd()}eat iid:${item.iid}`),
          class: 'bold-green',
          disabled: false
        })
      } else if (item.subtype == 'potion') {
        actions.push({
          label: 'Drink',
          onClick: () => runCommand(`${getOrderCmd()}drink iid:${item.iid}`),
          class: 'bold-green',
          disabled: false
        })
      } else {
        actions.push({
          label: 'Consume',
          onClick: () => runCommand(`${getOrderCmd()}consume iid:${item.iid}`),
          class: 'bold-green',
          disabled: false
        })
      }
    }

    if (state.gameState.room.flags.includes('store')) {
      actions.push({
        label: 'Sell',
        onClick: () => runCommand(`${getOrderCmd()}sell iid:${item.iid}`),
        class: 'bold-green',
        disabled: false
      })
    } else {
      actions.push({
        label: 'Sell',
        onClick: () => runCommand(`${getOrderCmd()}sell iid:${item.iid}`),
        class: 'bold-green',
        disabled: true
      })
    }

    if (item.type == 'weapon') {
      actions.push({
        label: 'Wield',
        onClick: () => runCommand(`${getOrderCmd()}wield iid:${item.iid}`),
        class: 'bold-red',
        disabled: false
      })
    }

    if (item.type == 'armor') {
      actions.push({
        label: 'Wear',
        onClick: () => runCommand(`${getOrderCmd()}wear iid:${item.iid}`),
        class: 'bold-red',
        disabled: false
      })
    }

    if (item.type == 'weapon' || item.type == 'armor') {
      actions.push({
        label: 'Compare',
        onClick: () => runCommand(`${getOrderCmd()}compare iid:${item.iid}`),
        class: 'bold-yellow',
        disabled: false
      })
    }

    if (item.type == 'weapon' || item.type == 'armor' || item.type == 'tool' || item.type == 'bag') {
      if (hasSkillsRequired(item)) {
        actions.push({
          label: 'Salvage',
          onClick: () => runCommand(`${getOrderCmd()}salvage iid:${item.iid}`),
          class: 'bold-yellow',
          disabled: false
        })
        if (item.type == 'tool') {
          actions.push({
            label: 'Repair',
            onClick: () => runCommand(`${getOrderCmd()}repair iid:${item.iid}`),
            class: 'bold-yellow',
            disabled: false
          })
        }
      }
    }

    if (item.type == 'material') {
      if (item.subtype == 'hide') {
        actions.push({
          label: 'Tan',
          onClick: () => runCommand(`${getOrderCmd()}tan iid:${item.iid}`),
          class: 'bold-yellow',
          disabled: false
        })
      }

      if (item.subtype == 'seed') {
        actions.push({
          label: 'Plant',
          onClick: () => runCommand(`${getOrderCmd()}plant iid:${item.iid}`),
          class: 'bold-yellow',
          disabled: false
        })
      }

      if (item.subtype == 'bandage') {
        actions.push({
          label: 'Wrap',
          onClick: () => runCommand(`${getOrderCmd()}wrap iid:${item.iid}`),
          class: 'bold-yellow',
          disabled: false
        })
      }

      if (item.subtype == 'fish') {
        actions.push({
          label: 'Filet',
          onClick: () => runCommand(`${getOrderCmd()}filet iid:${item.iid}`),
          class: 'bold-yellow',
          disabled: false
        })
      }
    }

    if (item.type == 'book' || item.type == 'scroll') {
      actions.push({
        label: 'Read',
        onClick: () => runCommand(`${getOrderCmd()}read iid:${item.iid}`),
        class: 'bold-magenta',
        disabled: false
      })
    }

    if (item.type == 'tool') {
      if (item.subtype == 'penned animal') {
        actions.push({
          label: 'Unpen',
          onClick: () => runCommand(`${getOrderCmd()}unpen iid:${item.iid}`),
          class: 'bold-yellow',
          disabled: false
        })
      }

      if (item.subtype == 'deployable') {
        actions.push({
          label: 'Unpack',
          onClick: () => runCommand(`${getOrderCmd()}unpack iid:${item.iid}`),
          class: 'bold-yellow',
          disabled: false
        })
      }
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

    selectDelayTimeout = setTimeout(() => {
      selectDelay = false
    }, delayTime)

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
      flags.push(ANSI.boldYellow + entity.combo + ' ' + ANSI.yellow + 'Combo' + ANSI.reset)
    }

    if (entity.rage > 0) {
      flags.push(ANSI.boldRed + entity.rage + ' ' + ANSI.red + 'Rage' + ANSI.reset)
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

  return {
    ucfirst, renderNumber, listToString, ansiToHtml,
    copperToMoneyString, getActions, getMerc, getPetEid,
    selectNearestElement, isGamepadConnected,
    selectMovementDirection, moveInSelectedDirection,
    calcMapSize, strToLines, progressStatus, effectBonuses,
    isOverflowX, isOverflowY, getEffectFlags, getEffectNames,
    range
  }
}