const AU = require('ansi_up')
const ansi_up = new AU.default
ansi_up.use_classes = true

import { action_mapper } from '@/composables/constants/action_mapper';

export function helpers() {
    function copperToMoneyString(amount, short) {
        let valueString = '';
        let copperString = amount.toString();

        const gold = short ? 'g ' : ' gold, '
        const silver = short ? 's ' : ' silver, '
        const copper = short ? 'c ' : ' copper '

        if (copperString.length > 4) {
            valueString = "<span class='bold-yellow'>" + copperString.slice(0, copperString.length - 4) + gold + "</span>"
            copperString = copperString.slice(copperString.length - 4, copperString.length)
        }

        if (copperString.length > 2) {
            valueString += "<span class='bold-white'>" + copperString.slice(0, copperString.length - 2) + silver + "</span>"
            copperString = copperString.slice(copperString.length - 2, copperString.length)
        }

        if (copperString === "00") {
            return valueString;
        }

        valueString += "<span class='bold-cyan'>" + copperString + copper + "</span>"

        return valueString;
    }

    function getActions(item, isPlayer) {
        const playerActions = []
        const mercActions = []
        action_mapper.map(action => {
            if (action.condition(item)) {
                playerActions.push(action.action)
            }
        })

        action_mapper.map(action => {
            if (action.condition(item) && !action.crafting) {
                mercActions.push(action.action)
            }
        })

        return isPlayer ? playerActions : mercActions;
    }

    const ansi = {
        boldBlack: String.fromCharCode(27) + '[90m',
        boldWhite: String.fromCharCode(27) + '[97m',
        reset: String.fromCharCode(27) + '[0m'
    }

    const replacements = [
        { from: '1;30m', to: '90m' },
        { from: '1;31m', to: '91m' },
        { from: '1;32m', to: '92m' },
        { from: '1;33m', to: '93m' },
        { from: '1;34m', to: '94m' },
        { from: '1;35m', to: '95m' },
        { from: '1;36m', to: '96m' },
        { from: '1;37m', to: '97m' },
    ]

    function ansiToHtml (str) {
        for (let { from, to } of replacements) {
            str = str.replace(new RegExp(from, 'g'), to)
        }
        return ansi_up.ansi_to_html(str)
    }

    return { copperToMoneyString, getActions, ansiToHtml, ansi }
}