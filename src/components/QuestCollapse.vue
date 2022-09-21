<template>
  <n-collapse-item title="Quests">
    <div class="quests">
      <div v-if="quests().length == 0">You don't have any quests.</div>
      <div class="quest" v-for="quest in quests()" :key="quest.name">
        <div v-html="getQuestName(quest)"></div>
        <div v-html="getGivenBy(quest)"></div>
        <div v-if="quest.location" v-html="getLocation(quest)"></div>

        <div class="expand-link" v-if="quest.desc && !questsExpanded[quest.name]" @click="questsExpanded[quest.name] = true">More Info</div>
        <div v-if="quest.desc && questsExpanded[quest.name]" v-html="ansiSpan(quest.desc).replace(/@NAME/g, player().name)"></div>
        <div class="expand-link" v-if="quest.desc && questsExpanded[quest.name]" @click="questsExpanded[quest.name] = false">Less Info</div>

        <!-- <div style="white-space: pre">{{quest}}</div> -->
        <n-progress v-if="quest.amount" type="line" status="default" :percentage="quest.progress / quest.amount * 100">
          {{ quest.progress }} of {{ quest.amount }}
        </n-progress>
      </div>
    </div>
  </n-collapse-item>
</template>

<script setup>
import { ref } from 'vue'

import { ansiSpan } from 'ansi-to-span'

import { NProgress, NCollapseItem } from 'naive-ui'

import { state } from '@/composables/state'

const questsExpanded = ref({})

function quests () {
  return state.gameState.quests || []
}

function player () {
  return state.gameState.player || {}
}

function getQuestName (quest) {
  return ansiSpan(`L<span class="bold-white">${quest.level}</span> <span class="bold-yellow">${quest.name}</span>`)
}

function getGivenBy (quest) {
  return ansiSpan(`Given by <span class="bold-yellow">${quest.giver}</span>`)
}

function getLocation (quest) {
  return ansiSpan(`Go to <span class="bold-white">${quest.location.areaName}</span> at <span class="bold-magenta">${quest.location.x}</span>, <span class="bold-magenta">${quest.location.y}</span>`)
}

</script>

<style lang="less">
.quests {
  .quest {
    margin-bottom: 20px;

    .expand-link {
      color: #fff;
      text-decoration: underline;
      cursor: pointer;
    }
  }
  // white-space: pre
}
</style>
