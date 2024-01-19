export function useTokenHandler () {

  function getTokens () {
    try {
      let json = localStorage.getItem('tokens')
      if (!json) {
        return []
      }
      return JSON.parse(json)
    } catch (err) {
      return []
    }
  }

  function addToken (name, token) {
    let tokens = getTokens()
    let existingToken = tokens.find(token => token.name == name)

    if (existingToken) {
      existingToken.token = token
    } else {
      tokens.push({ name, token })
    }

    localStorage.setItem('tokens', JSON.stringify(tokens))
  }

  function deleteToken (name) {
    let tokens = getTokens()
    tokens = tokens.filter(token => token.name != name)
    localStorage.setItem('tokens', JSON.stringify(tokens))
  }

  return {
    getTokens,
    addToken,
    deleteToken
  }
}