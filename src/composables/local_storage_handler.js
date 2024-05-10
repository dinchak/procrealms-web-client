import { state, resetInputMappings } from '@/static/state'

export function useLocalStorageHandler () {
  function loadOptions () {
    try {
      const options = JSON.parse(localStorage.getItem('options'))
      if (options !== null) {
        state.options = Object.assign(state.options, options)
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

  function loadInputMappings () {
    try {
      const json = localStorage.getItem('inputMappings')
      if (json === null) {
        state.inputMappings = resetInputMappings()
        return
      }
      state.inputMappings = JSON.parse(json)
    } catch (err) {
      state.inputMappings = resetInputMappings()
    }
  }

  return {
    loadOptions,
    loadInputMappings
  }
}
