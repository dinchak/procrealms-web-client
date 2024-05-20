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
import { reactive, onMounted, watch, defineProps, toRefs } from 'vue'
import { NDropdown, NButton, NIcon } from 'naive-ui'

// import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/static/state'

import AddCommentOutlined from '@vicons/material/AddCommentOutlined'

// const { getMerc } = useHelpers()
const { fetchItems, cmd } = useWebSocket()

const props = defineProps({
  merc: Object
})

const { merc } = toRefs(props)

const options = reactive([])

const combatPotions = ["healing potion", "energy potion", "stamina potion"]

/*
    TODO
- Have a way to select a target on which the action / skill is performed
- Add more potions
 */

onMounted(async () => {
  await setOptions()
})

function handleSelect (order) {
  cmd(`queue ${order}`)
}

watch(() => state.gameState.party, () => {
  setOptions()
})

function onButtonClick (ev) {
  // prevent button click from propagating to the BattleEntity component
  ev.stopPropagation()
}

async function setOptions () {
  const divider = {
    type: 'divider',
    key: 'd1'
  }
  
  options.length = 0

  if (!merc.value) {
    return
  }

  const mercSkills = Object.values(merc.value.skills)
    .filter(skill => !skill.type.includes('passive'))

  // The regex fresh hell below is to capitalize first letter for each word in the skill list
  // Ideally, we'd just use CSS' text-transform: capitalize; for this, but naiveUI makes it a pain to target the
  // elements in the dropdown. Will have to revisit this
  mercSkills.map(skill => options.push({
    label: skill.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
    key: `eid:${merc.value.stats.eid.toString()} ${skill.spell ? 'cast ' : ''}${skill.name}`
  }))

  const items = await fetchItems(merc.value.items)

  items.map(item => {
    const itemName = item.name.substring(item.name.indexOf(" ") + 1).toLowerCase()
    if (combatPotions.includes(itemName)) {

      if (!options.includes(divider)) {
        options.push(divider)
      }

      const itemType = itemName.substring(0, itemName.indexOf(" "))
        .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())

      options.push({
        label: `Drink ${itemType}`,
        key: `eid:${merc.value.stats.eid.toString()} drink ${itemName.substring(0, itemName.indexOf(" "))}`
      })
    }
  })
}

</script>

<style lang="less" scoped />