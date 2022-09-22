import { reactive } from "vue"

export const state = reactive({
  options: {
    movementDuringInput: false,
    fixedMap: false,
    commandHistoryButton: false,
    swapControls: false,
    hideSidebar: false,
  },

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

  scrolledBack: false,
  output: [],

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