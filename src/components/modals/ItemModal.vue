<template>
  <Teleport to="body">
    <n-card v-if="isVisible" :class="getClass()">
      <p class="close" v-on:click="closeModal()">x</p>
      <n-tabs type="line" animated size="large" :class="props.isPlayer + '-modal'" @update:value="handleUpdateValue">
        <n-tab-pane name="actions" tab="Actions" class="actions-pane">
          <h3 v-html="props.item.amount + 'x ' + ansiToHtml(props.item.colorName)"></h3>

          <div class="actions">
            <n-button v-for="action in actions"
                      size="medium"
                      ghost
                      :type="getButtonType(action)"
                      :disabled="action === 'drink' && isDrinkDisabled"
                      @click="clickedAction(action)"
                      :key="action"
                      class="action">
              <!-- The action.split is a hack to manage fish bait and fish hook while displaying Hook and Bait to the
              user. There's a better way of doing this, by adding a display attribute to the action objects within
              action_mapper.js, I will be updating that in a future PR -->
              {{action.split(" ").length > 1 ? action.split(" ")[1] : action}}
            </n-button>
          </div>

          <n-collapse v-if="props.menu === 'inventory'" class="additional-collapse">
            <n-collapse-item title="Additional actions">
              <div class="additional-actions">
                <n-button ghost type="warning" @click="giveAll()" v-if="state.gameState.mercEid !== -1">
                  Give all
                </n-button>
                <div class="input-button" v-if="state.gameState.mercEid !== -1">
                  <n-button ghost type="warning" @click="giveItems()">
                    Give
                  </n-button>
                  <n-input-number class="input-field" button-placement="both" v-model:value="giveValue" min=1 :max="item.amount" />
                </div>
                <n-button ghost type="error" @click="dropAll()">
                  Drop all
                </n-button>
                <div class="input-button">
                  <n-button ghost type="error" @click="dropItems()">
                    Drop
                  </n-button>
                  <n-input-number class="input-field" button-placement="both" v-model:value="dropValue" min=1 :max="item.amount" />
                </div>
              </div>
            </n-collapse-item>
          </n-collapse>
        </n-tab-pane>
        <n-tab-pane name="look" tab="Look">
          <div class="item-desc" v-html="ansiToHtml(getLook())"></div>
        </n-tab-pane>
        <n-tab-pane name="examine" tab="Examine">
          <div class="examine" v-html="ansiToHtml(rawExamine())"></div>
        </n-tab-pane>
        <n-tab-pane name="compare" tab="Compare" v-if="props.menu === 'inventory' && (props.item.type === 'weapon' || props.item.type === 'armor')">
          <div class="examine" v-html="ansiToHtml(rawCompare())"></div>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </Teleport>
</template>

<script setup>
import { NCard, NTabs, NTabPane, NButton, NCollapse, NCollapseItem, NInputNumber } from 'naive-ui'
import {defineProps, ref, watch} from 'vue'
import { helpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { state, addLine } from '@/composables/state'
import { command_ids } from '@/composables/constants/command_ids'

const { ansiToHtml, getActions } = helpers()
const { cmd } = useWebSocket()
const props = defineProps(['isPlayer', 'item', 'visible', 'menu', 'charEId', 'name', 'affects'])

const isVisible = ref(false)
const isDrinkDisabled = ref(false)
const actions = ref(getActions(props.item, props.isPlayer))
const dropValue = ref(1)
const giveValue = ref(1)
const activeTab = ref('')

const otherChar = props.isPlayer ? state.gameState.mercEid : state.gameState.player.eid
const mercOrder = props.isPlayer ? "" : `order eid:${props.charEId.toString()} `

// Watchers

watch(() => props.item, () => {
  if (isVisible.value) {
    const examineCommandCacheKey = command_ids.EXAMINE + props.item.iid.toString()
    cmd(`${mercOrder}examine iid:${props.item.iid}`, examineCommandCacheKey)

    const compareCommandCacheKey = command_ids.COMPARE + props.item.iid.toString()
    cmd(`${mercOrder}compare iid:${props.item.iid}`, compareCommandCacheKey)

    setActions()

    // Checks below are to switch the tab from Compare to active when switching to an item with no Compare tab.
    // NaiveUI doesn't have protection for that, so you just end up with an empty tab otherwise
    if (activeTab.value === 'compare') {
      if (props.item.type === 'weapon' || props.item.type === 'armor') {
        return
      }

      // There is a VueJS way of doing this, but it implies writing more code, and it makes it overcomplicated.
      // A doc selector will be good enough if it's just one per file :)
      document.getElementsByClassName(`${props.isPlayer}-modal`)[0].querySelector('[data-name="actions"]').click()
    }
  }
  dropValue.value = 1
})

watch(() => props.visible, () => {
  isVisible.value = true;
  setActions()
})

watch(() => props.menu, () => {
  isVisible.value ? setActions() : null
})

watch(() => props.affects, () => {
  isDrinkDisabled.value = !!(props.item.type === 'consumable' &&
      props.item.subtype === 'potion' &&
      props.affects.find(af => af.name === props.item.name));
})

watch(() => state.modals.inventoryModals.playerItemModal, () => {
  if (props.isPlayer && props.menu !== state.modals.inventoryModals.playerItemModal) {
    closeModal()
  }
})

watch(() => state.modals.inventoryModals.mercItemModal, () => {
  if (!props.isPlayer && props.menu !== state.modals.inventoryModals.mercItemModal) {
    closeModal()
  }
})

watch(() => state.cache.commandCache[command_ids.MERC_ACTION], () => {
  if (state.cache.commandCache[command_ids.MERC_ACTION] && !state.cache.commandCache[command_ids.MERC_ACTION].includes("iid:")) {
    addLine(ansiToHtml(state.cache.commandCache[command_ids.MERC_ACTION]), 'output')
  }
  state.cache.commandCache[command_ids.MERC_ACTION] = null
})

// Setters

function setActions() {
  if (props.menu === 'inventory') {
    actions.value = getActions({
      name: props.item.name,
      type: props.item.type,
      subtype: props.item.subtype
    }, props.isPlayer)
  }

  if (props.menu === 'equipment') {
    props.visible ? actions.value = ['remove'] : null
  }
}

// Getters

function getClass() {
  let sideClass = ""
  const swapControls = state.options.swapControls

  if (props.isPlayer && swapControls) {
    sideClass = "player-inventory-modal-right"
  } else if (props.isPlayer && !swapControls) {
    sideClass = "player-inventory-modal-left"
  } else if (!props.isPlayer && swapControls) {
    sideClass = "merc-inventory-modal-left"
  } else if (!props.isPlayer && !swapControls) {
    sideClass = "merc-inventory-modal-right"
  }

  return sideClass;
}

function getButtonType(action) {
  if (['drop', 'remove', 'salvage'].includes(action)) {
    return 'error'
  }
}

function getLook() {
  return props.item.description ? props.item.description : "Cannot find any info on this item"
}

// Actions

function closeModal() {
  isVisible.value = false
}

function dropAll() {
  props.isPlayer ? cmd(`drop all iid:${props.item.iid}`)
      : cmd(`${mercOrder}drop all iid:${props.item.iid}`, command_ids.MERC_ACTION)
  closeModal()
}

function dropItems() {
  if (dropValue.value === props.item.amount) {
    closeModal()
  }
  props.isPlayer ? cmd(`drop ${dropValue.value}x iid:${props.item.iid}`)
      : cmd(`${mercOrder}drop ${dropValue.value}x iid:${props.item.iid}`, command_ids.MERC_ACTION)
}

function giveAll() {
  if (state.gameState.mercEid !== -1) {
    props.isPlayer ? cmd(`give all iid:${props.item.iid} eid:${otherChar}`)
        : cmd(`${mercOrder}give all iid:${props.item.iid} eid:${otherChar}`, command_ids.MERC_ACTION)
    closeModal()
  }
}

function giveItems() {
  if (state.gameState.mercEid !== -1) {
    if (giveValue.value === props.item.amount) {
      closeModal()
    }
    props.isPlayer ? cmd(`give ${giveValue.value}x iid:${props.item.iid} eid:${otherChar}`)
        : cmd(`${mercOrder}give ${giveValue.value}x iid:${props.item.iid} eid:${otherChar}`, command_ids.MERC_ACTION)
  }
}

function rawExamine () {
  const str = state.cache.commandCache[`${command_ids.EXAMINE}${props.item.iid}`]
  if (str) {
    return str
  } else {
    return "Getting data..."
  }
}

function rawCompare () {
  const str = state.cache.commandCache[`${command_ids.COMPARE}${props.item.iid}`]
  if (str) {
    return str
  } else {
    return "Getting data..."
  }
}

// Methods
function handleUpdateValue(tab) {
  activeTab.value = tab
}

function clickedAction(action) {
  const nonDestructiveActions = ['look', 'examine', 'compare']
  if (!nonDestructiveActions.includes(action) && props.item.amount === 1) {
    closeModal()
  }

  props.isPlayer ? cmd(`${action} iid:${props.item.iid}`)
      : cmd(`${mercOrder}${action} iid:${props.item.iid}`, command_ids.MERC_ACTION)
}

</script>

<style scoped lang="less">

.n-card {
  position: fixed;
  margin-top: 3px;
  width: calc(100vw - 280px);
  min-width: 300px;
  max-width: 700px;
  z-index: 3;
  top: 0;
  height: calc(100vh - 6px);
  max-height: 600px;
}

.player-inventory-modal-left {
  left: 275px
}

.player-inventory-modal-right {
  right: 275px;
}

.merc-inventory-modal-left {
  left: 410px;
}

.merc-inventory-modal-right {
  right: 410px;
}

.left {
  left: 5px;
}

.right {
  right: 5px;
}

.item-desc {
  white-space: pre-wrap;
  font-size: 1.2em;
  overflow: scroll;
  height: calc(100vh - 95px);
}

h3 {
  margin-top: 0;
  font-size: 1.4em;
}

.close {
  position: absolute;
  top: -20px;
  right: 10px;
  cursor: pointer;
  font-size: 1.4em;
}

.actions-pane {
  overflow: scroll;
  height: calc(100vh - 95px);
  margin-bottom: 20px;
}

.examine {
  white-space: pre-wrap;
  font-size: 1.2em;
  overflow: scroll;
  height: calc(100vh - 95px);
  font-family: 'Inconsolata', monospace;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;

.left {
  text-align: right;
}
.right {
  text-align: left;
}
}

.actions {
  margin-top: 20px;
  width: 100%;
  display: grid;
  gap: 1em;
  grid-template-columns: 1fr 1fr 1fr;

.action {
  text-transform: capitalize;
}
}

.additional-collapse {
  margin-top: 15px;
  margin-bottom: 15px;
}

.input-button {
  display: flex;
}

.additional-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 15px;
}

.input-field {
  margin-left: 5px;
  width: 100px;
}

</style>
