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
        condition: (it) => it.type === 'consumable' && it.subtype === 'potion'
    },
    {
        action: 'eat',
        condition: (it) => it.type === 'consumable' && ['food', 'mote', 'fragment'].includes(it.subtype)
    },
    {
        action: 'deploy',
        condition: (it) => it.subtype ==='deployable'
    },
    {
        action: 'read',
        condition: (it) => it.type === 'book' || it.type === 'scroll'
    },
    {
        action: 'wield',
        condition: (it) => it.type === 'weapon' || it.type === 'tool'
    },
    {
        action: 'wear',
        condition: (it) => it.type === 'armor'
    },
    {
        action: 'compare',
        condition: (it) => it.type === 'armor' || it.type === 'weapon'
    },
    {
        action: 'filet',
        condition: (it) => it.type === 'material' && it.subtype === 'fish'
    },
    {
        action: 'tan',
        condition: (it) => it.type === 'material' && it.subtype === 'hide'
    },
    {
        action: 'plant',
        condition: (it) => it.type === 'material' && it.subtype === 'seed'
    },
    {
        action: 'wrap',
        condition: (it) => it.type === 'material' && it.subtype === 'bandage'
    },
    {
        action: 'fish bait',
        condition: (it) => it.subtype === 'bait'
    },
    {
        action: 'fish hook',
        condition: (it) => it.subtype === 'hook'
    },
    {
        action: 'drop',
        condition: () => true
    }
]