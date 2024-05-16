import { reactive, ref } from 'vue'

import { EventEmitter } from 'events'

export const state = reactive({
  connected: false,
  disconnected: false,

  websocketConnection: null,
  moveTimeout: null,

  pendingRequests: {},

  gameState: resetGameState(),
  inputMappings: [],
  inputEmitter: new EventEmitter(),
  options: resetOptions(),
  cache: resetCache(),

  outputTabs: ['output', 'chat', 'trade', 'newbie'],
  activeTab: 'output',
  validModes: ['login', 'hotkey', 'input', 'modal', 'modal-input', 'radial'],
  mode: 'login',

  prevModes: [],

  metaKeyState: {
    shift: false,
    ctrl: false,
    alt: false
  },

  isFullscreen: false,

  gameModalAs: '',
  mercEid: -1,

  gamepadPrevStates: {},
  gamepads: {},
  gamepadTab: false,
  gamepadHelpTab: false,
  suggestedCommands: [],
  selectedDirection: false,

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
  nextAnimationDelay: 0,

  triggers: ref(new Map()),
  variables: ref(new Map()),

  name: '',
  token: '',

  settingsMode: false,

  modals: {
    inventoryModals: {
      playerItemModal: ref(''),
      mercItemModal: ref('')
    },
    mercModal: false,
    triggersModal: false,
    helpModal: false,
    loginModal: false,
    logoutModal: false,
    newPlayerModal: false,
    gameModal: false
  },

  help: {
    topics: {
      skills: [],
      general: [],
      commands: []
    },
    topicsLoaded: false,
    searchResults: [],
    contents: [],
    openEntries: []
  },

  music: {
    audioContext: null,
    musicSource: null,
    audioAnalyzer: null,
    gainNode: null,
    currentTrack: false,
    playing: false
  }
})

export function resetState () {
  state.activeTab = 'output'
  state.mode = 'hotkey'
  state.prevModes = ['login']
  state.pendingRequests = {}
  state.inputMappings = resetInputMappings()
  state.cache = resetCache()
  state.gameState = resetGameState()
  state.options = resetOptions()
  state.output = []
  state.chat = []
  state.trade = []
  state.newbie = []
  state.animations = []
  state.triggers = new Map()
  state.variables = new Map()
}

function resetCache () {
  return {
    entityCache: {},
    itemCache: {},
    commandCache: {}
  }
}

export function resetGameState () {
  return {
    player: {},
    battle: {
      actions: {
        actions: [],
        skills: [],
        spells: []
      },
      active: false,
      myTurn: false,
      participants: {}
    },

    party: {},
    charmies: {},
    skills: {},
    affects: {},
    equipment: {},

    channels: [],
    inventory: [],
    aliases: [],
    radials: [],
    quests: [],
    room: {
      exits: [],
      entities: [],
      items: []
    },
    minimap: [],
    sidemap: [],
    slots: []
  }
}

function resetOptions () {
  return {
    // general options
    chatInMain: true,
    roomDescriptionMinimap: true,
    textInputAlwaysFocused: false,
    keepSentCommands: false,
    showMusicPlayer: false,
    volume: 40,

    // mobile menu options
    showMobileMenu: false,
    showMobileMenuMap: true,
    fixedMobileMenuMap: false,
    swapMobileMenuSide: false,

    // map options
    sideMapWidth: 50,
    sideMapHeight: 50,

    // interface options
    showMinimap: false,
    showRoomInfo: false,
    showAffects: false,
    showQuests: false,

    showTabs: true,
    showQuickSlots: true,
    showPartyStats: true,
    textInputMobileButtons: true,

    showSideMap: true,
    showSideMovement: false,
    showSideAliases: false,
    showGameModalShortcuts: true,

    // font options
    fontFamily: 'Ubuntu Mono, monospace',
    fontSize: '16px',
  }
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
const maxLines = 2000
const removeLines = 500

export function resetMode () {
  state.mode = 'login'
  state.prevModes = []
}

export function setMode (newMode) {
  state.prevModes.push(state.mode)
  state.mode = newMode
  console.log(`state.mode set to ${newMode} (${state.prevModes.length} prev)`)
}

export function prevMode () {
  if (state.prevModes.length) {
    state.mode = state.prevModes.pop()
    console.log(`state.mode set to ${state.mode} (prevMode, ${state.prevModes.length} left)`)
  }
}

export function showHUD () {
  const {
    showMinimap, showRoomInfo, showAffects, showQuests,
  } = state.options

  return (
    showMinimap || showRoomInfo || showAffects || showQuests
  )
}

export function getHUDHeight () {
  if (state.options.fontSize == '14px') {
    return 105
  } else if (state.options.fontSize == '16px') {
    return 120
  } else if (state.options.fontSize == '18px') {
    return 135
  }
}

export function getPartyStatsHeight () {
  if (state.options.fontSize == '14px') {
    return 75
  } else if (state.options.fontSize == '16px') {
    return 80
  } else if (state.options.fontSize == '18px') {
    return 90
  }

}

export function addLine (line, bufferName) {
  if (!state[bufferName]) {
    throw new Error(`Unknown buffer ${bufferName}`)
  }

  if (typeof line.matchAll == 'function') {
    let suggestedCommands = line.matchAll(/<span style="text-decoration:underline" class="ansi-bright-white-fg">([a-zA-Z ]+)<\/span>/g)
    for (let command of suggestedCommands) {
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

export function getOrderCmd () {
  if (state.gameModalAs && state.gameState.charmies[state.gameModalAs]) {
    return `order eid:${state.gameModalAs} `
  }
  return ''
}

export function resetInputMappings () {
  return [
    {
      label: 'Move North',
      event: 'moveNorth',
      bindings: [{
        keyCode: 'Numpad8',
        modes: ['hotkey', 'input']
      }, {
        keyCode: 'KeyW',
        modes: ['hotkey']
      }, {
        keyCode: 'ArrowUp',
        modes: ['hotkey']
      }],
    },
    
    {
      label: 'Move South',
      event: 'moveSouth',
      bindings: [{
        keyCode: 'Numpad2',
        modes: ['hotkey', 'input']
      }, {
        keyCode: 'KeyS',
        modes: ['hotkey']
      }, {
        keyCode: 'ArrowDown',
        modes: ['hotkey']
      }],
    },
    
    {
      label: 'Move East',
      event: 'moveEast',
      bindings: [{
        keyCode: 'Numpad6',
        modes: ['hotkey', 'input']
      }, {
        keyCode: 'KeyD',
        modes: ['hotkey']
      }, {
        keyCode: 'ArrowRight',
        modes: ['hotkey']
      }],
    },
    
    {
      label: 'Move West',
      event: 'moveWest',
      bindings: [{
        keyCode: 'Numpad4',
        modes: ['hotkey', 'input']
      }, {
        keyCode: 'KeyA',
        modes: ['hotkey']
      }, {
        keyCode: 'ArrowLeft',
        modes: ['hotkey']
      }],
    },
    
    {
      label: 'Move Northeast',
      event: 'moveNorthEast',
      bindings: [{
        keyCode: 'Numpad9',
        modes: ['hotkey', 'input']
      }, {
        keyCode: 'KeyE',
        modes: ['hotkey']
      }],
    },
    
    {
      label: 'Move Northwest',
      event: 'moveNorthWest',
      bindings: [{
        keyCode: 'Numpad7',
        modes: ['hotkey', 'input']
      }, {
        keyCode: 'KeyQ',
        modes: ['hotkey']
      }],
    },
    
    {
      label: 'Move Southeast',
      event: 'moveSouthEast',
      bindings: [{
        keyCode: 'Numpad3',
        modes: ['hotkey', 'input']
      }, {
        keyCode: 'KeyC',
        modes: ['hotkey']
      }],
    },
    
    {
      label: 'Move Southwest',
      event: 'moveSouthWest',
      bindings: [{
        keyCode: 'Numpad1',
        modes: ['hotkey', 'input']
      }, {
        keyCode: 'KeyZ',
        modes: ['hotkey']
      }],
    },
    
    {
      label: 'Enter',
      event: 'enter',
      bindings: [{
        keyCode: 'Numpad5',
        modes: ['hotkey', 'input']
      }, {
        keyCode: 'KeyX',
        modes: ['hotkey']
      }],
    },
    
    {
      label: 'Toggle Collapsible Menu',
      event: 'toggleCollapsibleMenu',
      bindings: [{
        keyCode: 'Space',
        modes: ['hotkey']
      }],
    },
    
    {
      label: 'Focus Text Input',
      event: 'focusTextInput',
      bindings: [{
        keyCode: 'Slash',
        modes: ['hotkey', 'modal']
      }, {
        keyCode: 'Enter',
        modes: ['hotkey', 'modal']
      }],
    },
    
    {
      label: 'Blur Text Input',
      event: 'blurTextInput',
      bindings: [{
        keyCode: 'Escape',
        modes: ['input', 'modal-input']
      }]
    },
    
    {
      label: 'Send Command',
      event: 'sendCommand',
      bindings: [{
        keyCode: 'Enter',
        modes: ['input', 'modal-input']
      }, {
        keyCode: 'Enter',
        shift: true,
        modes: ['input', 'modal-input']
      }],
    },
    
    {
      label: 'Previous Command',
      event: 'prevCommand',
      bindings: [{
        keyCode: 'ArrowUp',
        modes: ['input', 'modal-input']
      }],
    },
    
    {
      label: 'Next Command',
      event: 'nextCommand',
      bindings: [{
        keyCode: 'ArrowDown',
        modes: ['input', 'modal-input']
      }],
    },
    
    {
      label: 'Page Up',
      event: 'pageUp',
      bindings: [{
        keyCode: 'PageUp',
        modes: ['hotkey', 'input', 'modal-input']
      }, {
        gamepadButton: 12,
        modes: ['hotkey', 'input', 'modal-input']
      }]
    },
    
    {
      label: 'Page Down',
      event: 'pageDown',
      bindings: [{
        keyCode: 'PageDown',
        modes: ['hotkey', 'input', 'modal-input']
      }, {
        gamepadButton: 13,
        modes: ['hotkey', 'input', 'modal-input']
      }]
    },
    
    {
      label: 'Scroll Down',
      event: 'scrollDown',
      bindings: [{
        keyCode: 'End',
        modes: ['hotkey', 'input', 'modal-input']
      }, {
        gamepadButton: 15,
        modes: ['hotkey', 'input', 'modal-input']
      }]
    },
    
    {
      label: 'Open Help Modal',
      event: 'openHelpModal',
      bindings: [{
        keyCode: 'Slash',
        shift: true,
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Show Debug',
      event: 'showDebug',
      bindings: [{
        keyCode: 'Backquote',
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Quick Slot 1',
      event: 'quickSlot1',
      bindings: [{
        keyCode: 'Digit1',
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Quick Slot 2',
      event: 'quickSlot2',
      bindings: [{
        keyCode: 'Digit2',
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Quick Slot 3',
      event: 'quickSlot3',
      bindings: [{
        keyCode: 'Digit3',
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Quick Slot 4',
      event: 'quickSlot4',
      bindings: [{
        keyCode: 'Digit4',
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Quick Slot 5',
      event: 'quickSlot5',
      bindings: [{
        keyCode: 'Digit5',
        modes: ['hotkey']
      }]
    },

    {
      label: 'Quick Slot 6',
      event: 'quickSlot6',
      bindings: [{
        keyCode: 'Digit6',
        modes: ['hotkey']
      }]
    }, 
    
    {
      label: 'Quick Slot 7',
      event: 'quickSlot7',
      bindings: [{
        keyCode: 'Digit7',
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Quick Slot 8',
      event: 'quickSlot8',
      bindings: [{
        keyCode: 'Digit8',
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Quick Slot 9',
      event: 'quickSlot9',
      bindings: [{
        keyCode: 'Digit9',
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Quick Slot 0',
      event: 'quickSlot0',
      bindings: [{
        keyCode: 'Digit0',
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Quick Slot -',
      event: 'quickSlotMinus',
      bindings: [{
        keyCode: 'Minus',
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Quick Slot =',
      event: 'quickSlotEqual',
      bindings: [{
        keyCode: 'Equal',
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Select Output Tab',
      event: 'selectOutputTab',
      bindings: [{
        keyCode: 'Digit1',
        ctrl: true,
        modes: ['hotkey', 'input']
      }]
    },
    
    {
      label: 'Select Chat Tab',
      event: 'selectChatTab',
      bindings: [{
        keyCode: 'Digit2',
        ctrl: true,
        modes: ['hotkey', 'input']
      }]
    },
    
    {
      label: 'Select Trade Tab',
      event: 'selectTradeTab',
      bindings: [{
        keyCode: 'Digit3',
        ctrl: true,
        modes: ['hotkey', 'input']
      }]
    },
    
    {
      label: 'Select Newbie Tab',
      event: 'selectNewbieTab',
      bindings: [{
        keyCode: 'Digit4',
        ctrl: true,
        modes: ['hotkey', 'input']
      }]
    },

    {
      label: 'Select Prev Output Tab',
      event: 'selectPrevOutputTab',
      bindings: [{
        gamepadButton: 14,
        modes: ['hotkey', 'input']
      }]
    },
    
    {
      label: 'Select Next Output Tab',
      event: 'selectNextOutputTab',
      bindings: [{
        gamepadButton: 15,
        modes: ['hotkey', 'input']
      }]
    },
    
    {
      label: 'Show Side Map',
      event: 'showSideMap',
      bindings: [{
        keyCode: 'KeyM',
        modes: ['hotkey']
      }]
    },
    
    {
      label: 'Attack',
      event: 'attack',
      inBattle: true,
      bindings: [{
        keyCode: 'KeyA',
        modes: ['hotkey']
      }, {
        gamepadButton: 2,
        modes: ['hotkey', 'input']
      }],
    },
    
    {
      label: 'Defend',
      event: 'defend',
      inBattle: true,
      bindings: [{
        keyCode: 'KeyD',
        modes: ['hotkey']
      }, {
        gamepadButton: 3,
        modes: ['hotkey', 'input']
      }],
    },
    
    {
      label: 'Flee',
      event: 'flee',
      inBattle: true,
      bindings: [{
        keyCode: 'KeyF',
        modes: ['hotkey']
      }, {
        gamepadButton: 1,
        modes: ['hotkey', 'input']
      }],
    },
    
    {
      label: 'Battle',
      event: 'battle',
      inBattle: false,
      bindings: [{
        keyCode: 'KeyB',
        modes: ['hotkey']
      }, {
        gamepadButton: 2,
        modes: ['hotkey', 'input']
      }],
    },
    
    {
      label: 'Harvest',
      event: 'harvest',
      inBattle: false,
      bindings: [{
        keyCode: 'KeyH',
        modes: ['hotkey']
      }, {
        gamepadButton: 3,
        modes: ['hotkey', 'input']
      }],
    },
    
    {
      label: 'Loot',
      event: 'loot',
      inBattle: false,
      bindings: [{
        keyCode: 'KeyL',
        modes: ['hotkey']
      }, {
        gamepadButton: 1,
        modes: ['hotkey', 'input']
      }],
    },

    {
      label: 'Close Modal',
      event: 'closeModal',
      bindings: [{
        keyCode: 'Escape',
        modes: ['modal'],
      }, {
        gamepadButton: 1,
        modes: ['modal']
      }],
    },
    
    {
      label: 'Show Game Modal',
      event: 'openGameModal',
      bindings: [{
        keyCode: 'Escape',
        modes: ['hotkey']
      }, {
        gamepadButton: 9,
        modes: ['hotkey', 'input']
      }],
    },
    
    {
      label: 'Previous Modal Tab',
      event: 'prevModalTab',
      bindings: [{
        keyCode: 'ArrowLeft',
        modes: ['modal', 'modal-input']
      }, {
        gamepadButton: 4,
        modes: ['modal', 'modal-input']
      }],
    },
    
    {
      label: 'Next Modal Tab',
      event: 'nextModalTab',
      bindings: [{
        keyCode: 'ArrowRight',
        modes: ['modal', 'modal-input']
      }, {
        gamepadButton: 5,
        modes: ['modal', 'modal-input']
      }],
    },
    
    {
      label: 'Open Radial Menu',
      event: 'openRadialMenu',
      bindings: [{
        gamepadButton: 4,
        modes: ['hotkey', 'input']
      }, {
        gamepadButton: 5,
        modes: ['hotkey', 'input']
      }],
    },
    
    {
      label: 'Close Radial Menu',
      event: 'closeRadialMenu',
      bindings: [{
        gamepadButtonReleased: 1,
        modes: ['radial']
      }],
    },
    
    {
      label: 'Select Radial Item',
      event: 'selectRadialItem',
      type: 'degree',
      bindings: [{
        gamepadAxis: 'left',
        modes: ['radial']
      }],
    },
    
    {
      label: 'Perform Radial Action',
      event: 'performRadialAction',
      bindings: [{
        gamepadButton: 0,
        modes: ['radial']
      }],
    },
    
    {
      label: 'Select Prev Radial Menu',
      event: 'selectPrevRadialMenu',
      bindings: [{
        gamepadButton: 4,
        modes: ['radial']
      }],
    },
    
    {
      label: 'Select Next Radial Menu',
      event: 'selectNextRadialMenu',
      bindings: [{
        gamepadButton: 5,
        modes: ['radial']
      }],
    },
    
    {
      label: 'Select Movement Direction',
      event: 'selectMovementDirection',
      type: 'degree',
      inBattle: false,
      bindings: [{
        gamepadAxis: 'left',
        modes: ['hotkey', 'input']
      }]
    },
    
    {
      label: 'Move In Selected Direction',
      event: 'moveInSelectedDirection',
      inBattle: false,
      bindings: [{
        gamepadButton: 0,
        modes: ['hotkey', 'input']
      }]
    },
    
    {
      label: 'Select Login Action',
      event: 'selectLoginAction',
      type: 'degree',
      bindings: [{
        gamepadAxis: 'left',
        modes: ['login']
      }]
    },
    
    {
      label: 'Perform Login Action',
      event: 'performLoginAction',
      bindings: [{
        gamepadButton: 0,
        modes: ['login']
      }]
    },
    
    {
      label: 'Select Modal Action',
      event: 'selectModalAction',
      type: 'degree',
      bindings: [{
        gamepadAxis: 'left',
        modes: ['modal', 'modal-input']
      }]
    },
    
    {
      label: 'Perform Modal Action',
      event: 'performModalAction',
      bindings: [{
        gamepadButton: 0,
        modes: ['modal', 'modal-input']
      }]
    },
    
    {
      label: 'Select Battle Action',
      event: 'selectBattleAction',
      type: 'degree',
      inBattle: true,
      bindings: [{
        gamepadAxis: 'left',
        modes: ['hotkey', 'input']
      }]
    },
    
    {
      label: 'Perform Battle Action',
      event: 'performBattleAction',
      inBattle: true,
      bindings: [{
        gamepadButton: 0,
        modes: ['hotkey', 'input']
      }]
    }
  ]
}
