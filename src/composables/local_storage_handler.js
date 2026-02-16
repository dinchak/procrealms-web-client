import { DEFAULT_TERMINAL_SIZE } from '@/static/constants'
import { incrementPerformanceDiagnostic, state } from '@/static/state'
import { resetInputMappings } from '@/static/input_mappings'

let saveOptionsTimeout = null

export function useLocalStorageHandler () {
  function saveOptions () {
    incrementPerformanceDiagnostic('optionsSaveWrites')
    localStorage.setItem('options', JSON.stringify(state.options))
  }

  function saveOptionsDebounced (waitMs = 250) {
    incrementPerformanceDiagnostic('optionsSaveCalls')

    if (saveOptionsTimeout) {
      clearTimeout(saveOptionsTimeout)
    }

    saveOptionsTimeout = setTimeout(() => {
      saveOptionsTimeout = null
      saveOptions()
    }, waitMs)
  }

  function flushPendingOptionsSave () {
    if (!saveOptionsTimeout) {
      return
    }

    clearTimeout(saveOptionsTimeout)
    saveOptionsTimeout = null
    saveOptions()
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

  function exportOptions () {
    const options = {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        let value = localStorage.getItem(key)
        try {
          value = JSON.parse(value)
        } catch {
          // leave as string if not JSON
        }
        options[key] = value
      }

      const json = JSON.stringify(options, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'options.json'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)

    } catch {
      alert('Failed to export options')
    }
  }

  function importOptions (fileText) {
    try {
      const parsed = JSON.parse(fileText)

      if (!parsed || typeof parsed !== 'object') {
        alert('Invalid options file')
        return false
      }

      const ok = window.confirm('This will overwrite everything in localStorage with the uploaded options file. Continue?')
      if (!ok) {
        return false
      }

      // Clear localStorage and populate with uploaded data
      localStorage.clear()
      Object.entries(parsed).forEach(([key, value]) => {
        if (typeof value === 'string') {
          localStorage.setItem(key, value)
        } else {
          try {
            localStorage.setItem(key, JSON.stringify(value))
          } catch (err) {
            // fallback to string conversion
            console.warn('Failed to stringify value for key', key, err)
            localStorage.setItem(key, String(value))
          }
        }
      })

      // Reload to pick up new settings
      window.location.reload()
      return true
    } catch (err) {
      console.error(err)
      alert('Failed to import options: ' + (err && err.message ? err.message : 'unknown error'))
      return false
    }
  }

  return {
    saveOptions,
    saveOptionsDebounced,
    flushPendingOptionsSave,
    loadOptions,
    saveInputMappings,
    loadInputMappings,
    getTokens,
    addToken,
    deleteToken,
    exportOptions,
    importOptions
  }
}
