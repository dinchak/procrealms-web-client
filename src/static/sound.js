import { state } from '@/static/state'
import { MUSIC_TRACKS } from '@/static/constants'

let trackLoading = false

export async function playTrack(name) {
  let track = MUSIC_TRACKS.find(t => t.name === name)
  if (!track || state.music.currentTrack === track) return;
  state.music.currentTrack = track
  await startPlaying(track)
}

export async function playRandomTrack () {
  let track = MUSIC_TRACKS[Math.random() * MUSIC_TRACKS.length | 0]
  state.music.currentTrack = track
  await startPlaying(track)
}

export function stopPlaying () {
  const { musicSource } = state.music
  if (musicSource) {
    musicSource.stop()
    musicSource.disconnect()
    state.music.playing = false
  }
}

export async function startPlaying (track) {
  const { audioContext, gainNode } = state.music

  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

  if (trackLoading) {
    return
  }

  if (!track.buffer) {
    await loadTrack(track)
  }

  if (state.music.musicSource) {
    state.music.musicSource.stop()
    state.music.musicSource.disconnect()
  }

  let musicSource = audioContext.createBufferSource()
  musicSource.buffer = track.buffer
  musicSource.connect(gainNode)
  musicSource.start()

  musicSource.addEventListener('ended', async () => {
    if (track.name != state.music.currentTrack.name) {
      return
    }

    if (trackLoading) {
      return
    }

    await playRandomTrack()
  })

  state.music.musicSource = musicSource
  state.music.playing = true
}

function loadTrack (track) {
  return new Promise((resolve, reject) => {
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

      state.music.audioContext.decodeAudioData(request.response, (buffer) => {
        track.buffer = buffer
        trackLoading = false
        resolve()
      })
    }

    request.send()
  })
}
