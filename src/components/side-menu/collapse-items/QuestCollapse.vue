<template>
  <n-collapse-item title="Quests">
    <div class="quests">
      <div v-if="quests().length == 0">You don't have any quests.</div>
      <div class="quest" v-for="quest in quests()" :key="quest.name">
        <div v-html="getQuestName(quest)"></div>
        <div v-html="getGivenBy(quest)"></div>
        <div v-if="quest.location" v-html="getLocation(quest)"></div>

        <div
          class="expand-link"
          v-if="quest.desc && !questsExpanded[quest.name]"
          @click="questsExpanded[quest.name] = true"
        >
          More Info
        </div>
        <div
          v-if="quest.desc && questsExpanded[quest.name]"
          v-html="ansiToHtml(quest.desc).replace(/@NAME/g, player().name)"
        ></div>
        <div
          class="expand-link"
          v-if="quest.desc && questsExpanded[quest.name]"
          @click="questsExpanded[quest.name] = false"
        >
          Less Info
        </div>

        <n-progress
          v-if="quest.amount" 
          :status="quest.progress < quest.amount ? 'default' : 'success'"
          type="line"
          :percentage="quest.progress / quest.amount * 100"
        >
          <span v-if="quest.progress < quest.amount">
            {{ quest.progress }} of {{ quest.amount }}
          </span>
          <span class="bold-yellow" v-if="quest.progress >= quest.amount">
            Complete
          </span>
        </n-progress>
      </div>
    </div>
  </n-collapse-item>
</template>

<script setup>
import { ref } from 'vue'
import { NProgress, NCollapseItem } from 'naive-ui'
import { state } from '@/composables/state'
import { helpers } from '@/composables/helpers'

const { ansiToHtml } = helpers()

const questsExpanded = ref({})

function quests () {
  return state.gameState.quests || []
}

function player () {
  return state.gameState.player || {}
}

function getQuestName (quest) {
  return `L<span class="bold-white">${quest.level}</span> <span class="bold-yellow">${quest.name}</span>`
}

function getGivenBy (quest) {
  return `Given by <span class="bold-yellow">${quest.giver}</span>`
}

function getLocation (quest) {
  return `Go to <span class="bold-white">${quest.location.areaName}</span> at <span class="bold-magenta">${quest.location.x}</span>, <span class="bold-magenta">${quest.location.y}</span>`
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
}
</style>
