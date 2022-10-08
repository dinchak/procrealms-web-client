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

    function getActions(item) {
        const actions = []
        action_mapper.map(action => {
            if (action.condition(item)) {
                actions.push(action.action)
            }
        })

        return actions;
    }

    return { copperToMoneyString, getActions }
}