import { reactive, ref } from "vue"

export const state = reactive({
  connected: false,
  disconnected: false,

  pendingRequests: {},

  gameState: resetGameState(),
  options: resetOptions(),
  cache: resetCache(),

  activeTab: 'output',
  // hotkey or input
  mode: 'hotkey',

  showHelp: false,
  showLogin: false,
  loginResolve: null,
  loginReject: null,

  showNewPlayer: false,
  nameExistsResolve: null,
  nameExistsReject: null,

  showLogout: false,

  // splash screen
  picture: '',

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

  name: '',
  token: '',

  modals: {
    inventoryModals: {
      playerItemModal: ref(''),
      mercItemModal: ref('')
    },
    mapModal: false,
    mapModalSize: 'large',
    mercModal: false
  }
})

export function resetState () {
  state.activeTab = 'output'
  state.showHelp = false
  state.pendingRequests = []
  state.cache = resetCache()
  state.gameState = resetGameState()
  state.options = resetOptions()
  state.output = []
  state.chat = []
  state.trade = []
  state.newbie = []
  state.animations = []
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
    fixedMap: false,
    commandHistoryButton: false,
    swapControls: false,
    hideSidebar: false,
    chatInMain: true,
    showTabs: true,
    showMapArea: true,
    showQuickSlots: true,
    showMobileMovement: false,
    numPadMovement: true,
    wasdMovement: true,
    keepSentCommands: false,
    fontFamily: true,
    fontSize: '16px'
  }
}

let preloadBuffers = {}
let addLinesTimeout = null
const maxLines = 4000
const removeLines = 1000

export function addLine (line, bufferName) {
  if (!state[bufferName]) {
    throw new Error(`Unknown buffer ${bufferName}`)
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
