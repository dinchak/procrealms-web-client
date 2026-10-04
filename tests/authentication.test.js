// @ts-check
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { setImmediate as nextTurn } from 'node:timers/promises'
import { test } from 'node:test'
import * as authenticationHelpers from '../src/composables/authentication_helpers.js'
import { mountComponent } from './support/components.js'

function authentication (component) {
  const requests = []
  const successes = []
  const state = { connected: true, inputEmitter: new EventEmitter(), options: { terminalWidth: 80, terminalHeight: 24 }, modals: { loginModal: true, newPlayerModal: true } }
  const view = mountComponent(`../../src/components/${component}`, {
    state, ...authenticationHelpers, prevMode () {}, setMode () {},
    authenticationSuccess: result => successes.push(result),
    useHelpers: () => ({}),
    useLocalStorageHandler: () => ({ getTokens: () => [], deleteToken () {} }),
    useWebSocket: () => ({ sendWithResponse: (command, credentials) => new Promise((resolve, reject) => requests.push({ command, credentials, resolve, reject })) })
  })
  return { ...view, state, requests, successes }
}

test(`invalid forms never submit login or character creation requests`, async () => {
  for (const component of [`modals/LoginModal.vue`, `modals/NewPlayerModal.vue`]) {
    const view = authentication(component)
    try {
      view.setup.formRef = { validate: () => Promise.reject([{ message: `Invalid form` }]) }
      await view.setup.handleValidation()
      assert.equal(view.requests.length, 0)
      assert.equal(view.setup.isSubmitting, false)
    } finally {
      view.app.unmount()
    }
  }
})

test(`login and creation validate before submitting, and repeated submits send once`, async () => {
  for (const [component, command] of [[`modals/LoginModal.vue`, `login`], [`modals/NewPlayerModal.vue`, `create`]]) {
    const view = authentication(component)
    try {
      view.setup.model.name = `Hero`
      view.setup.model.password = `secret`
      view.setup.formRef = { validate: () => Promise.resolve() }
      const first = view.setup.handleValidation()
      await view.setup.handleValidation()
      await nextTurn()
      assert.equal(view.requests.length, 1)
      assert.equal(view.requests[0].command, command)
      assert.equal(view.requests[0].credentials.name, `Hero`)
      assert.equal(view.setup.isSubmitting, true)
      view.requests[0].resolve({ cmd: `token.success`, msg: { name: `Hero`, token: `token` } })
      await first
      assert.deepEqual(view.successes, [{ name: `Hero`, token: `token` }])
      assert.equal(view.setup.isSubmitting, false)
    } finally {
      view.app.unmount()
    }
  }
})

test(`creation field validation does not create a character and checks the captured name`, async () => {
  const view = authentication(`modals/NewPlayerModal.vue`)
  try {
    assert.equal(view.setup.rules.repeatPassword.some(rule => rule.asyncValidator), false)
    view.setup.model.name = `ChangedName`
    const check = view.setup.rules.name[1].asyncValidator({}, `OriginalName`)
    assert.deepEqual(view.requests[0].credentials, { name: `OriginalName` })
    view.requests[0].resolve({ cmd: `login.nameAvailable` })
    await check
    assert.equal(view.requests.some(request => request.command === `create`), false)
  } finally {
    view.app.unmount()
  }
})

test(`name validation propagates connection failures and rejects unexpected responses`, async () => {
  const view = authentication(`modals/NewPlayerModal.vue`)
  try {
    const check = view.setup.rules.name[1].asyncValidator({}, `Hero`)
    const rejected = assert.rejects(check, /timed out/)
    view.requests[0].reject(new Error(`Request timed out`))
    await rejected
    const unexpected = view.setup.rules.name[1].asyncValidator({}, `Hero`)
    view.requests[1].resolve({ cmd: `unexpected` })
    await assert.rejects(unexpected, /Unexpected response/)
  } finally {
    view.app.unmount()
  }
})

test(`authentication failure clears the busy state and exposes an actionable error`, async () => {
  const view = authentication(`modals/LoginModal.vue`)
  try {
    view.setup.formRef = { validate: () => Promise.resolve() }
    const pending = view.setup.handleValidation()
    await nextTurn()
    view.requests[0].resolve({ cmd: `login.fail` })
    await pending
    assert.equal(view.setup.error, `Invalid name or password`)
    assert.equal(view.setup.isSubmitting, false)
    assert.deepEqual(view.successes, [])
  } finally {
    view.app.unmount()
  }
})

test(`saved-token authentication catches disconnects and remains usable for retry`, async () => {
  const view = authentication(`SplashScreen.vue`)
  try {
    view.state.modals.loginModal = false
    view.state.modals.newPlayerModal = false
    const pending = view.setup.doTokenAuth(`Hero`, `token`)
    await view.setup.doTokenAuth(`Other`, `other`)
    view.setup.openLoginModal()
    view.setup.openNewPlayerModal()
    assert.equal(view.state.modals.loginModal, false)
    assert.equal(view.state.modals.newPlayerModal, false)
    assert.equal(view.requests.length, 1)
    const error = new Error(`Disconnected`)
    error.name = `ConnectionError`
    view.requests[0].reject(error)
    await pending
    assert.equal(view.setup.error, `Connection lost. Please try again.`)
    assert.equal(view.setup.isSubmitting, false)
    const retry = view.setup.doTokenAuth(`Hero`, `token`)
    view.requests[1].resolve({ cmd: `token.success`, msg: { name: `Hero` } })
    await retry
    assert.deepEqual(view.successes, [{ name: `Hero` }])
  } finally {
    view.app.unmount()
  }
})
