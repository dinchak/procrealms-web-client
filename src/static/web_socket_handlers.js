import jiff from 'jiff'

import { addLine, incrementPerformanceDiagnostic, state, setMode } from '@/static/state'
import { processTriggersBatch } from '@/static/triggers'
import { playMessageSound, playTrackByName } from '@/static/sound'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml, strToLines, renderMessage, getTellMessageFrom } = useHelpers()

function getTopLevelPatchKey (path) {
  if (!path || path == '/') {
    return null
  }

  const pathParts = path.split('/').filter(Boolean)
  return pathParts.length ? pathParts[0] : null
}

function normalizePatchPathToSection (path, topLevelKey) {
  if (!path) {
    return path
  }

  const base = `/${topLevelKey}`
  if (path == base) {
    return '/'
  }

  if (path.startsWith(base + '/')) {
    return path.slice(base.length)
  }

  return path
}

function normalizePatchOperationToSection (operation, topLevelKey) {
  const normalized = { ...operation }

  if (typeof normalized.path == 'string') {
    normalized.path = normalizePatchPathToSection(normalized.path, topLevelKey)
  }

  if (typeof normalized.from == 'string') {
    normalized.from = normalizePatchPathToSection(normalized.from, topLevelKey)
  }

  return normalized
}

function isInvalidPatchOperationError (err) {
  const message = String(err && err.message ? err.message : '')

  return err && (
    err.name == 'InvalidPatchOperationError' ||
    message.includes('InvalidPatchOperationError') ||
    message.includes('path does not exist') ||
    message.includes('outside of array bounds')
  )
}

function parsePointerSegments (pointer) {
  if (typeof pointer != 'string' || pointer == '' || pointer == '/') {
    return []
  }

  return pointer
    .split('/')
    .slice(1)
    .map(segment => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
}

function isArrayIndexSegment (segment) {
  return typeof segment == 'string' && /^\d+$/.test(segment)
}

function isArrayPathCandidate (pointer, { allowAppend = false } = {}) {
  const segments = parsePointerSegments(pointer)
  if (!segments.length) {
    return false
  }

  const lastSegment = segments[segments.length - 1]
  if (allowAppend && lastSegment == '-') {
    return true
  }

  return isArrayIndexSegment(lastSegment)
}

function shouldIgnoreInvalidPatchOperation ({ op, path, from }, err) {
  if (!isInvalidPatchOperationError(err)) {
    return false
  }

  const message = String(err && err.message ? err.message : '')
  const operationPath = typeof path == 'string' ? path : ''
  const fromPath = typeof from == 'string' ? from : ''

  const listOps = ['add', 'remove', 'replace', 'move']
  const isListPathOperation =
    (listOps.includes(op) && isArrayPathCandidate(operationPath, { allowAppend: op == 'add' })) ||
    (op == 'move' && isArrayPathCandidate(fromPath))

  if (isListPathOperation && (
    message.includes('path does not exist') ||
    message.includes('outside of array bounds')
  )) {
    return true
  }

  if (['remove', 'replace', 'test'].includes(op) && message.includes('path does not exist')) {
    return true
  }

  if (op == 'add' && message.includes('outside of array bounds')) {
    return true
  }

  return false
}

function applyPatchWithTolerance (patch, initialState) {
  let nextState = initialState

  for (const operation of patch) {
    try {
      nextState = jiff.patch([operation], nextState)
    } catch (err) {
      if (shouldIgnoreInvalidPatchOperation(operation, err)) {
        incrementPerformanceDiagnostic('patchToleratedOperations')
        continue
      }

      throw err
    }
  }

  return nextState
}

function canUseTopLevelScopedPatch (patch) {
  for (const operation of patch) {
    const topLevelKey = getTopLevelPatchKey(operation.path)
    if (!topLevelKey) {
      return false
    }

    if (typeof operation.from == 'string') {
      const fromTopLevelKey = getTopLevelPatchKey(operation.from)
      if (!fromTopLevelKey || fromTopLevelKey != topLevelKey) {
        return false
      }
    }
  }

  return true
}

function applyTopLevelScopedPatch (patch) {
  if (!canUseTopLevelScopedPatch(patch)) {
    incrementPerformanceDiagnostic('patchFallbackFullState')
    state.gameState = applyPatchWithTolerance(patch, state.gameState)
    return state.gameState
  }

  const touchedKeys = new Set()
  const patchByTopLevelKey = new Map()
  let hasRootOperation = false

  for (let op of patch) {
    const topLevelKey = getTopLevelPatchKey(op.path)
    if (!topLevelKey) {
      hasRootOperation = true
      break
    }

    if (!patchByTopLevelKey.has(topLevelKey)) {
      patchByTopLevelKey.set(topLevelKey, [])
    }
    patchByTopLevelKey.get(topLevelKey).push(normalizePatchOperationToSection(op, topLevelKey))

    touchedKeys.add(topLevelKey)
  }

  if (hasRootOperation) {
    incrementPerformanceDiagnostic('patchFallbackFullState')
    state.gameState = applyPatchWithTolerance(patch, state.gameState)
    return state.gameState
  }

  for (const key of touchedKeys) {
    const sectionPatch = patchByTopLevelKey.get(key) || []

    if (!sectionPatch.length) {
      continue
    }

    const currentSection = state.gameState[key]
    const nextSection = applyPatchWithTolerance(sectionPatch, currentSection)
    if (state.gameState[key] !== nextSection) {
      state.gameState[key] = nextSection
    }
  }

  incrementPerformanceDiagnostic('patchTopLevelFastPath')
  incrementPerformanceDiagnostic('patchTouchedTopLevelKeys', touchedKeys.size)
  return state.gameState
}

export function onWebSocketEvent (cmd, msg, reqId) {
  incrementPerformanceDiagnostic('websocketEvents')

  if (reqId && reqId.startsWith('inventory-output-')) {
    if (!state.inventoryOutput[reqId]) {
      state.inventoryOutput[reqId] = ''
    }
    state.inventoryOutput[reqId] += msg
  }

  if (state.pendingRequests[reqId] && reqId != 'the_void') {
    let { resolve } = state.pendingRequests[reqId]
    delete state.pendingRequests[reqId]
    resolve(cmd, msg)
    return
  }

  if (!webSocketHandlers[cmd]) {
    return
  }

  webSocketHandlers[cmd](msg)
}

const webSocketHandlers = {
  'state.patch': ({ patch }) => {
    incrementPerformanceDiagnostic('websocketPatchOperations', patch.length)

    try {
      // uncomment to help debug desyncs
      // for (let operation of patch) {
      //   console.log(operation)
      //   state.gameState = jiff.patch([operation], state.gameState)
      // }

      applyTopLevelScopedPatch(patch)

      // invalidate caches for any items/entities that were removed/changed
      for (let line of patch) {
        const { value } = line

        if (value && typeof value == 'object') {
          if (value.iid) {
            delete state.cache.itemCache[value.iid]
          }
          if (value.eid) {
            delete state.cache.entityCache[value.eid]
          }
        }
      }

    } catch (err) {
      try {
        incrementPerformanceDiagnostic('patchFallbackFullState')
        state.gameState = applyPatchWithTolerance(patch, state.gameState)
      } catch (fallbackErr) {
        addLine(`>>> <span class="bold-red">Client has desynced</span>. Use <span class="bold-white">config syncrate</span> to set a higher sync rate.\n${fallbackErr.message}`, 'output')
        console.log(fallbackErr.stack)
      }
    }
  },

  'out': line => {
    let lines = strToLines(line)
    incrementPerformanceDiagnostic('websocketOutputLines', lines.length)

    for (let ln of lines) {
      addLine(ln, 'output')
    }

    incrementPerformanceDiagnostic('triggerCalls', lines.length)
    processTriggersBatch(lines)
  },

  'auction.list': ({ auctions, numPages, totalNumAuctions, page, sort, sortDir }) => {
    state.auction.auctions = auctions
    state.auction.numPages = numPages
    state.auction.totalNumAuctions = totalNumAuctions
    state.auction.page = page
    state.auction.sort = sort
    state.auction.sortDir = sortDir
  },

  'mail.list': ({ mail }) => {
    state.mail.mailItems = mail
  },

  'room.describe': ({ desc, map }) => {
    let lines = strToLines(desc)

    if (state.options.roomDescriptionMinimap) {
      let linesWithMap = []
      let numLines = Math.max(lines.length, map.length)

      for (let i = 0; i < numLines; i++) {
        let line = ansiToHtml(map[i] || '') + ' ' + (lines[i] || '')
        linesWithMap.push(line)
      }

      lines = linesWithMap
    }

    for (let line of lines) {
      addLine(line, 'output')
    }

    incrementPerformanceDiagnostic('triggerCalls', lines.length)
    processTriggersBatch(lines)
  },

  'entity.attack': ({ target, amount, crit }) => {
    let animation = { key: Math.random(), type: 'damage', eid: target, amount, crit }

    setTimeout(() => {
      state.animations.push(animation)
      state.nextAnimationDelay += 200
    }, state.nextAnimationDelay)

    setTimeout(() => {
      state.animations = state.animations.filter(a => a.key != animation.key)
      state.nextAnimationDelay -= 200
    }, 2000)
  },

  'effect.cure': ({ target, amount }) => {
    let animation = { key: Math.random(), type: 'healing', eid: target, amount }

    setTimeout(() => {
      state.animations.push(animation)
      state.nextAnimationDelay += 200
    }, state.nextAnimationDelay)

    setTimeout(() => {
      state.animations = state.animations.filter(a => a.key != animation.key)
      state.nextAnimationDelay -= 200
    }, 2000)
  },

  'channel.msg': ({ id, from, to, channel, timestamp, message }) => {
    if (from == state.gameState.player.name) {
      from = 'You'
    }

    if (from == state.gameState.player.name) {
      to = 'You'
    }

    message = ansiToHtml(`\u{1b}[0m${message}`)

    let out = ''

    if (['say', 'yell'].includes(channel)) {
      out = renderMessage({ channel, from, to, message })
      addLine(out, 'output')

    } else {
      state.messages.push({ id, from, to, channel, timestamp, message, unseen: true })

      let channelKey = channel
      if (channel == 'tell') {
        let tellFrom = getTellMessageFrom({ from, to, channel })
        channelKey = `tell-${tellFrom}`
      }

      if (!state.unseenMessageCount[channelKey]) {
        state.unseenMessageCount[channelKey] = 0
      }
      state.unseenMessageCount[channelKey]++

      if (state.messages.length > 1000) {
        state.messages.shift()
      }

      if (state.options.chatInMain) {
        out = renderMessage({ channel, from, to, message })
        addLine(out, 'output')
      }
    }

    if (out) {
      incrementPerformanceDiagnostic('triggerCalls')
      processTriggersBatch([out])
    }

    playMessageSound({ id, from, to, channel, timestamp, message })
  },

  'map.settings': ({ width, height, enabled }) => {
    if (state.options.showSideMap != enabled) {
      state.options.showSideMap = enabled
    }

    if (state.options.sideMapHeight != height) {
      state.options.sideMapHeight = height
    }

    if (state.options.sideMapWidth != width) {
      state.options.sideMapWidth = width
    }
  },

  'help.topics': ({ topics }) => {
    state.help.topics = topics
    state.help.topicsLoaded = true
  },

  'help.entry': ({ entry, content }) => {
    let helpFile = { entry, content }
    if (!state.help.openEntries.some(e => e.entry == entry)) {
      state.help.contents.push(helpFile)
      state.help.openEntries.push(helpFile)
    }
    state.gamepadHelpTab = entry
    if (!state.modals.helpModal) {
      state.modals.helpModal = !state.modals.helpModal
      setMode('modal')
    }
  },

  'help.search': ({ matches }) => {
    state.help.searchResults = matches
  },

  'shop.list': ({ items, shopkeeper, prices }) => {
    state.shop.items = items
    state.shop.shopkeeper = shopkeeper
    state.shop.prices = prices
  },

  'item.craftable': ({ items }) => {
    state.crafting.recipes = items
  },

  'mail.count': ({ count }) => {
    state.mail.count = count
  },

  'client.media.play': ({ name }) => {
    // Intercept known OST tracks
    if (!state.options.autoplayMusic || state.music.audioContext?.state === 'suspended') {
      return
    }

    switch (name) {
    case "music/ost/my-portal.mp3":
      playTrackByName('My Portal')
      break

    case "music/ost/the-endless-sands.mp3":
      playTrackByName('The Endless Sands')
      break

    case "music/ost/the-hidden-grove.mp3":
      playTrackByName('The Hidden Grove')
      break

    case "music/ost/the-nexus.mp3":
      playTrackByName('The Nexus')
      break

    case "music/ost/the-plains.mp3":
      playTrackByName('The Great Plains')
      break

    case "music/ost/the-shrine.mp3":
      playTrackByName('The Shrine')
      break
    }
  }
}
