export function useCookieHandler () {
  function readCookie () {
    return document.cookie.replace(/^prefs=/, '')
  }

  function clearCookie () {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
  }

  return { readCookie, clearCookie }
}