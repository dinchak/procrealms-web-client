// @ts-check
/** Evict cached details affected by a state patch, including edits to scalar fields. */
export function invalidateStateCaches (cache, previous, next, patch) {
  const itemIds = new Set()
  const entityIds = new Set()

  function collect (value, inventory = false) {
    if (typeof value === `string`) {
      if (inventory) {
        itemIds.add(value)
      }
      return
    }
    if (!value || typeof value !== `object`) {
      return
    }
    if (value.iid) {
      itemIds.add(value.iid)
    }
    if (value.eid) {
      entityIds.add(value.eid)
    }
    for (const [key, child] of Object.entries(value)) {
      collect(child, (inventory && !value.iid) || [`inventory`, `items`, `equipment`, `tools`].includes(key))
    }
  }

  function visit (root, parts) {
    let node = root
    let inventory = false
    for (const key of parts) {
      if (!node || typeof node !== `object`) {
        return
      }
      if (node.iid) {
        itemIds.add(node.iid)
      }
      if (node.eid) {
        entityIds.add(node.eid)
      }
      inventory = (inventory && !node.iid) || [`inventory`, `items`, `equipment`, `tools`].includes(key)
      node = node[key]
    }
    collect(node, inventory)
  }

  for (const operation of patch) {
    const paths = [operation.path]
    if (operation.from !== undefined) {
      paths.push(operation.from)
    }
    for (const path of paths) {
      const parts = path === `` ? [] : path.slice(1).split(`/`).map(key => key.replaceAll(`~1`, `/`).replaceAll(`~0`, `~`))
      visit(previous, parts)
      visit(next, parts)
    }
  }
  for (const iid of itemIds) {
    delete cache.itemCache[iid]
  }
  for (const eid of entityIds) {
    delete cache.entityCache[eid]
  }
}
