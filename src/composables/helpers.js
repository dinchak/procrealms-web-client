export function helpers() {
    function copperToMoneyString(amount) {
        let valueString = '';
        let copperString = amount.toString();

        if (copperString.length > 4) {
            valueString = "<span class='bold-yellow'>" + copperString.slice(0, copperString.length - 4) + " gold, " + "</span>"
            copperString = copperString.slice(copperString.length - 4, copperString.length)
        }

        if (copperString.length > 2) {
            valueString += copperString.slice(0, copperString.length - 2) + " silver, "
            copperString = copperString.slice(copperString.length - 2, copperString.length)
        }

        if (copperString === "00") {
            copperString = "0"
        }

        valueString += "<span class='bold-cyan'>" + copperString + " copper"  + "</span>"

        return valueString;
    }

    return { copperToMoneyString }
}