export const action_mapper = [
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
    {
        action: 'drop',
        condition: () => true,
        crafting: false
    },
    {
        action: 'salvage',
        condition: (it) => ['armor', 'tool', 'weapon'].includes(it.type),
        crafting: true
    }
]
