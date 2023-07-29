export function useCookieHandler() {

  function readTokensFromCookie() {
    try {
      let json = document.cookie.replace(/^tokens=/, '')
      if (json.startsWith('prefs=')) {
        json = '{}'
      }
      return json ? JSON.parse(json) : {}
    } catch (err) {
      clearCookie()
      console.log(err.stack)
      return {}
    }
  }

  function addTokenToCookie(name, token) {
    let tokens = readTokensFromCookie()
    tokens[name] = token
    saveTokens(tokens)
  }

  function removeTokenFromCookie(name) {
    let tokens = readTokensFromCookie()
    delete tokens[name]
    saveTokens(tokens)
  }

  return { addTokenToCookie, readTokensFromCookie, removeTokenFromCookie }

}
function saveTokens(tokens) {
  document.cookie = `tokens=${JSON.stringify(tokens)}; path=/; max-age=${60 * 60 * 24 * 14};`
}

function clearCookie() {
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
  })
}
