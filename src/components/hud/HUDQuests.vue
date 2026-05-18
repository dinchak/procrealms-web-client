<template>
  <div ref="questsElement" class="hud-quests">
    <div v-if="getQuests().length == 0">
      No quests
    </div>

    <div class="quest" v-for="quest in getQuests()" :key="getQuestKey(quest)">
      <div class="row">
        <div
          :ref="el => setQuestElement(getQuestKey(quest), el)"
          :class="getQuestNameClass(quest)"
          role="button"
          tabindex="0"
          v-html-safe="getQuestName(quest)"
          @mouseenter="showQuestDetail(quest, $event)"
          @mouseleave="hideQuestDetail(quest)"
          @click.stop="toggleQuestDetail(quest, $event)"
          @keydown.enter.prevent="toggleQuestDetail(quest, $event)"
          @keydown.space.prevent="toggleQuestDetail(quest, $event)"
        ></div>

        <NProgress
          v-if="quest.amount"
          :status="quest.progress < quest.amount ? 'warning' : 'success'"
          type="line"
          :percentage="getProgressPercentage(quest)"
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

    <Teleport to="body">
      <div
        class="hud-popup-panel"
        v-if="getActiveQuest()"
        :style="getFixedPanelStyle()"
      >
        <QuestDetails
          :quest="getActiveQuest()"
          @close="closePinnedQuestDetail"
        ></QuestDetails>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { NProgress } from 'naive-ui'

import QuestDetails from '@/components/hud/QuestDetails.vue'

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { ANSI } from '@/static/constants'
import { useHudPopup } from '@/composables/hud_popup'

const { ansiToHtml } = useHelpers()

const questsElement = ref(null)
const {
  pinnedKey: pinnedQuestKey,
  getActiveKey: getActiveQuestKey,
  getFixedPanelStyle,
  setPopupElement: setQuestElement,
  showPopup,
  hidePopup,
  togglePopup,
  closePinned: closePinnedQuestDetail
} = useHudPopup(questsElement, () => getQuests().map(quest => getQuestKey(quest)))

function getQuests () {
  return state.gameState.quests || []
}

function getQuestKey (quest) {
  return quest.name
}

function getQuestName (quest) {
  return `L<span class="bold-white">${quest.level}</span> <span class="bold-yellow">${ansiToHtml(ANSI.reset + quest.name)}</span>`
}

function getQuestNameClass (quest) {
  return {
    name: true,
    selectable: true,
    'popup-open': getActiveQuestKey() === getQuestKey(quest),
    pinned: pinnedQuestKey.value === getQuestKey(quest)
  }
}

function getProgressPercentage (quest) {
  if (!quest.amount) {
    return 0
  }

  return Math.min(100, Math.max(0, quest.progress / quest.amount * 100))
}

function getActiveQuest () {
  const activeKey = getActiveQuestKey()
  return getQuests().find(quest => getQuestKey(quest) === activeKey)
}

function showQuestDetail (quest, event) {
  showPopup(getQuestKey(quest), event)
}

function hideQuestDetail (quest) {
  hidePopup(getQuestKey(quest))
}

function toggleQuestDetail (quest, event) {
  togglePopup(getQuestKey(quest), event)
}
</script>

<style lang="less" scoped>
.hud-quests {
  height: 110px;
  font-size: 0.8rem;
  flex-basis: 200px;
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
      flex-direction: column;
      justify-content: space-between;
      margin-bottom: 5px;

      .name {
        align-self: flex-start;
        cursor: pointer;
        display: block;
        max-width: 100%;
        min-height: 1.2em;
        outline: none;
        overflow: hidden;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:hover,
        &:focus-visible,
        &.popup-open {
          text-decoration: underline;
        }

        &.pinned {
          background: rgba(41, 185, 55, 0.2);
        }
      }

      .n-progress {
        width: 125px;

        .progress-label {
          display: block;
          width: 75px;
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
    }
  }
}

</style>
