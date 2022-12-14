<template>
    <n-card id="item-modal" :class="getSideClass()" v-if="state.modals.inventoryModal.visible">
      <p class="close" v-on:click="closeModal()">x</p>
      <n-tabs type="line" animated size="large">
        <n-tab-pane name="actions" tab="Actions">
          <h3 v-html="item.amount + 'x ' + ansiToHtml(item.colorName)"></h3>
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
          <n-collapse v-if="state.modals.inventoryModal.menu === 'inventory'" class="additional-collapse">
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
          <div class="item-desc" v-html="ansiToHtml(item.description)"></div>
        </n-tab-pane>
        <n-tab-pane name="examine" tab="Examine">
          <div class="examine" v-html="ansiToHtml(rawExamine())"></div>
        </n-tab-pane>
      </n-tabs>
    </n-card>
</template>

<script setup>
import { NCard, NButton, NTabs, NTabPane, NCollapse, NCollapseItem, NInputNumber } from 'naive-ui'
import { ref, watch } from 'vue'
import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/composables/state'
import { command_ids } from '@/composables/constants/command_ids'
import { helpers } from '@/composables/helpers'

const { getActions, ansiToHtml } = helpers()
const { cmd } = useWebSocket()

const isDrinkDisabled = ref(false)
const item = ref(state.modals.inventoryModal.item)
const actions = ref(getActions({
  name: item.value.name,
  type: item.value.type,
  subtype: item.value.subtype
}))
const dropValue = ref(1)
const giveValue = ref(1)

// Watchers

watch(() => state.modals.inventoryModal.item, () => {
  if (state.modals.inventoryModal.visible) {
    item.value = state.modals.inventoryModal.item
    const commandCacheKey = command_ids.EXAMINE + item.value.iid.toString()
    cmd(`examine iid:${item.value.iid}`, commandCacheKey)
    setActions()
  }
  dropValue.value = 1
})

watch(() => state.modals.inventoryModal.menu, () => {
  state.modals.inventoryModal.visible ? setActions() : null
})

watch(()=> state.gameState.affects, () => {
  isDrinkDisabled.value = !!(item.value.type === 'consumable' &&
      item.value.subtype === 'potion' &&
      state.gameState.affects.find(af => af.name === item.value.name));
})

// Methods

function closeModal() {
  state.modals.zindex-=1
  state.modals.inventoryModal.visible = false
}

function clickedAction(action) {
  const nonDestructiveActions = ['look', 'examine', 'compare']
  if (!nonDestructiveActions.includes(action) && item.value.amount === 1) {
    closeModal()
  }
  cmd(`${action} iid:${item.value.iid}`)
}

function dropAll() {
  cmd(`drop all iid:${item.value.iid}`)
  closeModal()
}

function dropItems() {
  if (dropValue.value === item.value.amount) {
    closeModal()
  }
  cmd(`drop ${dropValue.value}x iid:${item.value.iid}`)
}

function giveAll() {
  if (state.gameState.mercEid !== -1) {
    cmd(`give all iid:${item.value.iid} eid:${state.gameState.mercEid}`)
    closeModal()
  }
}

function giveItems() {
  if (state.gameState.mercEid !== -1) {
    if (giveValue.value === item.value.amount) {
      closeModal()
    }
    cmd(`give ${giveValue.value}x iid:${item.value.iid} eid:${state.gameState.mercEid}`)
  }
}

// Setters

function setActions() {
  if (state.modals.inventoryModal.menu === 'inventory') {
    actions.value = getActions({
      name: item.value.name,
      type: item.value.type,
      subtype: item.value.subtype
    })
  }

  if (state.modals.inventoryModal.menu === 'equipment') {
    state.modals.inventoryModal.visible ? actions.value = ['remove'] : null
  }
}

// Getters

function getSideClass() {
  return state.options.swapControls ? 'right' : 'left'
}

function getButtonType(action) {
  if (action === 'drop' || action === 'remove') {
    return 'error'
  }
}

const rawExamine = function() {
  const str = state.cache.commandCache[`${command_ids.EXAMINE}${item.value.iid}`]
  if (str) {
    return str
  } else {
    return "Getting data..."
  }
}

</script>

<style scoped lang="less">
.n-card {
  position: absolute;
  margin-top: 200px;
  width: 400px;
  z-index: 3;
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

.examine {
  white-space: pre-wrap;
  font-size: 1.2em;
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

@media screen and (max-width: 1000px) {
  .n-card {
    width: 98%;
    margin-top: 5px;
    max-height: 95%;
  }

  .item-desc, .examine {
    max-height: 68vh;
    overflow-y: auto;
  }
}
</style>