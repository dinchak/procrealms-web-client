<template>
    <div class="order-dropdown" v-if="showOrdersRef">
        <n-dropdown
          :show="showDropdownRef"
          placement="bottom-start"
          trigger="click"
          size="large"
          :options="options"
          @select="handleSelect"
        >
            <n-button @click="handleClick">Queue Order</n-button>
        </n-dropdown>
    </div>
</template>

<script setup>
import { NDropdown } from 'naive-ui'
import { helpers } from '@/composables/helpers'
import {reactive, ref, onMounted, watch} from 'vue'
import { useWebSocket } from '@/composables/web_socket'
import { state } from '@/composables/state'

const { getMerc } = helpers()
const { fetchItems, cmd } = useWebSocket()

const options = reactive([])
const showDropdownRef = ref(false)
const showOrdersRef = ref(false)

const combatPotions = ["healing potion", "energy potion", "stamina potion"]

/*
    TODO
- Have a way to select a target on which the action / skill is performed
 */

onMounted(async () => {
    await setOptions()
    showOrdersRef.value = isMercHere()
})

watch(state.gameState.battle.participants, function () {
    setOptions()
    showOrdersRef.value = isMercHere()
})

function handleClick () {
    showDropdownRef.value = !showDropdownRef.value
    setOptions()
}

function handleSelect(order) {
    cmd(`queue ${order}`)
    showDropdownRef.value = !showDropdownRef.value
}

function isMercHere() {
    let isMercHere = false
    state.gameState.battle.participants.map(participant => {
        if (participant.eid === state.gameState.mercEid) {
            isMercHere = true
        }
    })
    return isMercHere
}

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
    font-size: 16px;
    margin-top: 5px;
    cursor: pointer;
    text-decoration: underline;
}
</style>