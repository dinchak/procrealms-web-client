import { DEFAULT_TERMINAL_SIZE } from '@/static/constants'
import { state, resetInputMappings } from '@/static/state'

export function useLocalStorageHandler () {
  function saveOptions () {
    localStorage.setItem('options', JSON.stringify(state.options))
  }

  function loadOptions () {
    try {
      const options = JSON.parse(localStorage.getItem('options'))
      if (options !== null) {
        state.options = Object.assign(state.options, options)
      }

      if (
        !(state.options.terminalHeight > 0 && state.options.terminalHeight < 300) ||
        !(state.options.terminalWidth > 0 && state.options.terminalWidth < 300)
      ) {
        state.options.terminalHeight = DEFAULT_TERMINAL_SIZE.height
        state.options.terminalWidth = DEFAULT_TERMINAL_SIZE.width
      }

      if (state.options.fontFamily) {
        document.getElementById('app').style.fontFamily = state.options.fontFamily
      }

      document.getElementById('app').style.fontSize = state.options.fontSize
    } catch (err) {
      console.log(err.stack)
      localStorage.setItem('options', '')
    }
  }

  function saveInputMappings () {
    localStorage.setItem('inputMappings', JSON.stringify(state.inputMappings))
  }

  function loadInputMappings () {
    try {
      const json = localStorage.getItem('inputMappings')
      if (json === null) {
        state.inputMappings = resetInputMappings()
        return
      }
      state.inputMappings = JSON.parse(json)
    } catch {
      state.inputMappings = resetInputMappings()
    }
  }

  function getTokens () {
    try {
      let json = localStorage.getItem('tokens')
      if (!json) {
        return []
      }
      return JSON.parse(json)
    } catch {
      return []
    }
  }

  function addToken (name, token) {
    let tokens = getTokens()
    let existingToken = tokens.find(tk => tk.name == name)

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
    saveOptions,
    loadOptions,
    saveInputMappings,
    loadInputMappings,
    getTokens,
    addToken,
    deleteToken
  }
}
