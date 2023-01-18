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
    gossip: false,
    trade: false,
    newbie: false
  },

  output: [],
  gossip: [],
  trade: [],
  newbie: [],

  name: '',
  token: '',

  modals: {
    inventoryModal: {
      visible: false,
      item: ref({}),
      menu: ''
    },
    mapModal: false,
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
  state.gossip = []
  state.trade = []
  state.newbie = []
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
    charmies: [],
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
    movementDuringInput: false,
    fixedMap: false,
    commandHistoryButton: false,
    swapControls: false,
    hideSidebar: false,
    chatInMain: true,
    showTabs: true,
    showMapArea: true
  }
}

export function addLine (line, bufferName) {
  if (!state[bufferName]) {
    throw new Error(`Unknown buffer ${bufferName}`)
  }

  state[bufferName].push(line || ' ')
}