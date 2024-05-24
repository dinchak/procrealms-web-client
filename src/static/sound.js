import { state } from '@/static/state'
import { MUSIC_TRACKS } from '@/static/constants'

let trackLoading = false

export async function playTrackByName(name) {
  let track = MUSIC_TRACKS.find(t => t.name === name)
  if (!track || state.music.currentTrack === track) return;
  await startPlaying(track)
}

export async function playRandomTrack () {
  let track = MUSIC_TRACKS[Math.random() * MUSIC_TRACKS.length | 0]
  await startPlaying(track)
}

export function stopPlaying (pause) {
  const { musicSource, audioContext } = state.music

  audioContext?.suspend()

  if (!pause && musicSource) {
    musicSource.stop()
    musicSource.disconnect()
    state.music.musicSource = null;
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

  if (state.music.currentTrack !== track) {
    if (state.music.musicSource) {
      state.music.musicSource.stop()
      state.music.musicSource.disconnect()
    }

    let musicSource = audioContext.createBufferSource()
    musicSource.buffer = track.buffer
    musicSource.connect(gainNode)

    state.music.musicSource = musicSource
    musicSource.start()

    musicSource.addEventListener('ended', async (ev) => {
      if (track.name !== state.music.currentTrack.name) return;
      if (state.music.musicSource !== ev.target) return;
      console.debug("randum")
      await playRandomTrack();
    })

    state.music.currentTrack = track
  }

  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

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
