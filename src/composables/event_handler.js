import {processTriggers} from "@/composables/triggers";

const { ansiSpan } = require('ansi-to-span')

import { state, addLine } from '@/composables/state'
import { helpers } from '@/composables/helpers'

const { ansiToHtml } = helpers()

const handlers = {}

handlers['welcome'] = (msg) => {
  let lines = msg.picture.split('\n')
  lines.pop()
  lines.pop()
  state.picture = ansiSpan(lines.join('\n'))
}

handlers['login.nameAvailable'] = () => {
  state.nameExistsResolve()
  state.nameExistsReject = null
  state.nameExistsResolve = null
}

handlers['login.nameExists'] = () => {
  state.nameExistsReject(new Error('login.nameExists'))
  state.nameExistsReject = null
  state.nameExistsResolve = null
}

handlers['login.fail'] = () => {
  if (state.loginReject) {
    state.loginReject(new Error('login.fail'))
    state.loginResolve = null
    state.loginReject = null
  }
}

handlers['token.fail'] = () => {
  state.token = ''
}

handlers['token.success'] = ({ name, token }) => {
  state.name = name
  state.token = token
  state.disconnected = false

  let prefs = { name, token }
  document.cookie = `prefs=${JSON.stringify(prefs)}; path=/; max-age=${60*60*24*14};`

  if (state.loginResolve) {
    state.loginResolve()
    state.loginResolve = null
    state.loginReject = null
  }

  state.showLogin = false
  state.showNewPlayer = false
}

handlers['out'] = (line) => {
  let lines = strToLines(line)
  for (let line of lines) {
    addLine(line, 'output')
    processTriggers(line)
  }
}

handlers['room.describe'] = ({ desc, map }) => {
  let lines = strToLines(desc)

  if (state.options.hideSidebar) {
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
}

let nextAnimationDelay = 0

handlers['entity.attack'] = ({ target, amount, crit }) => {
  let animation = { key: Math.random(), type: 'damage', eid: target, amount, crit }

  setTimeout(() => {
    state.animations.push(animation)
    nextAnimationDelay += 200
  }, nextAnimationDelay)

  setTimeout(() => {
    state.animations = state.animations.filter(a => a.key != animation.key)
    nextAnimationDelay -= 200
  }, 1000)
}

handlers['affect.cure'] = ({ target, amount }) => {
  let animation = { key: Math.random(), type: 'healing', eid: target, amount }

  setTimeout(() => {
    state.animations.push(animation)
    nextAnimationDelay += 200
  }, nextAnimationDelay)

  setTimeout(() => {
    state.animations = state.animations.filter(a => a.key != animation.key)
    nextAnimationDelay -= 200
  }, 1000)
}

const channelColors = { chat: 'bold-yellow', trade: 'bold-green', newbie: 'bold-magenta' }
handlers['channel.msg'] = ({ id, from, to, channel, timestamp, message }) => {
  if (from == state.gameState.player.name) {
    from = 'You'
  }

  if (from == state.gameState.player.name) {
    to = 'You'
  }

  const stripTags = /<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi

  message = ansiToHtml(`\u{1b}[0m${message.replace(stripTags, '')}`)

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
      out = `<span class="bold-yellow">${from}</span> <span class="${channelColors[channel]}">${channel}${from == 'You' ? '' : 's'}</span> <span class="bold-white">'${message}'</span>`
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
}

handlers['state.update'] = ({ update }) => {
  state.gameState = updateState(state.gameState, update)
}

function updateState (obj, update) {
  try {
    for (let key in update) {
      if (update[key] && typeof update[key] == 'object' && !Array.isArray(update[key])) {
        if (Object.keys(update[key]).length == 0) {
          obj[key] = {}
        } else {
          obj[key] = updateState(obj[key] || {}, update[key])
        }
      } else {
        obj[key] = update[key]
      }
    }
    return obj
  } catch (err) {
    console.log(err.stack)
  }
}

function strToLines (str) {
  let lines = str.trim().split('\n')
  return lines.map((line) => ansiToHtml(line))
}

export function useEventHandler () {
  function onEvent (cmd, msg, id) {
    if (handlers[cmd]) {
      // Do not print in output if and ID has been passed to cmd
      id ? null : handlers[cmd](msg)
      return
    }

    let matches = cmd.match(/^entity-(\d+)$/)
    if (matches && state.pendingRequests[cmd]) {
      let eid = parseInt(matches[1], 10)
      let { resolve, timeout } = state.pendingRequests[cmd]
      state.cache.entityCache[eid] = { entity: msg, date: Date.now() }
      delete state.pendingRequests[cmd]
      clearTimeout(timeout)
      resolve(msg)
      return
    }

    matches = cmd.match(/^item-(\d+)$/)
    if (matches && state.pendingRequests[cmd]) {
      let iid = parseInt(matches[1], 10)
      let { resolve, timeout } = state.pendingRequests[cmd]
      state.cache.itemCache[iid] = { item: msg, date: Date.now() }
      delete state.pendingRequests[cmd]
      clearTimeout(timeout)
      resolve(msg)
      return
    }

    matches = cmd.match(/^items-(\d+)$/)
    if (matches && state.pendingRequests[cmd]) {
      for (let item of msg) {
        state.cache.itemCache[item.iid] = { item, date: Date.now() }
      }

      let { resolve, timeout, iids } = state.pendingRequests[cmd]
      delete state.pendingRequests[cmd]
      clearTimeout(timeout)

      let items = []
      for (let iid of iids) {
        if (state.cache.itemCache[iid]) {
          items.push(state.cache.itemCache[iid].item)
        }
      }

      resolve(items)
      return
    }

    matches = cmd.match(/^entities-(\d+)$/)
    if (matches && state.pendingRequests[cmd]) {
      for (let entity of msg) {
        state.cache.entityCache[entity.eid] = { entity, date: Date.now() }
      }

      let { resolve, timeout, eids } = state.pendingRequests[cmd]
      delete state.pendingRequests[cmd]
      clearTimeout(timeout)

      let entities = []
      for (let eid of eids) {
        if (state.cache.entityCache[eid]) {
          entities.push(state.cache.entityCache[eid].entity)
        }
      }

      resolve(entities)
      return
    }
  }

  return {
    onEvent
  }
}
