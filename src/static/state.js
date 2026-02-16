import { reactive, ref } from 'vue'
import { EventEmitter } from 'events'

import { loadSettingsByNameAndType } from '@/static/triggers'

import { useLocalStorageHandler } from '@/composables/local_storage_handler'
import { DEFAULT_TERMINAL_SIZE } from '@/static/constants'
import { playRandomTrack } from '@/static/sound'

import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const IS_DEVELOPMENT = import.meta.env.MODE == 'development'

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
  diagnostics: resetDiagnostics(),

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
  gamepads: { },
  gamepadTab: false,
  gamepadHelpTab: false,
  suggestedCommands: [],
  selectedDirection: false,

  loginResolve: null,
  loginReject: null,
  nameExistsResolve: null,
  nameExistsReject: null,

  inventorySortValue: 'type',
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
  state.diagnostics = resetDiagnostics()
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
    inflightItemRequests: {},
    inflightEntityRequests: {},
  }
}

function resetDiagnostics () {
  return {
    cache: {
      fetchItemCalls: 0,
      fetchItemCacheHits: 0,
      fetchItemCacheMisses: 0,
      fetchItemTimeouts: 0,
      fetchItemsCalls: 0,
      fetchItemsRequestedIds: 0,
      fetchItemsCacheMissIds: 0,
      fetchItemsBatchRequests: 0,
      fetchItemsBatchDeduped: 0,
      fetchItemsTimeouts: 0,
      fetchEntityCalls: 0,
      fetchEntityCacheHits: 0,
      fetchEntityCacheMisses: 0,
      fetchEntityTimeouts: 0,
      fetchEntitiesCalls: 0,
      fetchEntitiesRequestedIds: 0,
      fetchEntitiesCacheMissIds: 0,
      fetchEntitiesBatchRequests: 0,
      fetchEntitiesBatchDeduped: 0,
      fetchEntitiesTimeouts: 0,
      itemCacheEvictions: 0,
      entityCacheEvictions: 0,
      commandCacheEvictions: 0,
      fetchItemsTotalMs: 0,
      fetchEntitiesTotalMs: 0,
    },
    ui: {
      inventoryCollapseRefreshes: 0,
      inventoryCollapseStaleDrops: 0,
      inventoryPaneRefreshes: 0,
      inventoryPaneStaleDrops: 0,
      equipmentPaneRefreshes: 0,
      equipmentPaneStaleDrops: 0,
      auctionSellRefreshes: 0,
      auctionSellStaleDrops: 0,
      tradePlayerRefreshes: 0,
      tradePlayerStaleDrops: 0,
      tradeShopRefreshes: 0,
      tradeShopStaleDrops: 0,
      mercOrdersRefreshes: 0,
      mercOrdersStaleDrops: 0,
    },
    performance: {
      websocketEvents: 0,
      websocketPatchOperations: 0,
      websocketOutputLines: 0,
      triggerCalls: 0,
      outputLinesQueued: 0,
      outputFlushCount: 0,
      outputLinesFlushed: 0,
      outputTrimEvents: 0,
      outputTrimmedLines: 0,
      replaceIdsEntityBatches: 0,
      replaceIdsItemBatches: 0,
      replaceIdsQueueBatches: 0,
      replaceIdsQueueLines: 0,
      replaceIdsQueueMaxBatchSize: 0,
      replaceIdsQueueTotalMs: 0,
      replaceIdsQueueErrors: 0,
      optionsSaveCalls: 0,
      optionsSaveWrites: 0,
      inputLookupCalls: 0,
      inputLookupMatched: 0,
      mappingIndexRebuilds: 0,
    }
  }
}

export function incrementPerformanceDiagnostic (key, amount = 1) {
  if (!IS_DEVELOPMENT || !state.diagnostics.performance) {
    return
  }

  state.diagnostics.performance[key] = (state.diagnostics.performance[key] || 0) + amount
}

export function incrementUiDiagnostic (key, amount = 1) {
  if (!IS_DEVELOPMENT || !state.diagnostics.ui) {
    return
  }

  state.diagnostics.ui[key] = (state.diagnostics.ui[key] || 0) + amount
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
const BUFFER_LIMITS = {
  output: {
    max: 5000,
    trimTo: 4500,
  },
  default: {
    max: 2000,
    trimTo: 1500,
  }
}
let replaceIdsTimeout = null
let replaceIdsQueue = []

function getBufferLimit (bufferName) {
  return BUFFER_LIMITS[bufferName] || BUFFER_LIMITS.default
}

function trimBufferIfNeeded (bufferName) {
  const limits = getBufferLimit(bufferName)
  const currentLength = state[bufferName].length

  if (currentLength <= limits.max) {
    return
  }

  const trimAmount = Math.max(0, currentLength - limits.trimTo)
  if (!trimAmount) {
    return
  }

  state[bufferName].splice(0, trimAmount)

  if (bufferName == 'output') {
    incrementPerformanceDiagnostic('outputTrimEvents')
    incrementPerformanceDiagnostic('outputTrimmedLines', trimAmount)
  }
}

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

  line = await enqueueReplaceIds(line)

  if (bufferName == 'output') {
    Object.freeze(line)
  }

  if (!line) {
    line = '<br/>'
  }

  incrementPerformanceDiagnostic('outputLinesQueued')
  preloadBuffers[bufferName].push(line)

  if (addLinesTimeout) {
    clearTimeout(addLinesTimeout)
  }

  addLinesTimeout = setTimeout(() => {
    for (let bufName in preloadBuffers) {
      const flushCount = preloadBuffers[bufName].length
      state[bufName].push(...preloadBuffers[bufName])
      preloadBuffers[bufName] = []
      trimBufferIfNeeded(bufName)

      incrementPerformanceDiagnostic('outputLinesFlushed', flushCount)
    }

    incrementPerformanceDiagnostic('outputFlushCount')
    addLinesTimeout = null
  }, 10)
}

function enqueueReplaceIds (command) {
  return new Promise(resolve => {
    replaceIdsQueue.push({ command, resolve })

    if (replaceIdsTimeout) {
      return
    }

    replaceIdsTimeout = setTimeout(() => {
      replaceIdsTimeout = null
      flushReplaceIdsQueue()
    }, 0)
  })
}

async function flushReplaceIdsQueue () {
  const startedAt = Date.now()
  const batch = replaceIdsQueue
  replaceIdsQueue = []

  if (!batch.length) {
    return
  }

  incrementPerformanceDiagnostic('replaceIdsQueueBatches')
  incrementPerformanceDiagnostic('replaceIdsQueueLines', batch.length)
  if (batch.length > (state.diagnostics.performance.replaceIdsQueueMaxBatchSize || 0)) {
    state.diagnostics.performance.replaceIdsQueueMaxBatchSize = batch.length
  }

  const eidRegex = /eid:(\w+)/g
  const iidRegex = /iid:(\w+)/g
  const uniqueEids = new Set()
  const uniqueIids = new Set()

  for (const entry of batch) {
    const eidMatches = String(entry.command).matchAll(eidRegex)
    for (const m of eidMatches) {
      uniqueEids.add(m[1])
    }

    const iidMatches = String(entry.command).matchAll(iidRegex)
    for (const m of iidMatches) {
      uniqueIids.add(m[1])
    }
  }

  try {
    let byEid = {}
    if (uniqueEids.size) {
      incrementPerformanceDiagnostic('replaceIdsEntityBatches')
      const entities = await fetchEntities([...uniqueEids])
      byEid = Object.fromEntries((entities || []).map(e => [e.eid, e]))
    }

    let byIid = {}
    if (uniqueIids.size) {
      incrementPerformanceDiagnostic('replaceIdsItemBatches')
      const items = await fetchItems([...uniqueIids])
      byIid = Object.fromEntries((items || []).map(i => [i.iid, i]))
    }

    for (const entry of batch) {
      let replaced = entry.command

      if (uniqueEids.size) {
        replaced = replaced.replace(/eid:(\w+)/g, (match, eid) => {
          const ent = byEid[eid]
          if (!ent) {
            return match
          }

          if (ent.colorBattleTag) {
            return ansiToHtml(ent.colorBattleTag + ' ' + ent.name)
          }
          return ent.name
        })
      }

      if (uniqueIids.size) {
        replaced = replaced.replace(/iid:(\w+)/g, (match, iid) => {
          const item = byIid[iid]
          return item ? item.name : match
        })
      }

      entry.resolve(replaced)
    }

    incrementPerformanceDiagnostic('replaceIdsQueueTotalMs', Date.now() - startedAt)
  } catch {
    incrementPerformanceDiagnostic('replaceIdsQueueErrors')
    incrementPerformanceDiagnostic('replaceIdsQueueTotalMs', Date.now() - startedAt)
    for (const entry of batch) {
      entry.resolve(entry.command)
    }
  }
}

export function getOrderCmd () {
  if (state.playerModalAs && state.gameState.charmies[state.playerModalAs]) {
    return `order eid:${state.playerModalAs} `
  }
  return ''
}