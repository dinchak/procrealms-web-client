import jiff from 'jiff'

import { addLine, state, setMode } from '@/static/state'
import { processTriggers } from '@/static/triggers'
import { playMessageSound, playTrackByName } from '@/static/sound'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml, strToLines, renderMessage, getTellMessageFrom } = useHelpers()

export function onWebSocketEvent (cmd, msg, reqId) {
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
    try {
      // uncomment to help debug desyncs
      // for (let operation of patch) {
      //   console.log(operation)
      //   state.gameState = jiff.patch([operation], state.gameState)
      // }

      // comment out this if you uncomment the above
      state.gameState = jiff.patch(patch, state.gameState)
    } catch (err) {
      addLine(`>>> <span class="bold-red">Client has desynced</span>. Use <span class="bold-white">config syncrate</span> to set a higher sync rate.\n${err.message}`, 'output')
      console.log(err.stack)
    }
  },

  'out': line => {
    let lines = strToLines(line)
    for (let ln of lines) {
      addLine(ln, 'output')
      processTriggers(ln)
    }
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
      processTriggers(line)
    }
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
      processTriggers(out)
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
