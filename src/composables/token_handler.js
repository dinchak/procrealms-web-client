export function useTokenHandler () {

  function getTokens () {
    try {
      return JSON.parse(localStorage.getItem('tokens'))
    } catch (err) {
      return []
    }
  }

  function addToken (name, token) {
    let tokens = getTokens()
    tokens.push({ name, token })
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