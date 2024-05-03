<template>
  <div class="quests" :style="{ height: getHUDHeight() }">
    <div v-if="state.gameState.quests.length == 0">
      No quests
    </div>

    <div class="quest" v-for="quest in state.gameState.quests" :key="quest.name">

      <div class="row">
        <div class="name" v-html-safe="getQuestName(quest)"></div>
        
        <div class="objectives" v-if="questHasObjectives(quest)">
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
import { state, getHUDHeight } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'
import { ANSI } from '@/composables/constants'

const { ansiToHtml } = useHelpers()

function getQuestName (quest) {
  return `L<span class="bold-white">${quest.level}</span> <span class="bold-yellow">${ansiToHtml(ANSI.reset + quest.name)}</span>`
}

function getQuestObjectives (quest) {
  let objectives = []

  if (quest.objective && quest.type != 'generated') {
    objectives.push(ansiToHtml(`${ANSI.reset}${quest.objective}`))
  }

  if (quest.extra && !quest.activity.startsWith('kill')) {
    objectives.push(ansiToHtml(`${ANSI.reset}${quest.extra}`))
  }

  return objectives
}

function questHasObjectives (quest) {
  return (quest.objective && quest.type != 'generated') ||
    (quest.extra && !quest.activity.startsWith('kill'))
}
</script>

<style lang="less" scoped>
.quests {
  overflow-y: scroll;
  min-width: 600px;
  width: 100%;
  .quest {
    display: flex;
    flex-direction: column;
    margin: 0px 0;
    padding: 0px 0;
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
      margin-bottom: 5px;
      .name {
        margin-right: 5px;
        min-width: 150px;
      }
      .n-progress {
        width: 125px;
        .progress-label {
          display: block;
          width: 75px;
          text-align: center;
        }

        .n-progress-content {
          .n-progress-graph {
            .n-progress-graph-line {
              .n-progress-graph-line-rail {
                width: 40px;
              }
            }
          }
        }

        .n-progress-custom-content {
          margin-left: 0;
        }
      }
      .objectives {
        display: flex;
        flex-direction: column;
        max-width: 300px;
        .objective {
          font-size: 0.8rem;
          line-height: 0.9;
        }
      }
    }
    .objective {
      text-align: right;
    }
  }
}

</style>
