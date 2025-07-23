import { reactive, ref } from 'vue'
import { EventEmitter } from 'events'

import { loadSettingsByNameAndType } from '@/static/triggers'

import { useLocalStorageHandler } from '@/composables/local_storage_handler'
import { DEFAULT_TERMINAL_SIZE } from '@/static/constants'
import { playRandomTrack } from '@/static/sound'

const { addToken } = useLocalStorageHandler()

export const updateCounter = ref(0)

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
    alt: false,
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
    newbie: false,
  },

  output: [],
  chat: [],
  trade: [],
  newbie: [],

  animations: [],
  nextAnimationDelay: 0,

  soundQueue: null,

  triggers: ref(new Map()),
  variables: ref(new Map()),

  name: '',
  token: '',

  settingsMode: false,

  modals: {
    debugModal: false,
    inventoryModals: {
      playerItemModal: ref(''),
      mercItemModal: ref(''),
    },
    mercModal: false,
    triggersModal: false,
    helpModal: false,
    loginModal: false,
    logoutModal: false,
    newPlayerModal: false,
    gameModal: false,
  },

  help: {
    topics: {
      skills: [],
      general: [],
      commands: [],
    },
    topicsLoaded: false,
    searchResults: [],
    contents: [],
    openEntries: [],
  },

  music: {
    audioContext: null,
    musicSource: null,
    audioAnalyzer: null,
    gainNode: null,
    currentTrack: null,
    playing: false,
  },
})

export function resetState () {
  state.activeTab = 'output'
  state.mode = 'hotkey'
  state.prevModes = ['login']
  state.pendingRequests = {}
  state.cache = resetCache()
  state.gameState = resetGameState()
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
    commandCache: {},
  }
}

export function resetGameState () {
  return {
    player: {},
    battle: {
      actions: {
        actions: [],
        skills: [],
        spells: [],
      },
      active: false,
      myTurn: false,
      participants: {},
      items: []
    },

    party: {},
    charmies: {},
    skills: {},
    effects: {},
    equipment: {},

    channels: [],
    inventory: [],
    aliases: [],
    radials: [],
    quests: [],
    room: {
      exits: [],
      entities: [],
      items: [],
    },
    minimap: [],
    sidemap: [],
    scan: {
      entities: [],
      entrances: [],
    },
    slots: [],
  }
}

export const configurableOptions = {
  'Sidebar': {
    'Show Map Area': 'showMobileMenuMap',
    'Swap Menu Side': 'swapMobileMenuSide',
    'Show Movement Controls': 'showMobileMenuMoveControls',
    'Show Quick Slots': 'showMobileMenuQuickslots',
    'Show Mini Stats': 'showMobileMenuMiniStats',
  },
  'Input': {
    'Keep Sent Commands': 'keepSentCommands',
    'Text Input Always Focused': 'textInputAlwaysFocused',
    'Unfocus Input On Command': 'unfocusInputOnCommand',
  },
  'General': {
    'Minimap In Room Description': 'roomDescriptionMinimap',
    'Chat In Main Output': 'chatInMain',
    'Chat Message Sounds': 'chatSounds',
    'Autoplay Music': 'autoplayMusic',
    'Battle Always Expanded': 'battleAlwaysExpanded',
    'Large Vitals': 'largeVitals',
  },
}

function resetOptions () {
  return {
    // general options
    battleAlwaysExpanded: true,
    largeVitals: true,
    chatInMain: true,
    roomDescriptionMinimap: false,
    textInputAlwaysFocused: false,
    unfocusInputOnCommand: false,
    keepSentCommands: false,
    showMusicPlayer: false,
    volume: 40,

    // mobile menu options
    showMobileMenu: false,
    showMobileMenuMap: true,
    swapMobileMenuSide: false,
    showMobileMenuMoveControls: true,
    showMobileMenuMiniStats: true,
    showMobileMenuQuickslots: true,

    // map options
    sideMapWidth: 25,
    sideMapHeight: 25,

    // interface options
    showMinimap: false,
    showRoomInfo: false,
    showEffects: false,
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

    // terminal size
    terminalWidth: DEFAULT_TERMINAL_SIZE.width,
    terminalHeight: DEFAULT_TERMINAL_SIZE.height,

    // audio
    autoplayMusic: false,
    chatSounds: false,
  }
}

export function authenticationSuccess ({ name, token }) {
  state.name = name
  state.token = token
  state.disconnected = false
  state.prevModes = ['login']
  state.mode = 'hotkey'
  addToken(name, token)
  state.modals.loginModal = false
  state.modals.newPlayerModal = false
  loadSettingsByNameAndType(state.triggers, name, 'triggers')
  loadSettingsByNameAndType(state.variables, name, 'variables')

  if (state.options.autoplayMusic) {
    playRandomTrack()
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
  if (state.mode == newMode) {
    return
  }

  state.prevModes.push(state.mode)
  state.mode = newMode
  // console.trace(`state.mode set to ${newMode} (${state.prevModes.length} prev)`)
}

export function prevMode () {
  if (state.prevModes.length) {
    state.mode = state.prevModes.pop()
    // console.trace(`state.mode set to ${state.mode} (prevMode, ${state.prevModes.length} left)`)
  }
}

export function showHUD () {
  const {
    showMinimap, showRoomInfo, showEffects, showQuests,
  } = state.options

  return (
    showMinimap || showRoomInfo || showEffects || showQuests
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
    let suggestedCommands = line.matchAll(
      /<span style="text-decoration:underline" class="ansi-bright-white-fg">([a-zA-Z ]+)<\/span>/g)
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
    for (let bufName in preloadBuffers) {
      state[bufName].push(...preloadBuffers[bufName])
      preloadBuffers[bufName] = []
      if (state[bufName].length > maxLines) {
        state[bufName].splice(0, removeLines)
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