// @ts-check
/** Authenticate only after form validation and reject unexpected protocol responses. */
export async function requestAuthentication (sendWithResponse, command, credentials) {
  const { cmd, msg } = await sendWithResponse(command, credentials)
  if (cmd === `token.success`) {
    return msg
  }
  if (cmd === `login.validationFailed`) {
    throw new Error(`Invalid character name`)
  }
  if (cmd === `login.fail`) {
    throw new Error(command === `create` ? `Failed to create character` : `Invalid name or password`)
  }
  if (cmd === `token.fail`) {
    throw new Error(`Saved login has expired. Please sign in again.`)
  }
  throw new Error(`Unexpected response from server`)
}

/** Present connection failures without exposing request IDs or protocol details. */
export function getAuthenticationError (error) {
  if (error?.name === `ConnectionError`) {
    return `Connection lost. Please try again.`
  }
  if (error?.message?.includes(`timed out`)) {
    return `The server did not respond. Please try again.`
  }
  return error?.message || `Unable to sign in. Please try again.`
}
