import { state, addLine } from '@/composables/state'
import { helpers } from '@/composables/helpers'

const { ansiToHtml } = helpers()

const handlers = {}

handlers['welcome'] = (msg) => {
  let lines = msg.picture.split('\n')
  lines.pop()
  lines.pop()
  state.picture = ansiToHtml(lines.join('\n'))
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
  }
}

handlers['room.describe'] = ({ desc }) => {
  let lines = strToLines(desc)
  for (let line of lines) {
    addLine(line, 'output')
  }
}

const channelColors = { gossip: 'bold-yellow', trade: 'bold-green', newbie: 'bold-magenta' }
handlers['channel.msg'] = ({ id, from, to, channel, timestamp, message }) => {
  if (from == state.gameState.player.name) {
    from = 'You'
  }

  if (from == state.gameState.player.name) {
    to = 'You'
  }

  const stripTags = /<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi

  message = ansiToHtml(`\u{1b}[0m${message.replace(stripTags, '')}`)

  if (['gossip', 'trade', 'newbie'].includes(channel)) {
    if (state[channel].find(msg => msg.id == id)) {
      return
    }

    let unread = true
    if (state.activeTab == channel) {
      unread = false
    }

    addLine({ id, from, to, timestamp, message, unread }, channel)

    if (state.options.chatInMain) {
      let out = `<span class="bold-yellow">${from}</span> <span class="${channelColors[channel]}">${channel}${from == 'You' ? '' : 's'}</span> <span class="bold-white">'${message}'</span>`
      addLine(out, 'output')
    }
  } else if (['party'].includes(channel)) {
    let out = `<span class="green">[<span class="bold-green">Party</span><span class="green">] <span class="bold-yellow">${from}</span> <span class="bold-white">${message}</span>`
    addLine(out, 'output')

  } else if (['tell'].includes(channel)) {
    if (from == 'You') {
      let out = `<span class="magenta">You tell</span> <span class="bold-magenta">${to}</span> <span class="bold-white">${message}</span>`
      addLine(out, 'output')
    } else {
      let out = `<span class="bold-magenta">${from}</span> <span class="magenta">tells you</span> <span class="bold-white">${message}</span>`
      addLine(out, 'output')
    }

  } else if (['info', 'announce'].includes(channel)) {
    addLine(message, 'output')

  } else {
    let out = `<span class="bold-yellow">${from}</span> <span class="bold-white">${channel}${from == 'You' ? '' : 's'}</span> '${message}'`
    addLine(out, 'output')
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
        items.push(state.cache.itemCache[iid].item)
      }
      resolve(items)
      return
    }
  }

  return {
    onEvent
  }
}