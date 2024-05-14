<template>    
  <div class="music-player">
    <div class="track-controls">
      <div class="volume">
        <NSlider class="slider" v-model:value="state.options.volume" @update:value="updateVolume" :step="1" :min="0" :max="100">
          <template #thumb>
            <NIconWrapper :size="24" :border-radius="12">
              <NIcon :size="18" :component="VolumeDownOutlined" />
            </NIconWrapper>
          </template>
        </NSlider>
      </div>

      <div class="play-pause">
        <NIcon @click="play()" v-if="!state.music.playing">
          <PlayArrowOutlined></PlayArrowOutlined>
        </NIcon>

        <NIcon @click="pause()" v-if="state.music.playing">
          <PauseOutlined></PauseOutlined>
        </NIcon>
      </div>

      <div class="skip-track">
        <NIcon @click="skip()">
          <SkipNextOutlined></SkipNextOutlined>
        </NIcon>
      </div>
    </div>

    <div class="track-info">
      <div ref="trackName" class="track-name">
        {{ state.music.currentTrack.name }}
      </div>
      <canvas ref="analyzer" width="186" height="36"></canvas>
    </div>

  </div>
</template>
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { NSlider, NIcon, NIconWrapper } from 'naive-ui'

import PauseOutlined from '@vicons/material/PauseOutlined'
import PlayArrowOutlined from '@vicons/material/PlayArrowOutlined'
import SkipNextOutlined from '@vicons/material/SkipNextOutlined'
import VolumeDownOutlined from '@vicons/material/VolumeDownOutlined'

import { state } from '@/static/state'
import { stopPlaying, playRandomTrack } from '@/static/sound'

let analyzerData = null
let stopAnalysis = false

let redCounter = Date.now() + 1000
let greenCounter = Date.now() + 2000
let blueCounter = Date.now() + 3000
let gradientCounter = Date.now() + 4000

const analyzer = ref(null)
const trackName = ref(null)

async function play () {
  const { audioContext } = state.music

  if (audioContext.state === 'suspended') {
    await audioContext.resume()
    state.music.playing = true
  }

  if (!state.music.currentTrack) {
    await playRandomTrack()
  }
}

async function pause () {
  state.music.audioContext.suspend()
  state.music.playing = false
}

async function skip () {
  stopPlaying()
  await playRandomTrack()
}

function updateVolume () {
  state.music.gainNode.gain.value = state.options.volume / 100.0
}

function drawAnalyzer () {
  if (stopAnalysis) {
    return
  }

  const { audioAnalyzer } = state.music

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

  if (redCounter % 10 === 0) {
    updateTextShadow()
  }
}

function updateTextShadow () {
  let red = Math.round(Math.max(64, Math.abs(Math.cos(redCounter / 409)) * 255))
  let green = Math.round(Math.max(64, Math.abs(Math.cos(greenCounter / 609)) * 255))
  let blue = Math.round(Math.max(64, Math.abs(Math.cos(blueCounter / 709)) * 255))
  let shadowSize = Math.round(Math.max(5, Math.abs(Math.cos(gradientCounter / 1023)) * 15))
  trackName.value.style.textShadow = `0 0 ${shadowSize}px rgb(${red}, ${green}, ${blue})`

  trackName.value.style.color = `rgb(${Math.max(220, green)}, ${Math.max(220, blue)}, ${Math.max(220, red)})`
}

onMounted(() => {
  stopAnalysis = false
  analyzerData = new Uint8Array(state.music.audioAnalyzer.frequencyBinCount)
  drawAnalyzer()
  updateTextShadow()
})

onBeforeUnmount(() => {
  stopAnalysis = true
})

</script>
<style lang="less" scoped>
.music-player {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  position: relative;
  z-index: 2;
  min-width: 190px;
  min-height: 78px;

  .track-controls {
    display: flex;
    flex-direction: row;
    z-index: 2;

    .volume {
      margin-right: 10px;
      margin-top: 10px;
      .slider {
        width: 85px;
      }
    }

    .play-pause, .skip-track {
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.24);
      font-size: 34px;
      margin-right: 5px;
      line-height: 34px;
      width: 34px;
      height: 34px;
      background-color: #101014;
      color: #fff;
      transition: all 0.3s;
      user-select: none;
      &:hover {
        border: 1px solid #0cc6c6;
      }
    }
  }

  .track-info {
    width: 100%;
    text-align: center;
    .track-name {
      margin-top: 5px;
      margin-right: 5px;
      margin-left: 5px;
      position: relative;
      z-index: 2;
    }
    canvas {
      position: absolute;
      top: 40px;
      right: 5px;
      z-index: 1;
    }
  }
}
</style>