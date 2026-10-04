// @ts-check
export function normalizeInventorySource (items = []) {
  return (items || [])
    .map(item => (typeof item === `string` ? { iid: item } : item))
    .filter(item => item && item.iid !== undefined && item.iid !== null && item.iid !== ``)
}

export function getActiveInventorySource (state) {
  if (state.playerModalAs && state.gameState.charmies[state.playerModalAs]) {
    return normalizeInventorySource(state.gameState.charmies[state.playerModalAs].items)
  }

  return normalizeInventorySource(state.gameState.inventory)
}

export function getActiveInventoryStats (state) {
  if (state.playerModalAs && state.gameState.charmies[state.playerModalAs]) {
    return state.gameState.charmies[state.playerModalAs].stats || {}
  }

  return state.gameState.player || {}
}

export function getInventorySignature (items = []) {
  return normalizeInventorySource(items)
    .map(item => `${item.iid}|${item.name || ''}|${item.amount || 1}`)
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

function getBaseInventoryName (item = {}) {
  if (item.colorName) {
    return item.colorName
  }

  if (item.name) {
    return item.name
  }

  const fullName = item.fullName || ''
  return fullName.replace(/^\d+x\s+/, '')
}

export function getInventoryItemDisplayName (item = {}) {
  const amount = Number(item.amount) || 1
  const baseName = getBaseInventoryName(item)

  if (!baseName) {
    return ''
  }

  if (amount > 1) {
    return `${amount}x ${baseName}`
  }

  return baseName
}

export function mergeInventorySourceWithFetchedItems (sourceItems = [], fetchedItems = []) {
  const fetchedByIid = new Map((fetchedItems || [])
    .filter(item => item && item.iid !== undefined && item.iid !== null)
    .map(item => [item.iid, item]))

  return normalizeInventorySource(sourceItems)
    .map(sourceItem => {
      const fetchedItem = fetchedByIid.get(sourceItem.iid) || {}
      const mergedItem = {
        ...fetchedItem,
        ...sourceItem
      }

      mergedItem.fullName = getInventoryItemDisplayName(mergedItem)
      return mergedItem
    })
}
