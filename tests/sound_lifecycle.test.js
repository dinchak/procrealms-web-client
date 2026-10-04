// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { setImmediate as nextTurn } from 'node:timers/promises'
import { loadRuntimeModule } from './support/runtime.js'
import { mountComponent } from './support/components.js'

function music () {
  const requests = []
  const sources = []
  const tracks = [{ name: `First`, url: `/first` }, { name: `Second`, url: `/second` }]
  const audioContext = {
    state: `running`,
    decodeAudioData: buffer => Promise.resolve(buffer),
    suspend () { this.state = `suspended`; return Promise.resolve() },
    resume () { this.state = `running`; return Promise.resolve() },
    close () { this.state = `closed`; return Promise.resolve() },
    createBufferSource () {
      const source = {
        started: false, disconnected: false, listeners: {},
        connect () {}, start () { this.started = true }, stop () {},
        disconnect () { this.disconnected = true },
        addEventListener (name, callback) { this.listeners[name] = callback }
      }
      sources.push(source)
      return source
    }
  }
  const state = { music: { audioContext, gainNode: { disconnect () {} }, audioAnalyzer: { disconnect () {} }, musicSource: null, currentTrack: null, playing: false } }
  class Request {
    status = 200
    response = `buffer`
    aborted = false
    open () {}
    send () { requests.push(this) }
    abort () { this.aborted = true; this.onabort() }
  }
  const runtime = loadRuntimeModule(`../../src/static/sound.js`, { state, MUSIC_TRACKS: tracks, XMLHttpRequest: Request },
    [`startPlaying`, `stopPlaying`, `playTrackByName`, `disposeAudioContext`])
  return { ...runtime, state, requests, sources, tracks, audioContext }
}

test(`stopping or pausing while music loads prevents late playback`, async () => {
  for (const pause of [false, true]) {
    const view = music()
    const pending = view.startPlaying(view.tracks[0])
    view.stopPlaying(pause)
    await view.requests[0].onload()
    await pending
    assert.equal(view.sources.length, 0)
    assert.equal(view.state.music.playing, false)
    assert.equal(view.audioContext.state, `suspended`)
  }
})

test(`the latest music selection wins even when earlier downloads complete later`, async () => {
  const view = music()
  const first = view.startPlaying(view.tracks[0])
  const second = view.startPlaying(view.tracks[1])
  await view.requests[1].onload()
  await second
  await view.requests[0].onload()
  await first
  assert.equal(view.sources.length, 1)
  assert.equal(view.state.music.currentTrack.name, `Second`)
  assert.equal(view.state.music.playing, true)
})

test(`repeated requests share a track download and start a single audio source`, async () => {
  const view = music()
  const first = view.startPlaying(view.tracks[0])
  const second = view.startPlaying(view.tracks[0])
  assert.equal(view.requests.length, 1)
  await view.requests[0].onload()
  await Promise.all([first, second])
  assert.equal(view.sources.length, 1)
})

test(`failed music requests settle and permit retry instead of blocking all future playback`, async () => {
  for (const failure of [`network`, `abort`, `timeout`, `empty`, `http`, `decode`]) {
    const view = music()
    const pending = view.startPlaying(view.tracks[0])
    const request = view.requests[0]
    if (failure === `network`) {
      request.onerror()
    } else if (failure === `abort`) {
      request.onabort()
    } else if (failure === `timeout`) {
      request.ontimeout()
    } else {
      if (failure === `empty`) {
        request.response = null
      } else if (failure === `http`) {
        request.status = 404
      } else {
        view.audioContext.decodeAudioData = () => Promise.reject(new Error(`Invalid audio`))
      }
      await request.onload()
    }
    await pending
    assert.equal(view.state.music.playing, false)
    const retry = view.startPlaying(view.tracks[1])
    view.audioContext.decodeAudioData = buffer => Promise.resolve(buffer)
    await view.requests[1].onload()
    await retry
    assert.equal(view.state.music.currentTrack.name, `Second`)
  }
})

test(`finished music sources disconnect before advancing to the next track`, async () => {
  const view = music()
  const pending = view.startPlaying(view.tracks[0])
  await view.requests[0].onload()
  await pending
  const ended = view.sources[0].listeners.ended()
  assert.equal(view.sources[0].disconnected, true)
  assert.equal(view.requests.length, 2)
  await view.requests[1].onload()
  await ended
  assert.equal(view.state.music.currentTrack.name, `Second`)
})

test(`leaving the game releases the audio graph and invalidates pending music`, async () => {
  const view = music()
  const pending = view.startPlaying(view.tracks[0])
  view.disposeAudioContext()
  await pending
  assert.equal(view.requests[0].aborted, true)
  assert.equal(view.sources.length, 0)
  assert.equal(view.audioContext.state, `closed`)
  assert.equal(view.state.music.audioContext, null)
  assert.equal(view.state.music.gainNode, null)
  assert.equal(view.state.music.audioAnalyzer, null)
})

test(`a new session can request music immediately after the old session cancels its download`, async () => {
  const view = music()
  const oldSession = view.startPlaying(view.tracks[0])
  view.disposeAudioContext()
  view.state.music.audioContext = { ...view.audioContext, state: `running` }
  const newSession = view.startPlaying(view.tracks[0])
  assert.equal(view.requests.length, 2)
  await oldSession
  await view.requests[1].onload()
  await newSession
  assert.equal(view.state.music.playing, true)
  assert.equal(view.sources.length, 1)
})

test(`blocked notification audio is handled and playing notifications stop on unmount`, async () => {
  const audio = []
  class NotificationAudio {
    paused = false
    constructor () { audio.push(this) }
    play () { return Promise.reject(new Error(`Autoplay blocked`)) }
    pause () { this.paused = true }
  }
  const view = mountComponent(`../../src/components/SoundHandler.vue`, {
    state: { options: { chatSounds: true }, soundQueue: `tell` }, Audio: NotificationAudio
  })
  try {
    assert.doesNotThrow(() => view.setup.soundPlayback(`constructor`))
    await nextTurn()
  } finally {
    view.app.unmount()
  }
  assert.equal(audio.every(sound => sound.paused && sound.currentTime === 0), true)
})
