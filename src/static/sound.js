// @ts-check
import { state } from '@/static/state'
import { MUSIC_TRACKS } from '@/static/constants'

const pendingTracks = new Map()
let playbackToken = 0
let randomPlaylist = []
let nextPlaylistIndex = 0

function shuffleTracks (previousTrack) {
  let playlist = [...MUSIC_TRACKS]

  for (let i = playlist.length - 1; i > 0; i--) {
    let swapIndex = Math.random() * (i + 1) | 0
    let track = playlist[i]
    playlist[i] = playlist[swapIndex]
    playlist[swapIndex] = track
  }

  if (previousTrack && playlist.length > 1 && playlist[0].name === previousTrack.name) {
    let swapIndex = playlist.findIndex(track => track.name !== previousTrack.name)
    let track = playlist[0]
    playlist[0] = playlist[swapIndex]
    playlist[swapIndex] = track
  }

  return playlist
}

function getNextRandomTrack () {
  const { currentTrack } = state.music

  if (!randomPlaylist.length || nextPlaylistIndex >= randomPlaylist.length) {
    randomPlaylist = shuffleTracks(currentTrack)
    nextPlaylistIndex = 0
  }

  let track = randomPlaylist[nextPlaylistIndex]

  if (track?.name === currentTrack?.name && MUSIC_TRACKS.length > 1) {
    let swapIndex = randomPlaylist.findIndex((playlistTrack, index) => {
      return index > nextPlaylistIndex && playlistTrack.name !== currentTrack.name
    })

    if (swapIndex !== -1) {
      randomPlaylist[nextPlaylistIndex] = randomPlaylist[swapIndex]
      randomPlaylist[swapIndex] = track
      track = randomPlaylist[nextPlaylistIndex]
    } else {
      randomPlaylist = shuffleTracks(currentTrack)
      nextPlaylistIndex = 0
      track = randomPlaylist[nextPlaylistIndex]
    }
  }

  nextPlaylistIndex++
  return track
}

export async function playTrackByName (name) {
  const { currentTrack } = state.music

  if (currentTrack?.name === name && state.music.musicSource) {
    return
  }

  let track = MUSIC_TRACKS.find(t => t.name === name)

  if (!track) {
    return
  }

  await startPlaying(track)
}

export async function playRandomTrack () {
  let track = getNextRandomTrack()

  if (!track) {
    return
  }

  await startPlaying(track)
}

export function stopPlaying (pause) {
  playbackToken++
  const { musicSource, audioContext } = state.music

  state.music.playing = false
  if (audioContext && audioContext.state !== `closed`) {
    audioContext.suspend().catch(() => {})
  }

  if (!pause && musicSource) {
    state.music.musicSource = null
    musicSource.stop()
    musicSource.disconnect()
  }
}

/** Release audio resources when leaving the game so the next session can initialize them. */
export function disposeAudioContext () {
  stopPlaying()
  for (const pending of pendingTracks.values()) {
    pending.request.abort()
  }
  pendingTracks.clear()
  const { audioContext, gainNode, audioAnalyzer } = state.music
  gainNode?.disconnect()
  audioAnalyzer?.disconnect()
  if (audioContext && audioContext.state !== `closed`) {
    audioContext.close().catch(() => {})
  }

  state.music.audioContext = null
  state.music.gainNode = null
  state.music.audioAnalyzer = null
}

export async function startPlaying (track) {
  const token = ++playbackToken
  const { audioContext, gainNode } = state.music

  if (!track || !audioContext || audioContext.state === `closed`) {
    return
  }

  try {
    if (!track.buffer) {
      await loadTrack(track, audioContext)
    }

    if (token !== playbackToken || audioContext !== state.music.audioContext || audioContext.state === `closed`) {
      return
    }

    if (state.music.currentTrack !== track || !state.music.musicSource) {
      const previousSource = state.music.musicSource
      state.music.musicSource = null
      if (previousSource) {
        previousSource.stop()
        previousSource.disconnect()
      }

      const musicSource = audioContext.createBufferSource()
      musicSource.buffer = track.buffer
      musicSource.connect(gainNode)

      state.music.musicSource = musicSource
      state.music.currentTrack = track

      musicSource.addEventListener(`ended`, async () => {
        musicSource.disconnect()
        if (state.music.musicSource !== musicSource) {
          return
        }

        state.music.musicSource = null
        if (state.music.playing) {
          await playRandomTrack()
        }
      }, { once: true })

      musicSource.start()
    }

    if (audioContext.state === `suspended`) {
      await audioContext.resume()
    }

    if (token === playbackToken) {
      state.music.playing = true
    }
  } catch {
    if (token === playbackToken) {
      state.music.playing = false
    }
  }
}

function loadTrack (track, audioContext) {
  if (pendingTracks.has(track)) {
    return pendingTracks.get(track).promise
  }

  const request = new XMLHttpRequest()
  const pending = new Promise((resolve, reject) => {
    request.open('GET', track.url, true)
    request.responseType = 'arraybuffer'
    request.timeout = 30000
    request.onerror = request.onabort = request.ontimeout = () => reject(new Error(`Unable to load music`))

    request.onload = async () => {
      if (!request.response || request.status >= 400) {
        reject(new Error(`Unable to load music`))
        return
      }

      try {
        track.buffer = await audioContext.decodeAudioData(request.response)
        resolve()
      } catch (error) {
        reject(error)
      }
    }

    request.send()
  })

  const cleanup = pending.finally(() => {
    if (pendingTracks.get(track)?.promise === cleanup) {
      pendingTracks.delete(track)
    }
  })
  pendingTracks.set(track, { promise: cleanup, request })
  return cleanup
}

export const playMessageSound = ({ channel, /* id, from, to, timestamp, message */ }) => {
  let sound = null
  if (channel === 'say') {
    // TODO: Filter NPCs
  }

  switch (channel) {
  case 'newbie':
  case 'tell':
    sound = channel
    break

  case 'announce':
  case 'info':
    sound = 'announce'
    break

  case 'events':
    break

  default:
    sound = 'chat'
    break
  }

  if (sound) {
    playSound(sound)
  }
}

export const playSound = name => {
  state.soundQueue = name
}
