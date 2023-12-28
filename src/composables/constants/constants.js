export const constants = {
  CACHE_DELETE_TIME: 1200000, // 20 minutes

  CACHE_DELETE_INTERVAL: 900000, // 15 minutes

  TRAITS_MERCENARY: 'mercenary',

  DAMAGE_TYPE_COLORS: {
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
  },

  ITEM_EFFECTS: [
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
  ],
}