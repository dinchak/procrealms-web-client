import { reactive } from "vue"

export const state = reactive({
  options: {
    movementDuringInput: false,
    fixedMap: false,
    commandHistoryButton: false,
    swapControls: false,
    hideSidebar: false,
    chatInMain: true
  },

  activeTab: 'output',

  showHelp: false,

  pendingRequests: {},

  entityCache: {},
  itemCache: {},

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
  }
})