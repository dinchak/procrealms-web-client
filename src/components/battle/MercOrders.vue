<template>
  <div class="order-dropdown">
    <NDropdown
      placement="bottom-start"
      trigger="click"
      size="large"
      :options="options"
      @select="handleSelect"
    >
      <NButton @click="onButtonClick" size="small">
        <NIcon>
          <AddCommentOutlined />
        </NIcon>
      </NButton>
    </NDropdown>
  </div>
</template>

<script setup>
import { reactive, onMounted, watch, defineProps, toRefs, onBeforeUnmount } from 'vue'
import { NDropdown, NButton, NIcon } from 'naive-ui'

// import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/static/state'

import AddCommentOutlined from '@vicons/material/AddCommentOutlined'

// const { getMerc } = useHelpers()
const { fetchItems, runCommand } = useWebSocket()

const props = defineProps({
  merc: Object
})

const { merc } = toRefs(props)

const options = reactive([])
const IS_DEVELOPMENT = import.meta.env.MODE == 'development'
let optionsRefreshToken = 0
let optionsRefreshTimeout = null
let watchers = []

const combatPotions = ["healing potion", "energy potion", "stamina potion"]

/*
    TODO
- Have a way to select a target on which the action / skill is performed
- Add more potions
 */

function incrementUiDiagnostic (key, amount = 1) {
  if (!IS_DEVELOPMENT) {
    return
  }

  state.diagnostics.ui[key] = (state.diagnostics.ui[key] || 0) + amount
}

onMounted(() => {
  scheduleSetOptions(0)

  watchers.push(watch(
    () => {
      const mercEid = merc.value?.stats?.eid || ''
      const mercItems = (merc.value?.items || []).join('|')
      const partyEids = Object.keys(state.gameState.party || {}).join('|')
      return `${mercEid}::${mercItems}::${partyEids}`
    },
    () => {
      scheduleSetOptions(0)
    }
  ))
})

onBeforeUnmount(() => {
  if (optionsRefreshTimeout) {
    clearTimeout(optionsRefreshTimeout)
    optionsRefreshTimeout = null
  }

  watchers.forEach(unwatch => unwatch())
})

function handleSelect (order) {
  runCommand(`queue ${order}`)
}

function onButtonClick (ev) {
  // prevent button click from propagating to the BattleEntity component
  ev.stopPropagation()
}

function scheduleSetOptions (delay = 0) {
  if (optionsRefreshTimeout) {
    clearTimeout(optionsRefreshTimeout)
  }

  optionsRefreshTimeout = setTimeout(() => {
    optionsRefreshTimeout = null
    setOptions()
  }, delay)
}

async function setOptions () {
  const token = ++optionsRefreshToken
  incrementUiDiagnostic('mercOrdersRefreshes')

  const divider = {
    type: 'divider',
    key: 'd1'
  }
  const nextOptions = []

  if (!merc.value) {
    options.length = 0
    return
  }

  const mercSkills = Object.values(merc.value.skills)
    .filter(skill => !skill.type.includes('passive'))

  // The regex fresh hell below is to capitalize first letter for each word in the skill list
  // Ideally, we'd just use CSS' text-transform: capitalize; for this, but naiveUI makes it a pain to target the
  // elements in the dropdown. Will have to revisit this
  mercSkills.map(skill => nextOptions.push({
    label: skill.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
    key: `eid:${merc.value.stats.eid.toString()} ${skill.spell ? 'cast ' : ''}${skill.name}`
  }))

  const items = await fetchItems(merc.value.items)
  if (token !== optionsRefreshToken) {
    incrementUiDiagnostic('mercOrdersStaleDrops')
    return
  }

  items.map(item => {
    const itemName = item.name.substring(item.name.indexOf(" ") + 1).toLowerCase()
    if (combatPotions.includes(itemName)) {

      if (!nextOptions.includes(divider)) {
        nextOptions.push(divider)
      }

      const itemType = itemName.substring(0, itemName.indexOf(" "))
        .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())

      nextOptions.push({
        label: `Drink ${itemType}`,
        key: `eid:${merc.value.stats.eid.toString()} drink ${itemName.substring(0, itemName.indexOf(" "))}`
      })
    }
  })

  if (token !== optionsRefreshToken) {
    incrementUiDiagnostic('mercOrdersStaleDrops')
    return
  }

  options.splice(0, options.length, ...nextOptions)
}

</script>

<style lang="less" scoped />