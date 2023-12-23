import { reactive, ref } from 'vue'

import { EventEmitter } from 'events'

export const state = reactive({
  connected: false,
  disconnected: false,

  pendingRequests: {},

  gameState: resetGameState(),
  inputMappings: resetInputMappings(),
  inputEmitter: new EventEmitter(),
  options: resetOptions(),
  cache: resetCache(),

  activeTab: 'output',
  // valid modes: login, hotkey, input, modal, radial
  mode: 'login',

  prevModes: [],

  metaKeyState: {
    shift: false,
    ctrl: false,
    alt: false
  },

  gamepadPrevStates: {},
  gamepads: {},
  gamepadTab: false,
  suggestedCommands: [],

  loginResolve: null,
  loginReject: null,
  nameExistsResolve: null,
  nameExistsReject: null,

  scrolledBack: {
    output: false,
    chat: false,
    trade: false,
    newbie: false
  },

  output: [],
  chat: [],
  trade: [],
  newbie: [],

  animations: [],
  triggers: ref(new Map()),
  variables: ref(new Map()),

  name: '',
  token: '',

  modals: {
    inventoryModals: {
      playerItemModal: ref(''),
      mercItemModal: ref('')
    },
    mapModal: false,
    mapModalSize: 'large',
    mercModal: false,
    triggersModal: false,
    helpModal: false,
    loginModal: false,
    logoutModal: false,
    newPlayerModal: false,
    gameModal: false
  }
})

export function resetState () {
  state.activeTab = 'output'
  state.mode = 'hotkey'
  state.prevModes = ['login']
  state.pendingRequests = []
  state.cache = resetCache()
  state.gameState = resetGameState()
  state.options = resetOptions()
  state.output = []
  state.chat = []
  state.trade = []
  state.newbie = []
  state.animations = []
  state.triggers.value = new Map()
  state.variables.value = new Map()
}

function resetCache () {
  return {
    entityCache: {},
    itemCache: {},
    commandCache: {}
  }
}

function resetGameState () {
  return {
    player: {},
    mercEid: -1,
    battle: {
      actions: {
        skills: [],
        spells: []
      },
      participants: []
    },
    channels: [],
    skills: [],
    affects: [],
    equipment: {},
    inventory: [],
    aliases: {},
    radials: [],
    quests: [],
    party: [],
    charmies: {},
    room: {
      exits: [],
      entities: [],
      items: []
    },
    map: [],
    slots: []
  }
}

function resetOptions () {
  return {
    chatInMain: true,
    fixedMap: false,
    fontFamily: 'DOS, monospace',
    fontSize: '16px',
    hideSidebar: true,
    keepSentCommands: false,
    mapModalSize: 'medium',
    numPadMovement: true,
    overlayControls: true,
    // showTabs: true,
    showMapArea: true,
    showQuickSlots: true,
    hudMovementControls: true,
    showOverlayMinimap: true,
    swapControls: false,
    wasdMovement: true,

    hudCommandControls: true,
  }
}

function resetInputMappings () {
  return [
    {
      label: 'Move North',
      event: 'moveNorth',
      keyCodes: ['Numpad8', 'KeyW', 'ArrowUp'],
      modes: ['hotkey']
    }, {
      label: 'Move South',
      event: 'moveSouth',
      keyCodes: ['Numpad2', 'KeyS', 'ArrowDown'],
      modes: ['hotkey']
    }, {
      label: 'Move East',
      event: 'moveEast',
      keyCodes: ['Numpad6', 'KeyD', 'ArrowRight'],
      modes: ['hotkey']
    }, {
      label: 'Move West',
      event: 'moveWest',
      keyCodes: ['Numpad4', 'KeyA', 'ArrowLeft'],
      modes: ['hotkey']
    }, {
      label: 'Move Northeast',
      event: 'moveNorthEast',
      keyCodes: ['Numpad9', 'KeyE'],
      modes: ['hotkey']
    }, {
      label: 'Move Northwest',
      event: 'moveNorthWest',
      keyCodes: ['Numpad7', 'KeyQ'],
      modes: ['hotkey']
    }, {
      label: 'Move Southeast',
      event: 'moveSouthEast',
      keyCodes: ['Numpad3', 'KeyC'],
      modes: ['hotkey']
    }, {
      label: 'Move Southwest',
      event: 'moveSouthWest',
      keyCodes: ['Numpad1', 'KeyZ'],
      modes: ['hotkey']
    }, {
      label: 'Enter',
      event: 'enter',
      keyCodes: ['Numpad5', 'KeyX'],
      modes: ['hotkey']
    }, {
      label: 'Toggle Collapsible Menu',
      event: 'toggleCollapsibleMenu',
      keyCodes: ['Space'],
      modes: ['hotkey']
    }, {
      label: 'Focus Text Input',
      event: 'focusTextInput',
      keyCodes: ['Enter'],
      modes: ['hotkey']
    }, {
      label: 'Blur Text Input',
      event: 'blurTextInput',
      keyCodes: ['Escape'],
      modes: ['input']
    }, {
      label: 'Send Command',
      event: 'sendCommand',
      keyCodes: ['Enter'],
      modes: ['input']
    }, {
      label: 'Previous Command',
      event: 'prevCommand',
      keyCodes: ['ArrowUp'],
      modes: ['input']
    }, {
      label: 'Next Command',
      event: 'nextCommand',
      keyCodes: ['ArrowDown'],
      modes: ['input']
    }, {
      label: 'Page Up',
      event: 'pageUp',
      keyCodes: ['PageUp'],
      gamepadButtons: [6],
      modes: ['hotkey', 'input'],
    }, {
      label: 'Page Down',
      event: 'pageDown',
      keyCodes: ['PageDown'],
      gamepadButtons: [7],
      modes: ['hotkey', 'input'],
    }, {
      label: 'Scroll Down',
      event: 'scrollDown',
      keyCodes: ['End'],
      gamepadButtons: [13],
      modes: ['hotkey', 'input'],
    }, {
      label: 'Open Help Modal',
      event: 'openHelpModal',
      keyCodes: [{ code: 'Slash', shift: true }],
      modes: ['hotkey'],
    }, {
      label: 'Show Debug',
      event: 'showDebug',
      keyCodes: ['Backquote'],
      modes: ['hotkey'],
    }, {
      label: 'Quick Slot 1',
      event: 'quickSlot1',
      keyCodes: ['Digit1'],
      modes: ['hotkey']
    }, {
      label: 'Quick Slot 2',
      event: 'quickSlot2',
      keyCodes: ['Digit2'],
      modes: ['hotkey']
    }, {
      label: 'Quick Slot 3',
      event: 'quickSlot3',
      keyCodes: ['Digit3'],
      modes: ['hotkey']
    }, {
      label: 'Quick Slot 4',
      event: 'quickSlot4',
      keyCodes: ['Digit4'],
      modes: ['hotkey']
    }, {
      label: 'Quick Slot 5',
      event: 'quickSlot5',
      keyCodes: ['Digit5'],
      modes: ['hotkey']
    }, {
      label: 'Quick Slot 6',
      event: 'quickSlot6',
      keyCodes: ['Digit6'],
      modes: ['hotkey']
    }, {
      label: 'Quick Slot 7',
      event: 'quickSlot7',
      keyCodes: ['Digit7'],
      modes: ['hotkey']
    }, {
      label: 'Quick Slot 8',
      event: 'quickSlot8',
      keyCodes: ['Digit8'],
      modes: ['hotkey']
    }, {
      label: 'Quick Slot 9',
      event: 'quickSlot9',
      keyCodes: ['Digit9'],
      modes: ['hotkey']
    }, {
      label: 'Quick Slot 0',
      event: 'quickSlot0',
      keyCodes: ['Digit0'],
      modes: ['hotkey']
    }, {
      label: 'Quick Slot -',
      event: 'quickSlotMinus',
      keyCodes: ['Minus'],
      modes: ['hotkey']
    }, {
      label: 'Quick Slot =',
      event: 'quickSlotEqual',
      keyCodes: ['Equal'],
      modes: ['hotkey']
    }, {
      label: 'Select Output Tab',
      event: 'selectOutputTab',
      keyCodes: [{ code: 'Digit1', ctrl: true }],
      modes: ['hotkey', 'input']
    }, {
      label: 'Select Chat Tab',
      event: 'selectChatTab',
      keyCodes: [{ code: 'Digit2', ctrl: true }],
      modes: ['hotkey', 'input']
    }, {
      label: 'Select Trade Tab',
      event: 'selectTradeTab',
      keyCodes: [{ code: 'Digit3', ctrl: true }],
      modes: ['hotkey', 'input']
    }, {
      label: 'Select Newbie Tab',
      event: 'selectNewbieTab',
      keyCodes: [{ code: 'Digit4', ctrl: true }],
      modes: ['hotkey', 'input']
    }, {
      label: 'Select Prev Output Tab',
      event: 'selectPrevOutputTab',
      gamepadButtons: [14],
      modes: ['hotkey', 'input']
    }, {
      label: 'Select Next Output Tab',
      event: 'selectNextOutputTab',
      gamepadButtons: [15],
      modes: ['hotkey', 'input']
    }, {
      label: 'Show Map Modal',
      event: 'showMapModal',
      keyCodes: ['KeyM'],
      modes: ['hotkey']
    }, {
      label: 'Attack',
      event: 'attack',
      keyCodes: ['KeyA'],
      modes: ['hotkey'],
      inBattle: true
    }, {
      label: 'Defend',
      event: 'defend',
      keyCodes: ['KeyD'],
      modes: ['hotkey'],
      inBattle: true
    }, {
      label: 'Flee',
      event: 'flee',
      keyCodes: ['KeyF'],
      modes: ['hotkey'],
      inBattle: true
    }, {
      label: 'Battle',
      event: 'battle',
      keyCodes: ['KeyB'],
      gamepadButtons: [2],
      modes: ['hotkey'],
      inBattle: false
    }, {
      label: 'Harvest',
      event: 'harvest',
      keyCodes: ['KeyH'],
      gamepadButtons: [3],
      modes: ['hotkey'],
      inBattle: false
    }, {
      label: 'Loot',
      event: 'loot',
      keyCodes: ['KeyL'],
      gamepadButtons: [1],
      modes: ['hotkey'],
      inBattle: false
    }, {
      label: 'Close Modal',
      event: 'closeModal',
      keyCodes: ['Escape'],
      gamepadButtons: [1],
      modes: ['modal']
    }, {
      label: 'Open Gamepad Modal',
      event: 'openGameModal',
      gamepadButtons: [9],
      modes: ['hotkey', 'input'] 
    }, {
      label: 'Previous Modal Tab',
      event: 'prevModalTab',
      keyCodes: ['ArrowLeft'],
      gamepadButtons: [4],
      modes: ['modal']
    }, {
      label: 'Next Modal Tab',
      event: 'nextModalTab',
      keyCodes: ['ArrowRight'],
      gamepadButtons: [5],
      modes: ['modal']
    }, {
      label: 'Open Radial Menu',
      event: 'openRadialMenu',
      gamepadButtons: [4, 5],
      modes: ['hotkey', 'input']
    }, {
      label: 'Close Radial Menu',
      event: 'closeRadialMenu',
      gamepadButtonsReleased: [1],
      modes: ['radial']
    }, {
      label: 'Select Radial Item',
      event: 'selectRadialItem',
      axis: 'left',
      modes: ['radial']
    }, {
      label: 'Perform Radial Action',
      event: 'performRadialAction',
      gamepadButtons: [0],
      modes: ['radial']
    }, {
      label: 'Select Prev Radial Menu',
      event: 'selectPrevRadialMenu',
      gamepadButtons: [4],
      modes: ['radial']
    }, {
      label: 'Select Next Radial Menu',
      event: 'selectNextRadialMenu',
      gamepadButtons: [5],
      modes: ['radial']
    }, {
      label: 'Select Movement Direction',
      event: 'selectMovementDirection',
      axis: 'left',
      modes: ['hotkey', 'input'],
      inBattle: false
    }, {
      label: 'Move In Selected Direction',
      event: 'moveInSelectedDirection',
      gamepadButtons: [0],
      modes: ['hotkey', 'input'],
      inBattle: false
    }, {
      label: 'Select Login Action',
      event: 'selectLoginAction',
      axis: 'left',
      modes: ['login']
    }, {
      label: 'Perform Login Action',
      event: 'performLoginAction',
      gamepadButtons: [0],
      modes: ['login']
    }, {
      label: 'Select Battle Action',
      event: 'selectBattleAction',
      axis: 'left',
      modes: ['hotkey', 'input'],
      inBattle: true
    }, {
      label: 'Perform Battle Action',
      event: 'performBattleAction',
      gamepadButtons: [0],
      modes: ['hotkey', 'input'],
      inBattle: true
    }, 
  ]
}

function addSuggestedCommand (command) {
  if (state.suggestedCommands.includes(command)) {
    return
  }

  state.suggestedCommands.push(command)

  if (state.suggestedCommands.length > 12) {
    state.suggestedCommands.shift()
  }
}

let preloadBuffers = {}
let addLinesTimeout = null
let setModeTimeout = null
const maxLines = 2000
const removeLines = 500

export function resetMode () {
  state.mode = 'login'
  state.prevModes = []
}

export function setMode (newMode) {
  if (setModeTimeout) {
    clearTimeout(setModeTimeout)
  }

  setModeTimeout = setTimeout(() => {
    state.prevModes.push(state.mode)
    state.mode = newMode
    setModeTimeout = null
    console.log(`state.mode set to ${newMode} (${state.prevModes.length} prev)`)
  })
}

export function prevMode () {
  if (state.prevModes.length) {
    state.mode = state.prevModes.pop()
    console.log(`state.mode set to ${state.mode} (prevMode, ${state.prevModes.length} left)`)
  }
}

export function addLine (line, bufferName) {
  if (!state[bufferName]) {
    throw new Error(`Unknown buffer ${bufferName}`)
  }

  if (typeof line.matchAll == 'function') {
    let suggestedCommands = line.matchAll(/<span style="text-decoration:underline" class="ansi-bright-white-fg">([a-zA-Z ]+)<\/span>/g)
    for (let command of suggestedCommands) {
      console.log(command[1])
      addSuggestedCommand(command[1])
    }
  }

  if (!preloadBuffers[bufferName]) {
    preloadBuffers[bufferName] = []
  }

  if (bufferName == 'output') {
    Object.freeze(line)
  }
  if (!line) {
    line = '<br/>'
  }
  preloadBuffers[bufferName].push(line)

  if (addLinesTimeout) {
    clearTimeout(addLinesTimeout)
  }

  addLinesTimeout = setTimeout(() => {
    for (let bufferName in preloadBuffers) {
      state[bufferName].push(...preloadBuffers[bufferName])
      preloadBuffers[bufferName] = []
      if (state[bufferName].length > maxLines) {
        state[bufferName].splice(0, removeLines)
      }
    }
    addLinesTimeout = null
  }, 10)
}
