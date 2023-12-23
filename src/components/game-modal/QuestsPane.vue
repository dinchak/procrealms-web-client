<template>
  <NGrid class="quests" cols="1 800:2">
    <NGi v-if="quests().length == 0">You don't have any quests.</NGi>

    <NGi class="quest" v-for="quest in quests()" :key="quest.name">
      <div class="name" v-html-safe="getQuestName(quest)"></div>
      <div class="giver" v-html-safe="getGivenBy(quest)"></div>
      <div class="objective" v-html-safe="`Objective: ` + ansiToHtml(quest.objective)"></div>

      <NProgress
        v-if="quest.amount" 
        :status="quest.progress < quest.amount ? 'default' : 'success'"
        type="line"
        :percentage="quest.progress / quest.amount * 100"
        :border-radius="0"
      >
        <span v-if="quest.progress < quest.amount">
          {{ quest.progress }} of {{ quest.amount }}
        </span>
        <span class="bold-yellow" v-if="quest.progress >= quest.amount">
          Complete
        </span>
      </NProgress>
      <!-- <pre>{{ quest }}</pre> -->

      <div
        class="expand-link"
        v-if="quest.desc && !questsExpanded[quest.name]"
        @click="questsExpanded[quest.name] = true"
      >
        More Info
      </div>
      
      <div class="desc" v-if="quest.desc && questsExpanded[quest.name]" v-html-safe="ansiToHtml(quest.desc)"></div>

      <div
        class="expand-link"
        v-if="quest.desc && questsExpanded[quest.name] && questsExpanded[quest.name]"
        @click="questsExpanded[quest.name] = false"
      >
        Less Info
      </div>

    </NGi>
  </NGrid>
</template>

<script setup>
import { ref } from 'vue'
import { NGrid, NGi, NProgress } from 'naive-ui'
import { state } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml } = useHelpers()

const questsExpanded = ref({})

function quests () {
  return state.gameState.quests || []
}

function getQuestName (quest) {
  return `L<span class="bold-white">${quest.level}</span> <span class="bold-yellow">${ansiToHtml(quest.name)}</span>`
}

function getGivenBy (quest) {
  return `Given by <span class="bold-yellow">${quest.giver.name}</span>`
}

</script>
<style lang="less" scoped>
.quests {
  .quest {
    padding: 5px;
    .name {
      font-size: 20px;
      line-height: 20px;
      text-decoration: underline;
      text-decoration-color: #333;
    }
    .giver {
      font-size: 16px;
      line-height: 16px;
    }
    .objective {
      white-space: pre-wrap;
      font-size: 16px;
      line-height: 16px;
      margin-top: 10px;
    }
    .desc {
      white-space: pre-wrap;
      font-size: 16px;
      line-height: 16px;
      margin-top: 10px;
    }
    .expand-link {
      margin-top: 10px;
    }
    .n-progress {
      max-width: 300px;
    }
  }
}
</style>