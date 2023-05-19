<template>
    <div class="order-dropdown">
      <n-dropdown
        placement="bottom-start"
        trigger="click"
        size="large"
        :options="options"
        @select="handleSelect"
      >
        <n-button>Queue Order</n-button>
      </n-dropdown>
    </div>
</template>

<script setup>
import { NDropdown, NButton } from 'naive-ui'
import { helpers } from '@/composables/helpers'
import { reactive, onMounted, watch } from 'vue'
import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/composables/state'

const { getMerc } = helpers()
const { fetchItems, cmd } = useWebSocket()

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

function handleSelect(order) {
    cmd(`queue ${order}`)
}

watch(() => state.gameState.party, () => {
    setOptions()
})

async function setOptions() {
    const merc = getMerc()
    const divider = {
        type: 'divider',
        key: 'd1'
    }
    options.length = 0
    if (merc) {
        const mercSkills = merc.skills.filter(skill => !skill.type.includes('passive'))
        // The regex fresh hell below is to capitalize first letter for each word in the skill list
        // Ideally, we'd just use CSS' text-transform: capitalize; for this, but naiveUI makes it a pain to target the
        // elements in the dropdown. Will have to revisit this
        mercSkills.map(skill => options.push({
            label: skill.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
            key: `eid:${merc.stats.eid.toString()} ${skill.name}`
        }))

        const items = await fetchItems(merc.items);

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
                    key: `eid:${merc.stats.eid.toString()} drink ${itemName.substring(0, itemName.indexOf(" "))}`
                })
            }
        })
    }
}

</script>

<style lang="less" scoped>
.order-dropdown {
  margin-top: 5px;
}
</style>