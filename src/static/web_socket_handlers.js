import jiff from 'jiff'

import { CHANNEL_COLORS } from '@/static/constants'
import { addLine, state, setMode } from '@/static/state'
import { processTriggers } from '@/static/triggers'

import { useLocalStorageHandler } from '@/composables/local_storage_handler'
import { useHelpers } from '@/composables/helpers'

const { addToken } = useLocalStorageHandler()
const { ansiToHtml, strToLines } = useHelpers()

export function onWebSocketEvent (cmd, msg, reqId) {
  if (state.pendingRequests[reqId]) {
    let { resolve } = state.pendingRequests[reqId]
    delete state.pendingRequests[reqId]
    resolve(cmd, msg)
    return
  }

  if (!webSocketHandlers[cmd]) {
    console.log(`unhandled websocket event: ${cmd}`)
    return
  }

  webSocketHandlers[cmd](msg)
}

const webSocketHandlers = {
  'state.patch': ({ patch }) => {
    try {
      state.gameState = jiff.patch(patch, state.gameState)
    } catch (err) {
      console.log(err.stack)
    }
  },
  
  'login.nameAvailable': () => {
    state.nameExistsResolve()
    state.nameExistsReject = null
    state.nameExistsResolve = null
  },

  'login.nameExists': () => {
    state.nameExistsReject(new Error('login.nameExists'))
    state.nameExistsReject = null
    state.nameExistsResolve = null
  },
  
  'login.fail': () => {
    state.loginReject(new Error('login.fail'))
    state.loginResolve = null
    state.loginReject = null
  },
  
  'token.fail': () => {
    state.token = ''
  },
  
  'token.success': ({ name, token }) => {
    state.name = name
    state.token = token
    state.disconnected = false
  
    state.prevModes = ['login']
    state.mode = 'hotkey'
  
    addToken(name, token)
  
    if (state.loginResolve) {
      state.loginResolve()
      state.loginResolve = null
      state.loginReject = null
    }
  
    state.modals.loginModal = false
    state.modals.newPlayerModal = false
  },
  
  'out': (line) => {
    let lines = strToLines(line)
    for (let line of lines) {
      addLine(line, 'output')
      processTriggers(line)
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
    }, 1000)
  },

  'affect.cure': ({ target, amount }) => {
    let animation = { key: Math.random(), type: 'healing', eid: target, amount }
  
    setTimeout(() => {
      state.animations.push(animation)
      state.nextAnimationDelay += 200
    }, state.nextAnimationDelay)
  
    setTimeout(() => {
      state.animations = state.animations.filter(a => a.key != animation.key)
      state.nextAnimationDelay -= 200
    }, 1000)
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
    if (['chat', 'trade', 'newbie'].includes(channel)) {
      if (state[channel].find(msg => msg.id == id)) {
        return
      }
  
      let unread = true
      if (state.activeTab == channel) {
        unread = false
      }
  
      addLine({ id, from, to, timestamp, message, unread }, channel)
  
      if (state.options.chatInMain) {
        out = `<span class="bold-yellow">${from}</span> <span class="${CHANNEL_COLORS[channel]}">${channel}${from == 'You' ? '' : 's'}</span> <span class="bold-white">'${message}'</span>`
      }
    } else if (['party'].includes(channel)) {
      out = `<span class="green">[<span class="bold-green">Party</span><span class="green">] <span class="bold-yellow">${from}</span> <span class="bold-white">${message}</span>`
  
    } else if (['tell'].includes(channel)) {
      if (from == 'You') {
        out = `<span class="magenta">You tell</span> <span class="bold-magenta">${to}</span> <span class="bold-white">${message}</span>`
      } else {
        out = `<span class="bold-magenta">${from}</span> <span class="magenta">tells you</span> <span class="bold-white">${message}</span>`
      }
  
    } else if (['info', 'announce', 'events'].includes(channel)) {
      out = message
  
    } else {
      out = `<span class="bold-yellow">${from}</span> <span class="bold-white">${channel}${from == 'You' ? '' : 's'}</span> '${message}'`
    }
    if (out) {
      addLine(out, 'output')
      processTriggers(out)
    }
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
    state.help.contents.push(helpFile)
    state.help.openEntries.push(helpFile)
    state.gamepadHelpTab = entry
    if (!state.modals.helpModal) {
      console.log(`opening help modal`)
      state.modals.helpModal = !state.modals.helpModal
      setMode('modal')
    }
  },
  
  'help.search': ({ matches }) => {
    state.help.searchResults = matches
  }
}
