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
// @ts-check
import { reactive, onMounted, watch, toRefs, onBeforeUnmount } from 'vue'
import { NDropdown, NButton, NIcon } from 'naive-ui'

// import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { incrementUiDiagnostic, state } from '@/static/state'
import { getInventorySignature, normalizeInventorySource } from '@/composables/inventory_helpers'

import AddCommentOutlined from '@vicons/material/AddCommentOutlined'

// const { getMerc } = useHelpers()
const { fetchItems, runCommand } = useWebSocket()

const props = defineProps({
  merc: Object
})

const { merc } = toRefs(props)

const options = reactive([])
let optionsRefreshToken = 0
let optionsRefreshTimeout = null
let watchers = []

/*
    TODO
- Have a way to select a target on which the action / skill is performed
- Add more potions
 */

onMounted(() => {
  scheduleSetOptions(0)

  watchers.push(watch(
    () => {
      const mercEid = merc.value?.stats?.eid || ''
      const mercItems = getInventorySignature(merc.value?.items)
      const mercSkills = JSON.stringify(merc.value?.skills || {})
      const partyEids = Object.keys(state.gameState.party || {}).join('|')
      return `${mercEid}::${mercItems}::${mercSkills}::${partyEids}`
    },
    () => {
      scheduleSetOptions(0)
    }
  ))
})

onBeforeUnmount(() => {
  optionsRefreshToken++
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
  optionsRefreshToken++
  options.length = 0
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

  const selectedMerc = merc.value
  if (!selectedMerc?.stats?.eid) {
    options.length = 0
    return
  }

  const mercEid = selectedMerc.stats.eid
  const mercSkills = Object.values(selectedMerc.skills || {})
    .filter(skill => !skill.type.includes('passive'))

  // The regex fresh hell below is to capitalize first letter for each word in the skill list
  // Ideally, we'd just use CSS' text-transform: capitalize; for this, but naiveUI makes it a pain to target the
  // elements in the dropdown. Will have to revisit this
  mercSkills.map(skill => nextOptions.push({
    label: skill.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
    key: `eid:${mercEid} ${skill.spell ? 'cast ' : ''}${skill.name}`
  }))

  const items = await fetchItems(normalizeInventorySource(selectedMerc.items).map(item => item.iid))
  if (token !== optionsRefreshToken) {
    incrementUiDiagnostic('mercOrdersStaleDrops')
    return
  }

  items.map(item => {
    const potionMatch = item?.name?.match(/\b(healing|energy|stamina) potion$/i)
    if (potionMatch) {

      if (!nextOptions.includes(divider)) {
        nextOptions.push(divider)
      }

      const potionType = potionMatch[1].toLowerCase()
      const itemType = potionType
        .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())

      nextOptions.push({
        label: `Drink ${itemType}`,
        key: `eid:${mercEid} drink ${potionType}`
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
