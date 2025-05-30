<template>
  <div class="player-header">
    <div class="name-row">
      <div class="bold-yellow">{{ player().name }}</div>
      <div class="bold-magenta">{{ player().class }}</div>
      <div><span style="color: #aaa">Level</span> <span class="bold-cyan">{{ player().level }}</span></div>
    </div>
    <NProgress v-if="player().level < 100" class="exp-row" type="line" status="default" :percentage="getExpPercentage()">
      {{ getTNL() }} TNL
    </NProgress>
  </div>
  <div class="player-stats">
    <NCollapse>
      <CharacterCollapse
        :character="state.gameState.player"
        :equipment="state.gameState.equipment"
        :is-player="true"
        tabindex="0"
      ></CharacterCollapse>

      <EffectsCollapse
        :effects="Object.values(state.gameState.affects)"
        :isPlayer="true"
        tabindex="0"
      ></EffectsCollapse>

      <InventoryCollapse
        :character="state.gameState.player"
        :inventory="state.gameState.inventory"
        :isPlayer="true"
        :affects="Object.values(state.gameState.affects)"
        tabindex="0"
      ></InventoryCollapse>

      <EquipmentCollapse
        tabindex="0"
      ></EquipmentCollapse>

      <QuestCollapse
        tabindex="0"
      ></QuestCollapse>

      <SkillsCollapse
        :character="state.gameState.player"
        :skills="Object.values(state.gameState.skills)"
        :isPlayer="true"
        tabindex="0"
      ></SkillsCollapse>

      <OptionsCollapse
        tabindex="0"
      ></OptionsCollapse>
    </NCollapse>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { NProgress, NCollapse } from 'naive-ui'
import CharacterCollapse from '@/components/mobile-menu/collapse-items/CharacterCollapse.vue'
import OptionsCollapse from '@/components/mobile-menu/collapse-items/OptionsCollapse.vue'
import QuestCollapse from '@/components/mobile-menu/collapse-items/QuestCollapse.vue'
import SkillsCollapse from '@/components/mobile-menu/collapse-items/SkillsCollapse.vue'
import EffectsCollapse from '@/components/mobile-menu/collapse-items/EffectsCollapse.vue'
import InventoryCollapse from '@/components/mobile-menu/collapse-items/InventoryCollapse.vue'
import EquipmentCollapse from '@/components/mobile-menu/collapse-items/EquipmentCollapse.vue'
import { state } from '@/static/state'

function player () {
  return state.gameState.player || {}
}

function getTNL () {
  return player().xpForNextLevel - player().xp
}

function getExpPercentage () {
  return (player().xp - player().xpForCurrentLevel) / (player().xpForNextLevel - player().xpForCurrentLevel) * 100
}

function toggleCollapsibleMenu () {
  const collapse = document.activeElement
  if (collapse.classList.contains('n-collapse-item')) {
    const header = collapse.querySelector('.n-collapse-item__header-main')
    if (header) {
      header.click()
    }
  }
}

onMounted(() => {
  state.inputEmitter.on('toggleCollapsibleMenu', toggleCollapsibleMenu)
})

onBeforeUnmount(() => {
  state.inputEmitter.off('toggleCollapsibleMenu', toggleCollapsibleMenu)
})

</script>

<style scoped lang="less">
.spacer {
  width: 100%;
  height: 10px;
}

.n-collapse {
  .n-collapse-item {
    user-select: none;
    &:first-child {
      margin: var(--n-item-margin);
    }
  }
}

.player-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
}

.name-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.exp-row {
  width: 100%;
  margin-top: 5px;
}

.player-stats {
  padding-bottom: 10px;
  overflow-y: auto;
  flex-grow: 1;

  @media screen and (max-width: 650px) {
    overflow-y: visible;
  }
  @media screen and (min-width: 651px) and (max-height: 575px) {
    overflow-y: visible;
  }
  @media screen and (min-width: 651px) and (max-height: 745px) {
    .sidebar.map-area-visible & {
      overflow-y: visible;
    }
  }

  .stat-row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;

    .stat {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;

      .label {
        color: #aaa;
        width: 70px;
        text-align: right;
      }

      i {
        margin-left: 5px;
      }

      .white-label {
        width: 70px;
        color: #fff;
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
