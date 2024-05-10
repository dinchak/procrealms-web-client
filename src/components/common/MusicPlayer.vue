<template>
  <div class="music-player-container">
    
    <div class="music-player">
      <canvas ref="analyzer" width="186" height="36"></canvas>

      <div class="track-info">
        <div class="track-name">
          {{ currentTrack.name }}
        </div>

        <div class="play-pause">
          <NIcon @click="play()" v-if="!playing">
            <PlayArrowOutlined></PlayArrowOutlined>
          </NIcon>

          <NIcon @click="pause()" v-if="playing">
            <PauseOutlined></PauseOutlined>
          </NIcon>
        </div>

        <div class="skip-track">
          <NIcon @click="skip()">
            <SkipNextOutlined></SkipNextOutlined>
          </NIcon>
        </div>

      </div>

    </div>
  </div>
</template>
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { NIcon } from 'naive-ui'

import PauseOutlined from '@vicons/material/PauseOutlined'
import PlayArrowOutlined from '@vicons/material/PlayArrowOutlined'
import SkipNextOutlined from '@vicons/material/SkipNextOutlined'

import { MUSIC_TRACKS } from '@/static/constants'

let audioContext = null
let musicSource = null
let audioAnalyzer = null
let analyzerData = null
let stopAnalysis = false

let redCounter = 0
let greenCounter = 0
let blueCounter = 0
let gradientCounter = 0

const currentTrack = ref(false)
const playing = ref(false)
const analyzer = ref(null)

async function play () {
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
    playing.value = true
  }
  if (!currentTrack.value) {
    await playRandomTrack()
  }
}

async function pause () {
  audioContext.suspend()
  playing.value = false
}

async function skip () {
  stopPlaying()
  await playRandomTrack()
}

async function playRandomTrack () {
  let track = MUSIC_TRACKS[Math.random() * MUSIC_TRACKS.length | 0]
  currentTrack.value = track
  await startPlaying(track)
}

function loadTrack (track) {
  return new Promise((resolve, reject) => {
    if (track.buffer) {
      resolve()
      return
    }

    let request = new XMLHttpRequest()
    request.open('GET', track.url, true)
    request.responseType = 'arraybuffer'

    request.onload = () => {
      audioContext.decodeAudioData(request.response, (buffer) => {
        console.log('buffer decoded')
        track.buffer = buffer
        resolve()
      })
    }

    request.send()
  })
}

function stopPlaying () {
  if (musicSource && musicSource.buffer) {
    musicSource.stop()
    musicSource.disconnect()
    playing.value = false
  }
}

async function startPlaying (track) {
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

  playing.value = true
  musicSource = audioContext.createBufferSource()
  await loadTrack(track)
  musicSource.buffer = track.buffer
  musicSource.connect(audioAnalyzer)
  musicSource.start()
}

function drawAnalyzer () {
  if (stopAnalysis) {
    return
  }

  redCounter++
  greenCounter++
  blueCounter++
  gradientCounter++

  requestAnimationFrame(drawAnalyzer)
  audioAnalyzer.getByteFrequencyData(analyzerData)
  const canvas = analyzer.value

  let ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < analyzerData.length; i++) {
    ctx.fillRect(i * 6, canvas.height - analyzerData[i] / 16, 4, analyzerData[i])
    let shade = analyzerData[i]
    let gradient = 32 + Math.cos(gradientCounter / 417) * 16
    let red = Math.max(shade / 4, Math.abs(Math.cos(((redCounter + (i + 1) * gradient) / 1009))) * shade)
    let green = Math.max(shade / 4, Math.abs(Math.cos(((greenCounter + (i + 1) * gradient) / 1129))) * shade)
    let blue = Math.max(shade / 4, Math.abs(Math.cos(((blueCounter + (i + 1) * gradient) / 1283))) * shade)
    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`
    ctx.fill()  
  }
}

onMounted(() => {
  redCounter = Math.random() * 10000
  greenCounter = Math.random() * 10000
  blueCounter = Math.random() * 10000
  gradientCounter = Math.random() * 10000

  audioContext = new AudioContext()
  audioAnalyzer = audioContext.createAnalyser()
  analyzerData = new Uint8Array(audioAnalyzer.frequencyBinCount)
  audioAnalyzer.connect(audioContext.destination)

  drawAnalyzer()
})

onBeforeUnmount(() => {
  stopPlaying()
  audioContext.close()
  stopAnalysis = true
})

</script>
<style lang="less" scoped>
.music-player-container {
  .music-player {
    display: flex;
    flex-direction: column;
    position: relative;

    .track-info {
      display: flex;
      flex-direction: row;
      z-index: 2;

      .track-name {
        margin-right: 10px;
      }

      .play-pause, .skip-track {
        cursor: pointer;
        border: 1px solid #333;
        padding: 2px 5px;
        font-size: 26px;
        margin-right: 8px;
        line-height: 26px;
        background-color: rgba(0, 0, 0, 0.5);
        &:hover {
          border: 1px solid #0cc6c6;
          background-color: #333;
          color: #0cc6c6;
        }
      }
    }

    canvas {
      position: absolute;
      top: 0;
      right: 95px;
      z-index: 1;
    }
  }
}
</style>