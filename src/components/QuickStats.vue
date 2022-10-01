<template>
  <div class="stats">
    <n-progress class="quick-stats" type="line" status="success" :percentage="player().hp / player().maxHp * 100">
      <div class="bar-label">
        <span class="bold-green">{{ player().hp }}</span> <span class="green">HP</span>
      </div>
    </n-progress>
    <n-progress class="quick-stats" type="line" status="default" :percentage="player().energy / player().maxEnergy * 100">
      <div class="bar-label">
        <span class="bold-cyan">{{ player().energy }}</span> <span class="cyan">EN</span>
      </div>
    </n-progress>
    <n-progress class="quick-stats" type="line" status="warning" :percentage="player().stamina / player().maxStamina * 100">
      <div class="bar-label">
        <span class="bold-yellow">{{ player().stamina }}</span> <span class="yellow">ST</span>
      </div>
    </n-progress>
    <n-progress class="quick-stats" type="line" status="success" :percentage="player().food / player().maxFood * 100">
      <div class="bar-label">
        <span class="bold-green">{{ player().food }}</span> <span class="green">FD</span>
      </div>
    </n-progress>
    <div class="flex">
      <n-progress class="quick-stats" type="line" status="warning" :percentage="player().combo / player().maxCombo * 100">
        <div class="half-bar-label">
          <span class="bold-yellow">{{ player().combo }}</span> <span class="yellow">CB</span>
        </div>
      </n-progress>
      <n-progress class="quick-stats" type="line" status="danger" :percentage="player().rage / player().maxRage * 100">
        <div class="half-bar-label">
          <span class="bold-red">{{ player().rage }}</span> <span class="red">RG</span>
        </div>
      </n-progress>
    </div>
  </div>
</template>

<script setup>
import { NProgress } from 'naive-ui'
import { state } from '@/composables/state'

function player () {
  return state.gameState.player || {}
}
</script>

<style lang="less">
.stats {
  padding: 2px 5px;
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
  .quick-stats {
    height: 12px;
    // margin-right: 10px;
    // width: 190px;
  }
  .flex {
    display: flex;
    flex-direction: row;
    line-height: 1.1;
    .quick-stats {
      margin-right: 10px;
      &:last-child {
        margin-right: 0px;
      }
    }
  }
}

.bar-label {
  width: 50px;
  display: inherit;
  text-align: right;
}

.half-bar-label {
  width: 50px;
  display: inherit;
  text-align: right;
}
</style>
