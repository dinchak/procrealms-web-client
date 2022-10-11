<template>
    <n-card id="item-modal" :class="getSideClass()" v-if="state.modal.visible">
      <p class="close" v-on:click="closeModal()">x</p>
      <n-tabs type="line" animated size="large">
        <n-tab-pane name="actions" tab="Actions">
          <h3 v-html="item.amount + 'x ' + ansiSpan(item.colorName)"></h3>
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
        </n-tab-pane>
        <n-tab-pane name="look" tab="Look">
          <div class="item-desc" v-html="ansiSpan(item.description.replaceAll('\n', '<br>'))"></div>
        </n-tab-pane>
        <n-tab-pane name="examine" tab="Examine">
          <div class="examine" v-html="ansiSpan(rawExamine())"></div>
        </n-tab-pane>
      </n-tabs>
    </n-card>
</template>

<script setup>
import { NCard, NButton, NTabs, NTabPane } from 'naive-ui'
import { ref, watch } from 'vue'
import { ansiSpan } from 'ansi-to-span'
import { helpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/composables/state'
import { command_ids } from '@/composables/constants/command_ids'

const { getActions } = helpers()
const { cmd } = useWebSocket()

const isDrinkDisabled = ref(false)
const item = ref(state.modal.item)
const actions = ref(getActions({
  name: item.value.name,
  type: item.value.type,
  subtype: item.value.subtype
}))

// Watchers

watch(() => state.modal.item, () => {
  if (state.modal.visible) {
    item.value = state.modal.item
    const commandCacheKey = command_ids.EXAMINE + item.value.iid.toString()
    cmd(`examine iid:${item.value.iid}`, commandCacheKey)
    setActions()
  }
})

watch(() => state.modal.menu, () => {
  state.modal.visible ? setActions() : null
})

watch(()=> state.gameState.affects, () => {
  isDrinkDisabled.value = !!(item.value.type === 'consumable' &&
      item.value.subtype === 'potion' &&
      state.gameState.affects.find(af => af.name === item.value.name));
})

// Methods

function closeModal() {
  state.modal.visible = false
}

function clickedAction(action) {
  const nonDestructiveActions = ['look', 'examine', 'compare']
  if (!nonDestructiveActions.includes(action) && item.value.amount === 1) {
    closeModal()
  }
  cmd(`${action} iid:${item.value.iid}`)
}

// Setters

function setActions() {
  if (state.modal.menu === 'inventory') {
    actions.value = getActions({
      name: item.value.name,
      type: item.value.type,
      subtype: item.value.subtype
    })
  }

  if (state.modal.menu === 'equipment') {
    state.modal.visible ? actions.value = ['remove'] : null
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
  const string = state.commandCache[`${command_ids.EXAMINE}${item.value.iid}`]
  if (string) {
    return string.replaceAll('\n', '<br>')
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