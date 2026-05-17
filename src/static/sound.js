import { state } from '@/static/state'
import { MUSIC_TRACKS } from '@/static/constants'

let trackLoading = false
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
  const { musicSource, audioContext } = state.music

  audioContext?.suspend()

  if (!pause && musicSource) {
    musicSource.stop()
    musicSource.disconnect()
    state.music.musicSource = null
  }

  state.music.playing = false
}

export async function startPlaying (track) {
  const { audioContext, gainNode } = state.music

  if (trackLoading) {
    return
  }

  if (!track.buffer) {
    await loadTrack(track)
  }

  if (state.music.currentTrack !== track || !state.music.musicSource) {
    if (state.music.musicSource) {
      state.music.musicSource.stop()
      state.music.musicSource.disconnect()
    }

    let musicSource = audioContext.createBufferSource()
    musicSource.buffer = track.buffer
    musicSource.connect(gainNode)

    state.music.musicSource = musicSource
    musicSource.start()

    musicSource.addEventListener('ended', async ev => {
      if (track.name !== state.music.currentTrack?.name) {
        return
      }

      if (state.music.musicSource !== ev.target) {
        return
      }

      state.music.musicSource = null
      await playRandomTrack()
    })

    state.music.currentTrack = track
  }

  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

  state.music.playing = true
}

function loadTrack (track) {
  return new Promise(resolve => {
    trackLoading = true
    if (track.buffer) {
      trackLoading = false
      resolve()
      return
    }

    let request = new XMLHttpRequest()
    request.open('GET', track.url, true)
    request.responseType = 'arraybuffer'

    request.onload = () => {
      if (!request.response) {
        trackLoading = false
        return
      }

      state.music.audioContext.decodeAudioData(request.response, buffer => {
        track.buffer = buffer
        trackLoading = false
        resolve()
      })
    }

    request.send()
  })
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
