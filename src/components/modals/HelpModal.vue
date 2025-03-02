<template>
  <NModal
    v-model:show="state.modals.helpModal"
    title="Help"
    @after-enter="onOpenModal"
    @after-leave="onCloseModal"
    class="help-modal"
    :auto-focus="false"
    :close-on-esc="false"
  >
    <div>
      <div class="modal-body">
        <p class="close" @click="onCloseModal()">
          <NIcon size="24">
            <CloseOutlined />
          </NIcon>
        </p>
        <p :class="getToggleMiniOutputClass()" @click="toggleMiniOutput()">
          <NIcon size="24">
            <KeyboardOutlined />
          </NIcon>
        </p>

        <NTabs
          v-if="state.help.topicsLoaded"
          v-model:value="currentPane"
          :class="getTabsClass()"
          :closable="true"
          type="card"
          ref="tabs"
          @close="handleCloseTab"
        >

          <NTabPane name="topics" tab="Topics" :closable="false">
            <div :class="getScrollContainerClass()">
              <div class="search-container">
                <NInput placeholder="Filter Topics" v-model:value="topicsFilter"></NInput>

                <div class="search-help">
                  <NInputGroup>
                    <NInput placeholder="Search Help" v-model:value="searchFilter" @keydown.enter="searchHelp"></NInput>
                    <NButton @click="searchHelp">Search</NButton>
                  </NInputGroup>
                </div>

              </div>

              <div class="search-results" v-if="state.help.searchResults.length > 0">
                <div class="search-result" v-for="result in state.help.searchResults" :key="result.id" @click="loadHelpEntry(result.id)">
                  <div class="result-id">
                    {{ result.id }}
                  </div>
                  <div class="result-fragment" v-html-safe="renderFragment(result.fragment)"></div>
                </div>
              </div>

              <h1 v-if="filterTopics(state.help.topics.newbie)">New Players</h1>
              <div v-if="filterTopics(state.help.topics.newbie)" class="help-topics">
                <div v-for="topic in filterTopics(state.help.topics.newbie)" @click="loadHelpEntry(topic)" :key="topic">{{ topic }}</div>
              </div>

              <h1 v-if="filterTopics(state.help.topics.general).length > 0">General</h1>
              <div v-if="filterTopics(state.help.topics.general).length > 0" class="help-topics">
                <div v-for="topic in filterTopics(state.help.topics.general)" @click="loadHelpEntry(topic)" :key="topic">{{ topic }}</div>
              </div>

              <h1 v-if="filterTopics(state.help.topics.skills).length > 0">Skills</h1>
              <div v-if="filterTopics(state.help.topics.skills).length > 0" class="help-topics">
                <div v-for="topic in filterTopics(state.help.topics.skills)" @click="loadHelpEntry(topic)" :key="topic">{{ topic }}</div>
              </div>

              <h1 v-if="filterTopics(state.help.topics.commands).length > 0">Commands</h1>
              <div class="help-topics" v-if="filterTopics(state.help.topics.commands).length > 0">
                <div v-for="topic in filterTopics(state.help.topics.commands)" @click="loadHelpEntry(topic)" :key="topic">{{ topic }}</div>
              </div>
            </div>
          </NTabPane>

          <NTabPane v-for="{ entry, content } in state.help.openEntries" :key="entry" :name="entry">
            <template #tab>
              <div @click.middle="() => handleCloseTab(entry)">{{ stripAnsi(content.title || entry) }}</div>
            </template>
            <template #default>
              <div :class="getScrollContainerClass()">
                <h1 v-html-safe="getTitle(content)"></h1>

                <div class="help-section"
                  v-show="content.body && !content.skill"
                  v-for="key in Object.keys(content.body)" :key="key"
                >
                  <h3 class="bold-green" v-if="key">{{ key }}</h3>
                  <div class="help-text related"
                    v-if="key == 'Related' && content.body[key].length"
                    v-html-safe="addLinks(ansiToHtml(ANSI.reset + content.body[key]))"
                    @click="lineClickRelated"
                  ></div>
                  <div class="help-text"
                    v-else
                    v-html-safe="addLinks(ansiToHtml(ANSI.reset + content.body[key]))"
                    @click="lineClick"
                  ></div>
                </div>

                <div class="help-section"
                  v-if="content.desc"
                >
                  <div class="help-text"
                    v-html-safe="ansiToHtml(ANSI.reset + content.desc)"
                  ></div>
                </div>

                <div class="help-section"
                  v-if="content.rank2"
                >
                  <h3 class="bold-yellow">Rank 2</h3>
                  <div class="help-text"
                    v-html-safe="ansiToHtml(ANSI.reset + content.rank2)"
                  ></div>
                </div>

                <div class="help-section"
                  v-if="content.rank3"
                >
                  <h3 class="bold-red">Rank 3</h3>
                  <div class="help-text"
                    v-html-safe="ansiToHtml(ANSI.reset + content.rank3)"
                  ></div>
                </div>

                <div class="help-section"
                  v-if="content.rank4"
                >
                  <h3 class="bold-magenta">Rank 4</h3>
                  <div class="help-text"
                    v-html-safe="ansiToHtml(ANSI.reset + content.rank4)"
                  ></div>
                </div>

                <div class="help-section"
                  v-if="content.rank5"
                >
                  <h3 class="bold-cyan">Rank 5</h3>
                  <div class="help-text"
                    v-html-safe="ansiToHtml(ANSI.reset + content.rank5)"
                  ></div>
                </div>

                <div class="help-section"
                  v-if="content.skillData"
                >
                  <h3>Skill Overview</h3>
                  <div class="skill-info" v-if="content.skillData.requirements">
                    <div class="label">Requirements</div>
                    <div class="value" v-html-safe="getRequirements(content.skillData)"></div>
                  </div>

                  <div class="skill-info" v-if="content.skillData.pointCost">
                    <div class="label">Point Cost</div>
                    <div class="value bold-white">{{ content.skillData.pointCost }}</div>
                  </div>

                  <div class="skill-info" v-if="content.skillData.castingTime">
                    <div class="label">Casting Time</div>
                    <div class="value">
                      <span class="bold-white">{{ content.skillData.castingTime }}</span> seconds
                    </div>
                  </div>

                  <div class="skill-info" v-if="content.skillData.cooldownTime">
                    <div class="label">Cooldown Time</div>
                    <div class="value">
                      <span class="bold-white">{{ content.skillData.cooldownTime }}</span> seconds
                    </div>
                  </div>

                  <div class="skill-info" v-if="content.skillData.recoveryTime">
                    <div class="label">Recovery</div>
                    <div class="value">
                      +<span class="bold-yellow">{{ renderNumber(content.skillData.recoveryTime / 10) }}</span> seconds</div>
                  </div>

                  <div class="skill-info" v-if="content.skillData.spell">
                    <div class="label">Multicast</div>
                    <div class="value">
                      <span class="bold-white">{{ content.skillData.multicastable ? 'Yes' : 'No' }}</span>
                    </div>
                  </div>

                  <div class="skill-info" v-if="content.skillData.priority">
                    <div class="label">Priority</div>
                    <div class="value bold-white">{{ content.skillData.priority }}</div>
                  </div>

                  <div class="skill-info" v-if="content.skillData.target">
                    <div class="label">Target</div>
                    <div class="value bold-white">{{ ucfirst(content.skillData.target) }}</div>
                  </div>

                  <div class="skill-info">
                    <div class="label">Type</div>
                    <div class="value" v-html-safe="getSkillType(content.skillData)"></div>
                  </div>

                  <div class="skill-info">
                    <div class="label">Cost</div>
                    <div class="value" v-html-safe="getCosts(content.skillData)"></div>
                  </div>

                </div>
              </div>
            </template>
          </NTabPane>

          <div v-if="miniOutputEnabled" class="mini-output" ref="mini-output" id="mini-output">
            <div v-for="(line, i) in getRecentOutput()" class="line" v-html-safe="line" :key="`line-${i}`"></div>
          </div>

          <KeyboardInput v-if="miniOutputEnabled" :focus-mode="'modal-input'" :active-modes="['modal', 'modal-input']"></KeyboardInput>
        </NTabs>
      </div>
    </div>
  </NModal>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { NModal, NTabs, NTabPane, NIcon, NInput, NButton, NInputGroup } from 'naive-ui'
import stripAnsi from 'strip-ansi'
import CloseOutlined from '@vicons/material/CloseOutlined'
import KeyboardOutlined from '@vicons/material/KeyboardOutlined'

import { state, prevMode } from '@/static/state'
import { ANSI } from '@/static/constants'
import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'
import KeyboardInput from '@/components/main-area/KeyboardInput.vue'

const { cmd, send } = useWebSocket()
const { ansiToHtml, renderNumber, ucfirst } = useHelpers()

const tabs = ref(null)
const currentPane = ref("topics")
const miniOutputEnabled = ref(false)
const panes = ref(['topics'])
const topicsFilter = ref('')
const searchFilter = ref('')

function filterTopics (topics) {
  if (!topicsFilter.value) {
    return topics
  }
  return topics.filter(topic => topic.toLowerCase().includes(topicsFilter.value.toLowerCase()))
}

function searchHelp () {
  if (!searchFilter.value) {
    state.help.searchResults = []
    return
  }

  send('help', { cmd: 'search', search: searchFilter.value })
}

function renderFragment (fragment) {
  return `...${fragment.replace(new RegExp(`${searchFilter.value}`, 'gi'), `<span class="bold-yellow">${searchFilter.value}</span>`)}...`
}

function getRequirements (skillData) {
  return skillData.requirements
    .map(req => `<span class="bold-white">${req.amount}</span> <span class="bold-magenta">${ucfirst(req.stat)}</span>`)
    .join(', ')
}

function getSkillType (skillData) {
  return skillData.type
    .map(type => `<span class="bold-white">${ucfirst(type)}</span>`)
    .join(', ')
}

function getCosts (skillData) {
  let costs = []
  if (skillData.staminaCost) {
    costs.push(`<span class="bold-yellow">${skillData.staminaCost}</span> stamina`)
  }
  if (skillData.energyCost) {
    costs.push(`<span class="bold-cyan">${skillData.energyCost}</span> energy`)
  }
  if (skillData.rageCost) {
    costs.push(`<span class="bold-red">${skillData.rageCost}</span> rage points`)
  }
  if (skillData.comboCost) {
    costs.push(`<span class="bold-yellow">${skillData.comboCost}</span> combo points`)
  }
  return costs.join(', ')
}

function addLinks (text) {
  return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
}

function loadHelpTopics () {
  if (!state.help.topicsLoaded) {
    send('help', { cmd: 'topics' })
  }
}

function loadHelpEntry (entry) {
  send('help', { cmd: 'entry', entry })
}

function getTitle (content) {
  if (content.title) {
    return ansiToHtml(content.title)
  }

  if (content.skill) {
    if (content.skillData.spell) {
      return `<span class="bold-cyan">Spell:</span> <span class="bold-white">${content.skill}</span>`
    } else {
      return `<span class="bold-yellow">Skill:</span> <span class="bold-white">${content.skill}</span>`
    }
  }
}

function lineClick (ev) {
  const el = ev.srcElement
  if (el.style['text-decoration-line']) {
    cmd(el.innerText)
  }
}

function lineClickRelated (ev) {
  cmd(`help ${ev.srcElement.innerText}`)
}

function handleCloseTab (name) {
  if (name == 'topics') {
    return
  }
  const currentIndex = state.help.openEntries.findIndex(e => e.entry == name)
  state.help.openEntries = state.help.openEntries.filter(e => e.entry !== name)
  panes.value = panes.value.filter(p => p !== name)

  if (currentIndex && state.help.openEntries.length) {
    state.gamepadHelpTab = state.help.openEntries[currentIndex - 1].entry
  } else {
    state.gamepadHelpTab = 'topics'
  }
}

function getRecentOutput () {
  return state.output.slice(-100)
}

function getTabsClass () {
  return {
    'help-modal-tabs': true,
    'mini-output-hidden': !miniOutputEnabled.value
  }
}

function getScrollContainerClass () {
  return {
    'scroll-container': true,
    'mini-output-enabled': miniOutputEnabled.value
  }
}

function onCloseModal () {
  if (!state.modals.helpModal) {
    return
  }
  state.modals.helpModal = false
  state.gamepadHelpTab = currentPane.value
  if (state.mode == 'modal-input') {
    prevMode()
  }
  prevMode()
}

function onOpenModal () {
  currentPane.value = state.gamepadHelpTab || "topics"
  scrollDown()
}

function getToggleMiniOutputClass () {
  return {
    'toggle-mini-output': true,
    'active': miniOutputEnabled.value
  }
}

function toggleMiniOutput () {
  miniOutputEnabled.value = !miniOutputEnabled.value
  nextTick(() => {
    scrollDown()
  })
}

function prevModalTab () {
  let index = panes.value.indexOf(currentPane.value)
  if (index == 0) {
    currentPane.value = panes.value[panes.value.length - 1]
  } else {
    currentPane.value = panes.value[index - 1]
  }
  state.gamepadHelpTab = currentPane.value
  nextTick(() => tabs.value?.syncBarPosition())
}

function nextModalTab () {
  let index = panes.value.indexOf(currentPane.value)
  if (index == panes.value.length - 1) {
    currentPane.value = panes.value[0]
  } else {
    currentPane.value = panes.value[index + 1]
  }
  state.gamepadHelpTab = currentPane.value
  nextTick(() => tabs.value?.syncBarPosition())
}

function onOutputChanged () {
  let el = document.getElementById('mini-output')
  if (!el) {
    return
  }

  let { scrollTop, scrollHeight, offsetHeight } = el

  let scrollPosition = Math.round(scrollTop + offsetHeight + 5)
  let scrolledBack = scrollPosition <= scrollHeight

  if (scrolledBack) {
    return
  }

  scrollDown()
}

function scrollDown () {
  nextTick(() => {
    let output = document.getElementById('mini-output')
    if (output) {
      output.scrollTop = output.scrollHeight
    }
  })
}

let watchers = []
onMounted(() => {
  loadHelpTopics()

  state.inputEmitter.on('closeModal', onCloseModal)
  state.inputEmitter.on('prevModalTab', prevModalTab)
  state.inputEmitter.on('nextModalTab', nextModalTab)

  currentPane.value = state.gamepadHelpTab || "topics"

  watchers.push(
    watch(state.output, () => onOutputChanged())
  )

  watchers.push(
    watch(() => state.gamepadHelpTab, () => {
      const tab = state.gamepadHelpTab
      currentPane.value = tab || "topics"
      if (!panes.value.includes(tab)) {
        panes.value.push(tab)
      }
    }))
})

onBeforeUnmount(() => {
  state.inputEmitter.off('closeModal', onCloseModal)
  state.inputEmitter.off('prevModalTab', prevModalTab)
  state.inputEmitter.off('nextModalTab', nextModalTab)

  watchers.forEach(w => w())
})

</script>

<style lang="less">
.help-modal {
  min-height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 1);
  padding-bottom: 0px;

  .modal-body {
    position: relative;
    padding: 10px;

    .help-modal-tabs {
      .n-tabs-tab {
        box-sizing: border-box;
        width: calc((100vw - 160px) / 14);
        min-width: 80px;
      }
      .n-tabs-tab[data-name="topics"] {
        width: auto;
        min-width: 80px;
      }
      .n-tabs-tab__label {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        div {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
      .n-tabs-nav {
        width: calc(100vw - 100px);
      }
      .n-tab-pane {
        .scroll-container {
          height: calc(100vh - 75px);
          overflow-y: scroll;
          max-width: 1200px;
          margin: 0 auto;

          &.mini-output-enabled {
            height: calc(100vh - 225px);
          }

          .search-container {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin-bottom: 10px;
            gap: 10px;
            .search-help {
              flex-basis: 100%;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              min-width: 300px;
            }
          }

          .search-results {
            display: flex;
            flex-direction: column;
            margin-bottom: 15px;
            .search-result {
              display: flex;
              flex-direction: row;
              background-color: #222;
              padding: 5px 0;
              gap: 10px;
              cursor: pointer;
              transition: all 0.2s;
              &:hover {
                background-color: #333;
              }
              .result-id {
                min-width: 150px;
                text-align: right;
              }
              .result-fragment {
              }
            }
          }

          .help-section {
            h3 {
              font-size: 20px;
            }
            .help-text {
              font-size: 18px;
              line-height: 20px;
              color: #ccc;
              margin-bottom: 15px;
              padding: 0 20px;
              white-space: pre-wrap;
              .ansi-bright-white-fg {
                cursor: pointer;
                &:hover {
                  color: #f9f1a5;
                }
              }
              &.related {
                span {
                  cursor: pointer;
                  text-decoration: underline;
                  &:hover {
                    color: #f9f1a5;
                  }
                }
              }
            }

            .skill-info {
              display: flex;
              flex-direction: row;
              font-size: 18px;
              padding: 0 20px;
              .label {
                width: 120px;
                padding-right: 15px;
                text-align: right;
              }
              .value {

              }
            }
          }

          .help-topics {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            grid-gap: 5px 10px;
            margin-bottom: 15px;
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            div {
              font-size: 16px;
              line-height: 20px;
              color: #fff;
              padding: 5px 10px;
              background-color: #111;
              border: 1px solid #333;
              cursor: pointer;
              transition: all 0.2s;
              &:hover {
                background-color: #63e2b7;
                color: #000;
              }
            }
          }
        }
      }
      height: calc(100vh - 170px);
      overflow-y: hidden;
      &.mini-output-hidden {
        height: calc(100vh - 20px);
      }
    }

    .mini-output {
      height: 100px;
      overflow-y: scroll;
      padding: 10px 10px 0 10px;
      margin-bottom: 10px;
      background-color: #000;
      border-top: 1px solid rgba(255, 255, 255, 0.09);
      .line {
        font-size: 16px;
        line-height: 14px;
        color: #fff;
        margin-bottom: 5px;
        white-space: pre-wrap;
        font-weight: normal !important;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .close {
      margin: 0;
      padding: 5px;
      background-color: #111;
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 32px;
      z-index: 2;
      line-height: 16px;
      cursor: pointer;
      &:hover {
        background-color: #e88080;
        color: #000;
      }
    }

    .toggle-mini-output {
      margin: 0 5px 0 0;
      padding: 5px;
      background-color: #111;
      position: absolute;
      top: 10px;
      right: 44px;
      font-size: 32px;
      z-index: 2;
      line-height: 16px;
      cursor: pointer;
      &:hover, &.active {
        background-color: #63e2b7;
        color: #000;
      }
    }

  }
}

@media screen and (max-width: 650px) {
  .help-modal {
    .modal-body {
      .help-modal-tabs {
        .n-tab-pane {
          .scroll-container {
            .search-container {
              flex-direction: column;
            }
          }
        }
      }
    }
  }
}
</style>