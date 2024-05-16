<template>
  <div :class="getScrollContainerClass()">
    <NGrid class="quests" cols="1 800:2">
      <NGi v-if="quests().length == 0">
        <div>
          You don't have any quests.
        </div>
      </NGi>

      <NGi class="quest" v-for="quest in quests()" :key="quest.name">
        <div class="name" v-html-safe="getQuestName(quest)"></div>
        <div class="giver" v-html-safe="getGivenBy(quest)"></div>
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

        <div class="objective" v-html-safe="`Objective: ` + ansiToHtml(quest.objective)"></div>

        <NButton ghost size="tiny" class="selectable"
          v-if="quest.desc && !questsExpanded[quest.name]"
          @click="questsExpanded[quest.name] = true"
        >
          More Info
        </NButton>
        
        <div class="desc" v-if="quest.desc && questsExpanded[quest.name]" v-html-safe="ansiToHtml(quest.desc)"></div>

        <NButton ghost size="tiny" class="selectable"
          v-if="quest.desc && questsExpanded[quest.name] && questsExpanded[quest.name]"
          @click="questsExpanded[quest.name] = false"
        >
          Less Info
        </NButton>

      </NGi>
    </NGrid>
  </div>
</template>

<script setup>
import { ref, defineProps, toRefs } from 'vue'
import { NGrid, NGi, NProgress, NButton } from 'naive-ui'
import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'

const props = defineProps(['miniOutputEnabled'])
const { miniOutputEnabled } = toRefs(props)

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

function getScrollContainerClass () {
  return {
    'scroll-container': true,
    'mini-output-enabled': miniOutputEnabled.value
  }
}
</script>
<style lang="less" scoped>
.scroll-container {
  height: calc(100vh - 75px);
  overflow-y: scroll;
  max-width: 1200px;
  margin: 0 auto;

  &.mini-output-enabled {
    height: calc(100vh - 225px);
  }
  .quests {
    .quest {
      padding: 5px 0;
      margin: 10px 5px;
      .name {
        font-size: 20px;
      }
      .objective {
        white-space: pre-wrap;
        margin-bottom: 5px;
      }
      .desc {
        white-space: pre-wrap;
        margin-top: 10px;
      }
      .n-progress {
        max-width: 300px;
      }
    }
  }
}
</style>