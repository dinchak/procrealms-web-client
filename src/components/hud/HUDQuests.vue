<template>
  <div class="quests">
    <div class="quest" v-for="quest in state.gameState.quests" :key="quest.name">

      <div class="row">
        <div :class="getQuestNameClass(quest)" v-html-safe="getQuestName(quest)"></div>
        
        <div :class="getQuestObjectivesClass(quest)" v-if="questHasObjectives(quest)">
          <div class="objective" v-for="objective in getQuestObjectives(quest)" v-html-safe="objective" :key="objective"></div>
        </div>

        <NProgress
          v-if="quest.amount" 
          :status="quest.progress < quest.amount ? 'warning' : 'success'"
          type="line"
          :percentage="quest.progress / quest.amount * 100"
          :height="4"
          :border-radius="0"
        >
          <span class="progress-label" v-if="quest.progress < quest.amount">
            {{ quest.progress }} of {{ quest.amount }}
          </span>
          <span class="progress-label bold-yellow" v-if="quest.progress >= quest.amount">
            Done
          </span>
        </NProgress>

      </div>
    </div>
  </div>
</template>
<script setup>
import { NProgress } from 'naive-ui'
import { state } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml, ansi } = useHelpers()

function getQuestNameClass (quest) {
  if (questHasObjectives(quest) && questHasProgress(quest)) {
    return 'name'
  }

  return 'name wide'
}

function getQuestName (quest) {
  return `L<span class="bold-white">${quest.level}</span> <span class="bold-yellow">${ansiToHtml(ansi.reset + quest.name)}</span>`
}

function getQuestObjectivesClass (quest) {
  if (questHasObjectives(quest) && questHasProgress(quest)) {
    return 'objectives'
  }

  return 'objectives wide'
}

function getQuestObjectives (quest) {
  let objectives = []

  if (quest.objective && quest.type != 'generated') {
    objectives.push(ansiToHtml(`${ansi.reset}${quest.objective}`))
  }

  if (quest.extra && !quest.activity.startsWith('kill')) {
    objectives.push(ansiToHtml(`${ansi.reset}${quest.extra}`))
  }

  return objectives
}

function questHasObjectives (quest) {
  return (quest.objective && quest.type != 'generated') ||
    (quest.extra && !quest.activity.startsWith('kill'))
}

function questHasProgress (quest) {
  return quest.progress || quest.amount
}
</script>

<style lang="less" scoped>
.quests {
  height: 130px;
  overflow-y: scroll;
  width: 800px;
  .quest {
    display: flex;
    flex-direction: column;
    margin: 2px 0;
    border-bottom: 1px solid #333;
    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: 0;
    }
    .row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
      .name {
        font-size: 18px;
        line-height: 16px;
        margin-right: 5px;
        min-width: 150px;
      }
      .n-progress {
        width: 150px;
        font-size: 16px;
        margin-left: 5px;
        .progress-label {
          font-size: 16px;
          display: block;
          width: 75px;
          text-align: center;
        }
      }
      .objectives {
        display: flex;
        flex-direction: column;
        &.wide {
          width: 100%;
        }
        .objective {
          font-size: 16px;
          line-height: 16px;
        }
      }
    }
    .objective {
      font-size: 16px;
      line-height: 16px;
      text-align: right;
    }
  }
}

</style>
