<template>
  <div class="stats">
    <n-progress class="quick-stats" type="line" status="success" :percentage="player().hp / player().maxHp * 100">
      <span class="bold-green">{{ player().hp }}</span> <span class="green">HP</span>
    </n-progress>
    <n-progress class="quick-stats" type="line" status="default" :percentage="player().energy / player().maxEnergy * 100">
      <span class="bold-cyan">{{ player().energy }}</span> <span class="cyan">EN</span>
    </n-progress>
    <n-progress class="quick-stats" type="line" status="warning" :percentage="player().stamina / player().maxStamina * 100">
      <span class="bold-yellow">{{ player().stamina }}</span> <span class="yellow">ST</span>
    </n-progress>
    <div class="flex">
      <n-progress class="quick-stats" type="line" status="warning" :percentage="player().combo / player().maxCombo * 100">
        <span class="bold-yellow">{{ player().combo }}</span> <span class="yellow">Combo</span>
      </n-progress>
      <n-progress class="quick-stats" type="line" status="danger" :percentage="player().rage / player().maxRage * 100">
        <span class="bold-red">{{ player().rage }}</span> <span class="red">Rage</span>
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
  padding: 10px;
  display: flex;
  flex-direction: column;
  .quick-stats {
    // margin-right: 10px;
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
</style>
