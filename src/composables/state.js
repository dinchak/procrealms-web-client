import { reactive, ref } from "vue"

export const state = reactive({
  options: {
    movementDuringInput: false,
    fixedMap: false,
    commandHistoryButton: false,
    swapControls: false,
    hideSidebar: false,
    chatInMain: true,
    showTabs: true,
    showMapArea: true
  },

  activeTab: 'output',

  showHelp: false,

  pendingRequests: {},

  entityCache: {},
  itemCache: {},
  commandCache: {},

  connected: false,

  showLogin: false,
  loginResolve: null,
  loginReject: null,

  showNewPlayer: false,
  nameExistsResolve: null,
  nameExistsReject: null,

  showLogout: false,

  // hotkey or input
  mode: 'hotkey',

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

  gameState: {
    player: {},
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
    room: {
      exits: [],
      entities: [],
      items: []
    },
    map: [],
    slots: []
  },
  modal: {
    visible: false,
    item: ref({}),
    menu: ''
  }
})

export function addLine (line, bufferName) {
  let maxLength = 500
  if (bufferName == 'output') {
    maxLength = 2500
  }

  if (!state[bufferName]) {
    throw new Error(`Unknown buffer ${bufferName}`)
  }

  state[bufferName].push(line)
  if (state[bufferName].length > maxLength) {
    state[bufferName].shift()
  }
}