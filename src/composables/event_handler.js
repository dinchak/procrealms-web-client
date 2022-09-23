import { ansiSpan } from 'ansi-to-span'

const Convert = require('ansi-to-html')
const convert = new Convert({
  colors: {
    0: '#333333',
    1: '#c50f1f',
    2: '#13a10e',
    3: '#c19c00',
    4: '#0037da',
    5: '#881798',
    6: '#3a96dd',
    7: '#cccccc',
    8: '#767676',
    9: '#e74856',
    10: '#16c60c',
    11: '#f9f1a5',
    12: '#3b78ff',
    13: '#b4009e',
    14: '#61d6d6',
    15: '#f2f2f2',
  }
})

import { state } from '@/composables/state'

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
  console.log('reject nameExists')
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
    state.output.push(line)
  }
}

handlers['room.describe'] = ({ desc }) => {
  let lines = strToLines(desc)
  for (let line of lines) {
    state.output.push(line)
  }
}

handlers['channel.msg'] = ({ id, name, channel, timestamp, message }) => {
  if (name == state.gameState.player.name) {
    name = 'You'
  }

  if (['gossip', 'trade', 'newbie'].includes(channel)) {
    if (state[channel].find(msg => msg.id == id)) {
      return
    }
    state[channel].push({ id, name, message, timestamp })
  } else if (['info', 'announce', 'party', 'tell'].includes(channel)) {
    state.output.push(convert.toHtml(message))
  } else {
    let output = `<span class="bold-yellow">${name}</span> <span class="bold-white">${channel}${name == 'You' ? '' : 's'}</span> '${convert.toHtml(message)}`
    state.output.push(output)
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
  // lines.unshift('')
  return lines.map((line) => {
    // return ansiSpan(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
    return convert.toHtml(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
  })
}

export function useEventHandler () {
  function onEvent (cmd, msg) {
    if (handlers[cmd]) {
      handlers[cmd](msg)
      return
    }

    let matches = cmd.match(/^entity-(\d+)$/)
    if (matches) {
      delete state.pendingRequests[cmd]
      state.entityCache[msg.eid] = msg
      return
    }

    matches = cmd.match(/^item-(\d+)$/)
    if (matches) {
      delete state.pendingRequests[cmd]
      state.itemCache[msg.iid] = msg
      return
    }
  }

  return {
    onEvent
  }
}