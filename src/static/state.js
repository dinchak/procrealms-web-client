import { reactive, ref } from 'vue'
import { EventEmitter } from 'events'

import { loadSettingsByNameAndType } from '@/static/triggers'

import { useLocalStorageHandler } from '@/composables/local_storage_handler'
import { DEFAULT_TERMINAL_SIZE } from '@/static/constants'
import { playRandomTrack } from '@/static/sound'

import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const { ansiToHtml } = useHelpers()
const { fetchItems, fetchEntities } = useWebSocket()

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

  validModes: ['login', 'hotkey', 'input', 'modal', 'modal-input', 'radial'],
  mode: 'login',

  errorMessage: '',

  prevModes: [],

  metaKeyState: {
    shift: false,
    ctrl: false,
    alt: false,
  },

  isFullscreen: false,

  playerModalAs: '',
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

  inventorySortValue: 'name',  // Change because sorting by type does not work in some cases.
  inventoryOutput: {},

  scrolledBack: false,
  showMoreOptions: false,

  output: [],

  messages: [],
  unseenMessageCount: {},

  animations: [],
  nextAnimationDelay: 0,

  soundQueue: null,

  triggers: ref(new Map()),
  variables: ref(new Map()),

  name: '',
  token: '',

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
    playerModal: false,
    settingsModal: false,
    tradeModal: false,
    craftingModal: false,
    chatModal: false,
    auctionModal: false,
    mailModal: false,
    inputMappingModal: false,
    errorModal: false,
  },

  crafting: {
    filterType: 'all',
    levelFilter: '',
    selectedSkill: '',
    recipes: [],
  },

  auction: {
    pane: 'browse',
    search: {
      name: '',
      type: '',
      subtype: '',
      slot: '',
      minLevel: 1,
      maxLevel: 100,
    },
    auctions: [],
    numPages: 0,
    totalNumAuctions: 0,
    page: 0,
    sort: 'id',
    sortDir: 'asc',
    selectedAuctionId: 0,
    item: {},
  },

  mail: {
    mailItems: [],
    count: 0,
  },

  shop: {
    items: [],
    shopkeeper: '',
    prices: {},
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
    auctionCache: {},
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
      items: [],
      pendingReaction: null
    },

    party: {},
    charmies: {},
    skills: {},
    effects: {},
    equipment: {},
    tools: {},

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
    prompt: '',
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
    'Gamepad Enabled': 'gamepadEnabled'
  },
  'General': {
    'Minimap In Room Description': 'roomDescriptionMinimap',
    'Chat In Main Output': 'chatInMain',
    'Chat Message Sounds': 'chatSounds',
    'Autoplay Music': 'autoplayMusic',
    'Large Vitals': 'largeVitals',
  },
  'Battle': {
    'Battle Table Mode': 'battleTableMode',
    'Battle Always Expanded': 'battleAlwaysExpanded',
    'Damage Animations': 'damageAnimations',
  },
}

function resetOptions () {
  return {
    // general options
    battleAlwaysExpanded: true,
    battleTableMode: true,
    damageAnimations: true,
    battleExpanded: false,
    largeVitals: false,
    chatInMain: true,
    roomDescriptionMinimap: false,
    textInputAlwaysFocused: false,
    unfocusInputOnCommand: false,
    gamepadEnabled: false,
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
    showMinimap: true,
    showRoomInfo: true,
    showEffects: true,
    showQuests: true,

    showChat: true,
    showQuickSlots: true,
    showPartyStats: false,
    textInputMobileButtons: true,

    showSideMap: false,
    showSideMovement: false,
    showSideAliases: false,

    // font options
    fontFamily: 'Inconsolata, monospace',
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
  state.prevModes.push(state.mode)
  state.mode = newMode
  // console.trace(`setMode(${newMode}) - prevModes: ${state.prevModes.join(', ')}`)
}

export function prevMode () {
  if (state.prevModes.length) {
    state.mode = state.prevModes.pop()
    // console.trace(`prevMode() - new mode: ${state.mode}, prevModes: ${state.prevModes.join(', ')}`)
  }
}

export function showError (msg) {
  state.errorMessage = msg
  state.modals.errorModal = true
  setMode('error-modal')
}

export function showHUD () {
  const {
    showMinimap, showRoomInfo, showEffects, showQuests, showChat,
  } = state.options

  return (
    showMinimap || showRoomInfo || showEffects || showQuests || showChat
  )
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

export async function addLine (line, bufferName) {
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

  line = await replaceIds(line)

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

async function replaceIds (command) {
  const eidMatches = [...command.matchAll(/eid:(\w+)/g)].map(m => m[1])
  const uniqueEids = [...new Set(eidMatches)]

  if (uniqueEids.length) {
    const entities = await fetchEntities(uniqueEids)
    const byEid = Object.fromEntries(entities.map(e => [e.eid, e]))

    command = command.replace(/eid:(\w+)/g, (match, eid) => {
      const ent = byEid[eid]
      if (ent) {
        if (ent.colorBattleTag) {
          return ansiToHtml(ent.colorBattleTag + ' ' + ent.name)
        }
        return ent.name
      }
      return match
    })
  }

  const iidMatches = [...command.matchAll(/iid:(\w+)/g)].map(m => m[1])
  const uniqueIids = [...new Set(iidMatches)]

  if (uniqueIids.length) {
    const items = await fetchItems(uniqueIids)
    const byIid = Object.fromEntries(items.map(i => [i.iid, i]))

    command = command.replace(/iid:(\w+)/g, (match, iid) => {
      const item = byIid[iid]
      return item ? item.name : match
    })
  }

  return command
}

export function getOrderCmd () {
  if (state.playerModalAs && state.gameState.charmies[state.playerModalAs]) {
    return `order eid:${state.playerModalAs} `
  }
  return ''
}