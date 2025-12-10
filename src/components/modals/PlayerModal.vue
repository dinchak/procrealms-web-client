<template>
  <GameModal
    v-model="state.modals.playerModal"
    title="Game Menu"
    modal-class="game-modal"
    modal-key="playerModal"
    :has-tab-navigation="true"
    @opened="onModalOpened"
    @closed="onModalClosed"
    @prev-tab="prevModalTab"
    @next-tab="nextModalTab"
  >
    <template #default="{ miniOutputEnabled }">
      <NTabs
        v-model:value="currentPane"
        :class="getPlayerModalTabsClass(miniOutputEnabled)"
        type="card"
        tab-style="min-width: 80px;"
        ref="tabs"
      >

        <NTabPane name="score" tab="Score">
          <ScorePane :mini-output-enabled="miniOutputEnabled"></ScorePane>
        </NTabPane>

        <NTabPane name="skills" tab="Skills">
          <SkillsPane :mini-output-enabled="miniOutputEnabled"></SkillsPane>
        </NTabPane>

        <NTabPane name="inventory" tab="Inventory">
          <InventoryPane :mini-output-enabled="miniOutputEnabled"></InventoryPane>
        </NTabPane>

        <NTabPane name="equipment" tab="Equipment">
          <EquipmentPane :mini-output-enabled="miniOutputEnabled"></EquipmentPane>
        </NTabPane>

        <NTabPane name="quests" tab="Quests">
          <QuestsPane :mini-output-enabled="miniOutputEnabled"></QuestsPane>
        </NTabPane>

        <NTabPane name="options" tab="Options">
          <OptionsPane :mini-output-enabled="miniOutputEnabled"></OptionsPane>
        </NTabPane>

        <NTabPane name="mappings" tab="Mappings">
          <InputMappingsPane :mini-output-enabled="miniOutputEnabled"></InputMappingsPane>
        </NTabPane>

      </NTabs>
    </template>
  </GameModal>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { NTabs, NTabPane } from 'naive-ui'
import { state } from '@/static/state'

import GameModal from '@/components/modals/GameModal.vue'
import EquipmentPane from '@/components/game-modal/EquipmentPane.vue'
import InputMappingsPane from '@/components/game-modal/InputMappingsPane.vue'
import InventoryPane from '@/components/game-modal/InventoryPane.vue'
import OptionsPane from '@/components/game-modal/OptionsPane.vue'
import QuestsPane from '@/components/game-modal/QuestsPane.vue'
import ScorePane from '@/components/game-modal/ScorePane.vue'
import SkillsPane from '@/components/game-modal/SkillsPane.vue'

const tabs = ref(null)
const currentPane = ref("score")
const panes = ref(['score', 'skills', 'inventory', 'equipment', 'quests', 'options', 'mappings'])

let watchers = []

function onModalOpened () {
  if (state.gamepadTab && panes.value.includes(state.gamepadTab)) {
    currentPane.value = state.gamepadTab
  } else {
    currentPane.value = "score"
  }

  watchers.push(watch(() => state.gamepadTab, () => {
    currentPane.value = state.gamepadTab
  }))
}

function onModalClosed () {
  state.gamepadTab = currentPane.value
  watchers.forEach(unwatch => unwatch())
  watchers = []

  state.inventoryOutput = {}
}

function prevModalTab () {
  let index = panes.value.indexOf(currentPane.value)
  if (index == 0) {
    currentPane.value = panes.value[panes.value.length - 1]
  } else {
    currentPane.value = panes.value[index - 1]
  }
  state.gamepadTab = currentPane.value
  nextTick(() => tabs.value?.syncBarPosition())
}

function nextModalTab () {
  let index = panes.value.indexOf(currentPane.value)
  if (index == panes.value.length - 1) {
    currentPane.value = panes.value[0]
  } else {
    currentPane.value = panes.value[index + 1]
  }
  state.gamepadTab = currentPane.value
  nextTick(() => tabs.value?.syncBarPosition())
}

function getPlayerModalTabsClass (miniOutputEnabled) {
  return {
    'game-modal-tabs': true,
    'mini-output-hidden': !miniOutputEnabled
  }
}

</script>

<style lang="less">
.game-modal {
  .modal-body {
    .game-modal-tabs {
      .n-tabs-nav {
        width: calc(100vw - 150px);
      }
      height: calc(100vh - 270px);
      overflow-y: hidden;
      &.mini-output-hidden {
        height: calc(100vh - 20px);
      }
    }
  }
}
</style>