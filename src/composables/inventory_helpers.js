export function getActiveInventorySource (state) {
  if (state.playerModalAs && state.gameState.charmies[state.playerModalAs]) {
    return state.gameState.charmies[state.playerModalAs].items || []
  }

  return state.gameState.inventory || []
}

export function getInventorySignature (items = []) {
  return (items || [])
    .map(item => `${item.iid}|${item.amount || 1}`)
    .join('~')
}

export function sortItemsByKey (items = [], key = 'name') {
  return [...(items || [])].sort((a, b) => {
    const aVal = a ? a[key] : undefined
    const bVal = b ? b[key] : undefined

    if (aVal === bVal) {
      return 0
    }

    if (aVal === undefined || aVal === null) {
      return 1
    }

    if (bVal === undefined || bVal === null) {
      return -1
    }

    return aVal > bVal ? 1 : -1
  })
}
