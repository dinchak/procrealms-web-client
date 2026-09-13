// @ts-check
import jiff from 'jiff'

/**
 * Applies a patch only to its expected baseline; duplicate versions are harmless.
 * @param {Object} gameState - The last successfully applied state.
 * @param {number|null} currentVersion - The version of that state.
 * @param {{patch: Object[], baseVersion?: number, version?: number, full?: boolean}} message - The server update.
 * @returns {{gameState: Object, version: number|null}|null}
 */
export function applyStateUpdate (gameState, currentVersion, message) {
  const { patch, baseVersion, version, full } = message
  if (version !== undefined) {
    if (!Number.isSafeInteger(version) || version < 1) {
      throw new Error('Invalid state version')
    }
    if (currentVersion !== null && version <= currentVersion) {
      return null
    }
    if (!full && baseVersion !== currentVersion) {
      throw new Error('State update baseline mismatch')
    }
  } else if (currentVersion !== null) {
    throw new Error('Missing state version')
  }

  // jiff.patch clones its input; a failure cannot publish a partially applied state.
  return { gameState: jiff.patch(patch, gameState), version: version ?? null }
}
