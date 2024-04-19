export const CACHE_DELETE_TIME = 1200000 // 20 minutes

export const CACHE_DELETE_INTERVAL = 900000 // 15 minutes

export const FONT_SIZES = [{
  value: '14px',
  label: 'Small'
}, {
  value: '16px',
  label: 'Medium'
}, {
  value: '18px',
  label: 'Large'
}]

export const FONT_OPTIONS = [{
  label: 'Big Blue Terminal',
  value: 'Big Blue Terminal, monospace'
}, {
  label: 'Consola Mono',
  value: 'Consola Mono, monospace'
}, {
  label: 'DOS',
  value: 'DOS, monospace'
}, {
  label: 'Inconsolata',
  value: 'Inconsolata, monospace'
}, {
  label: 'Monofonto',
  value: 'Monofonto, monospace'
}, {
  label: 'Source Code Pro',
  value: 'Source Code Pro, monospace'
}, {
  label: 'Ubuntu Mono',
  value: 'Ubuntu Mono, monospace'
}, {
  label: 'VT323',
  value: '"VT323", monospace'
}]

export const ACTION_MAP = [
  // TODO
  // We need room.flags to be implemented
  /*{
      action: 'sell',
      condition: () => state.gameState.room.flags.includes('store')
  },*/
  // Slot would be nice to implement with a modal
  /*{
      action: 'slot',
      condition: (it) => (it.type === 'consumable' && ['potion', 'food', 'fragment'].includes(it.subtype)) || it.type === 'scroll'
  },*/

  // Look and Examine are now included in the modal, so buttons not needed for now
  // {
  //     action: 'look',
  //     condition: () => true
  // },
  // {
  //     action: 'examine',
  //     condition: () => true
  // },
  {
      action: 'drink',
      condition: (it) => it.type === 'consumable' && it.subtype === 'potion',
      crafting: false
  },
  {
      action: 'eat',
      condition: (it) => it.type === 'consumable' && ['food', 'mote', 'fragment'].includes(it.subtype),
      crafting: false
  },
  {
      action: 'deploy',
      condition: (it) => it.subtype ==='deployable',
      crafting: false
  },
  {
      action: 'read',
      condition: (it) => it.type === 'book' || it.type === 'scroll',
      crafting: false
  },
  {
      action: 'wield',
      condition: (it) => it.type === 'weapon' || it.type === 'tool',
      crafting: false
  },
  {
      action: 'wear',
      condition: (it) => it.type === 'armor',
      crafting: false
  },
  {
      action: 'compare',
      condition: (it) => it.type === 'armor' || it.type === 'weapon',
      crafting: false
  },
  {
      action: 'filet',
      condition: (it) => it.type === 'material' && it.subtype === 'fish',
      crafting: true
  },
  {
      action: 'tan',
      condition: (it) => it.type === 'material' && it.subtype === 'hide',
      crafting: true
  },
  {
      action: 'plant',
      condition: (it) => it.type === 'material' && it.subtype === 'seed',
      crafting: true
  },
  {
      action: 'wrap',
      condition: (it) => it.type === 'material' && it.subtype === 'bandage',
      crafting: false
  },
  {
      action: 'fish bait',
      condition: (it) => it.subtype === 'bait',
      crafting: true
  },
  {
      action: 'fish hook',
      condition: (it) => it.subtype === 'hook',
      crafting: true
  },
  // Drop action is removed right now because it's a default action in ItemModal
  /*{
      action: 'drop',
      condition: () => true,
      crafting: false
  },*/
  {
      action: 'salvage',
      condition: (it) => ['armor', 'tool', 'weapon'].includes(it.type) && !it.name.includes('artifact'),
      crafting: true
  }
]

export const DIRECTION_MAP = {
  0: 'enter',
  1: 'north',
  2: 'northwest',
  3: 'west',
  4: 'southwest',
  5: 'south',
  6: 'southeast',
  7: 'east',
  8: 'northeast'
}

export const COMMAND_IDS = {
  EXAMINE: '1000',
  COMPARE: '1001',
  MAP: '1002',
  MERC_ACTION: '1003'
}

export const TRAITS_MERCENARY = 'mercenary'

export const DAMAGE_TYPE_COLORS = {
  'bludgeoning': 'bold-magenta',
  'piercing': 'bold-yellow',
  'slashing': 'bold-red',
  'arcane': 'bold-cyan',
  'electric': 'bold-yellow',
  'fire': 'bold-red',
  'ice': 'bold-blue',
  'acid': 'bold-green',
  'holy': 'bold-white',
  'poison': 'bold-green',
}

export const ITEM_EFFECTS = [
  {
    bonus: 'agility',
    label: 'agility',
    color: '{{Y',
    multiplier: 0.1,
    minimum: 1,
    prefix: 'agile',
    gem: false,
    integer: true
  },
  {
    bonus: 'strength',
    label: 'strength',
    color: '{{R',
    multiplier: 0.1,
    minimum: 1,
    prefix: 'strong',
    gem: false,
    integer: true
  },
  {
    bonus: 'magic',
    label: 'magic',
    color: '{{C',
    multiplier: 0.1,
    minimum: 1,
    prefix: 'magical',
    gem: false,
    integer: true
  },
  {
    bonus: 'spirit',
    label: 'spirit',
    color: '{{G',
    multiplier: 0.1,
    minimum: 1,
    prefix: 'vigorous',
    gem: false,
    integer: true
  },

  {
    bonus: 'magicFind',
    label: 'magic find',
    color: '{{Y',
    multiplier: 0.1,
    minimum: 2,
    prefix: false,
    gem: false,
    integer: true
  },
  {
    bonus: 'speed',
    label: 'speed',
    color: '{{Y',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'quick',
    gem: 'topaz',
    integer: true
  },

  {
    bonus: 'criticalMultiplier',
    label: 'critical multiplier',
    color: '{{R',
    percent: true,
    multiplier: 0.001,
    minimum: 0.005,
    prefix: 'impactful',
    gem: 'obsidian',
    integer: false
  },
  {
    bonus: 'critical',
    label: 'critical',
    color: '{{Y',
    percent: true,
    multiplier: 0.01,
    minimum: 0.05,
    prefix: 'precise',
    gem: 'obsidian',
    integer: false
  },

  {
    bonus: 'spellCooldown',
    label: 'spell cooldown',
    color: '{{C',
    multiplier: 0.005,
    minimum: 0.025,
    prefix: 'cooling',
    gem: 'opal',
    integer: false
  },
  {
    bonus: 'castingTime',
    label: 'casting time',
    color: '{{C',
    multiplier: 0.002,
    minimum: 0.01,
    prefix: 'wizardly',
    gem: 'opal',
    integer: false
  },

  {
    bonus: 'magicDamage',
    label: 'magic damage',
    color: '{{M',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'embuing',
    gem: 'sapphire',
    integer: true
  },

  {
    bonus: 'command',
    label: 'command',
    color: '{{G',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'commanding',
    gem: 'diamond',
    integer: true
  },
  {
    bonus: 'focus',
    label: 'focus',
    color: '{{B',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'focused',
    subtypes: ['mace', 'polearm', 'wand'],
    gem: 'diamond',
    integer: true
  },

  {
    bonus: 'skillCooldown',
    label: 'skill cooldown',
    color: '{{m',
    multiplier: 0.005,
    minimum: 0.025,
    prefix: 'refreshing',
    gem: 'malachite',
    integer: false
  },

  {
    bonus: 'hp',
    label: 'hp',
    color: '{{G',
    multiplier: 1,
    minimum: 5,
    prefix: 'healthy',
    gem: 'ruby',
    integer: true
  },

  {
    bonus: 'energy',
    label: 'energy',
    color: '{{W',
    multiplier: 0.4,
    minimum: 2,
    prefix: 'energized',
    gem: 'sapphire',
    integer: true
  },
  {
    bonus: 'stamina',
    label: 'stamina',
    color: '{{Y',
    multiplier: 0.4,
    minimum: 2,
    prefix: 'staminous',
    gem: 'emerald',
    integer: true
  },
  {
    bonus: 'regeneration',
    label: 'regeneration',
    color: '{{G',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'renewing',
    gem: 'malachite',
    integer: true
  },
  {
    bonus: 'maxItems',
    label: 'max items',
    color: '{{Y',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'spacious',
    gem: 'ruby',
    integer: true
  },
  {
    bonus: 'damage',
    label: 'damage',
    color: '{{R',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'vicious',
    gem: 'obsidian',
    integer: true
  },
  {
    bonus: 'maxWeight',
    label: 'max weight',
    color: '{{R',
    multiplier: 2,
    minimum: 10,
    prefix: 'light',
    gem: 'emerald',
    integer: true
  },
  {
    bonus: 'maxItems',
    label: 'max items',
    color: '{{R',
    multiplier: 0.5,
    minimum: 2,
    prefix: 'pocketed',
    gem: 'emerald',
    integer: true
  },
  {
    bonus: 'armor',
    label: 'armor',
    color: '{{W',
    multiplier: 2,
    minimum: 10,
    prefix: 'defensive',
    gem: 'diamond',
    integer: true
  },
  {
    bonus: 'xpBonus',
    label: 'xp bonus',
    color: '{{c',
    percent: true,
    multiplier: 0.1,
    minimum: 2,
    prefix: false,
    gem: false,
    integer: false
  },

  {
    bonus: 'resistFire',
    label: 'resist fire',
    color: '{{R',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'heated',
    gem: 'ruby',
    integer: true
  },
  {
    bonus: 'resistIce',
    label: 'resist ice',
    color: '{{B',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'frosted',
    gem: 'sapphire',
    integer: true
  },
  {
    bonus: 'resistElectric',
    label: 'resist electric',
    color: '{{Y',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'sparking',
    gem: 'topaz',
    integer: true
  },
  {
    bonus: 'resistArcane',
    label: 'resist arcane',
    color: '{{C',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'shielding',
    gem: 'opal',
    integer: true
  },
  {
    bonus: 'resistHoly',
    label: 'resist holy',
    color: '{{W',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'holy',
    gem: 'diamond',
    integer: true
  },
  {
    bonus: 'resistPoison',
    label: 'resist poison',
    color: '{{g',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'curative',
    gem: 'malachite',
    integer: true
  },
  {
    bonus: 'resistPiercing',
    label: 'resist piercing',
    color: '{{r',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'deflecting',
    gem: 'topaz',
    integer: true
  },
  {
    bonus: 'resistSlashing',
    label: 'resist slashing',
    color: '{{R',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'folded',
    gem: 'obsidian',
    integer: true
  },
  {
    bonus: 'resistBludgeoning',
    label: 'resist bludgeoning',
    color: '{{y',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'absorbing',
    gem: 'ruby',
    integer: true
  },
  {
    bonus: 'resistAcid',
    label: 'resist acid',
    color: '{{G',
    multiplier: 0.2,
    minimum: 1,
    prefix: 'stainless',
    gem: 'emerald',
    integer: true
  },
]

export const ANSI = {
  black: String.fromCharCode(27) + '[30m',
  red: String.fromCharCode(27) + '[31m',
  green: String.fromCharCode(27) + '[32m',
  yellow: String.fromCharCode(27) + '[33m',
  blue: String.fromCharCode(27) + '[34m',
  magenta: String.fromCharCode(27) + '[35m',
  cyan: String.fromCharCode(27) + '[36m',
  white: String.fromCharCode(27) + '[37m',
  boldBlack: String.fromCharCode(27) + '[90m',
  boldRed: String.fromCharCode(27) + '[91m',
  boldGreen: String.fromCharCode(27) + '[92m',
  boldYellow: String.fromCharCode(27) + '[93m',
  boldBlue: String.fromCharCode(27) + '[94m',
  boldMagenta: String.fromCharCode(27) + '[95m',
  boldCyan: String.fromCharCode(27) + '[96m',
  boldWhite: String.fromCharCode(27) + '[97m',
  reset: String.fromCharCode(27) + '[0m'
}

export const ANSI_REPLACEMENTS = [
  { from: '1;30m', to: '90m' },
  { from: '1;31m', to: '91m' },
  { from: '1;32m', to: '92m' },
  { from: '1;33m', to: '93m' },
  { from: '1;34m', to: '94m' },
  { from: '1;35m', to: '95m' },
  { from: '1;36m', to: '96m' },
  { from: '1;37m', to: '97m' },
]
