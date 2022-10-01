<template>
  <div :class="getPlayerStatsClass()">
    <div class="name-row">
      <div class="bold-yellow">{{ player().name }}</div>
      <div class="bold-magenta">{{ player().class }}</div>
      <div><span style="color: #aaa">Level</span> <span class="bold-cyan">{{ player().level }}</span></div>
    </div>

    <n-progress class="exp-row" type="line" status="default" :percentage="getExpPercentage()">
      {{ getTNL() }} TNL
    </n-progress>

    <n-collapse>
      <CharacterCollapse></CharacterCollapse>
      <EffectsCollapse></EffectsCollapse>
      <InventoryCollapse></InventoryCollapse>
      <EquipmentCollapse></EquipmentCollapse>
      <QuestCollapse></QuestCollapse>
      <SkillsCollapse></SkillsCollapse>
      <OptionsCollapse></OptionsCollapse>
    </n-collapse>
  </div>
</template>

<script setup>
import { NProgress, NCollapse } from 'naive-ui'
import CharacterCollapse from '@/components/CharacterCollapse.vue'
import OptionsCollapse from '@/components/OptionsCollapse.vue'
import QuestCollapse from '@/components/QuestCollapse.vue'
import SkillsCollapse from '@/components/SkillsCollapse.vue'
import EffectsCollapse from '@/components/EffectsCollapse.vue'
import InventoryCollapse from '@/components/InventoryCollapse.vue'
import EquipmentCollapse from '@/components/EquipmentCollapse.vue'
import { state } from '@/composables/state'

function player () {
  return state.gameState.player || {}
}

function getTNL () {
  return player().xpForNextLevel - player().xp
}

function getExpPercentage () {
  return (player().xp - player().xpForCurrentLevel) / (player().xpForNextLevel - player().xpForCurrentLevel) * 100
}

function getPlayerStatsClass () {
  if (state.options.fixedMap) {
    return 'player-stats fixed-map'
  }
  return 'player-stats'
}

</script>

<style lang="less">
.spacer {
  width: 100%;
  height: 10px;
}

.player-stats {
  padding-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;

  &.fixed-map {
    overflow-y: scroll;
  }

  .name-row {
    margin-top: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .exp-row {
    width: 100%;
    margin-bottom: 10px;
  }

  .stat-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .stat {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .label {
        color: #aaa;
        width: 70px;
        text-align: right;
      }
      .value {
        margin-left: 5px;
        width: 52px;
      }
    }
  }

  .combat-row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    .stat {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .label {
        color: #aaa;
        width: 45px;
        text-align: right;
      }
      .value {
        margin-left: 5px;
        width: 75px;
      }
    }
  }

}
</style>
