<template>
  <div class="scroll-container">
    <NGrid class="inventory" cols="1 800:2 1200:3">
      <NGi v-if="items.length == 0">You don't have anything in your inventory.</NGi>

      <NGi v-for="item in items" :key="item.iid">
        <div class="item">
          <div class="name" v-html-safe="ansiToHtml(item.fullName)" :class="getItemNameClass(item)" @click="selectItem(item)"></div>

          <div class="details" v-if="selectedItem == item">

            <div class="desc" v-if="item.description" v-html-safe="ansiToHtml(item.description)"></div>

            <div class="tags">
              <div class="tag black">[<span class="bold-cyan">{{ ucfirst(item.type) }}</span>]</div>
              <div v-if="item.subtype && item.type != item.subtype" class="tag black">[<span class="bold-blue">{{ ucfirst(item.subtype) }}</span>]</div>
              <div v-if="item.type == 'weapon'" class="tag black">[<span class="bold-yellow">{{ ucfirst(item.damageType) }}</span>]</div>
              <div v-if="item.type == 'armor'" class="tag black">[<span class="bold-yellow">{{ ucfirst(item.slot) }}</span>]</div>
              <div v-if="item.shield" class="tag black">[<span class="bold-white">Shield</span>]</div>
              <div v-if="item.twoHanded" class="tag black">[<span class="bold-red">Two Handed</span>]</div>
            </div>

            <div class="base-stats">
              <div class="stat" v-for="stat in getBaseStats(item)" :key="stat.label">
                <div :class="getBaseStatValueClass(stat)" v-if="stat.value !== false" v-html-safe="stat.value"></div>
                <div class="label" v-if="stat.label !== false" v-html-safe="stat.label"></div>
              </div>
            </div>

            <div class="gemslots" v-if="item.numGemSlots > 0">
              <div class="header bold-magenta" v-if="numGemSlotsAvailable(item) > 0">Gem Slots <span class="black">[</span>{{ numGemSlotsAvailable(item) }} <span class="bold-white">slot available</span><span class="black">]</span></div>
              <div class="header bold-magenta" v-if="numGemSlotsAvailable(item) == 0">Gem Slots <span class="black">[</span><span class="magenta">Filled</span><span class="black">]</span></div>
              <div class="no-gems" v-if="numGemSlotsAvailable(item) == item.numGemSlots">No gems have been enchanted into this item.</div>
              <div class="gem" v-for="(gem, i) in item.gemSlots" :key="gem.name">
                <div class="slot">Slot <span class="bold-magenta">{{ i + 1 }}</span>: </div>
                <div class="gem-name bold-white">{{ gem }}</div>
                <div class="bonus black" v-html-safe="ansiToHtml(renderGemSlotBonus(item, i))"></div>
              </div>
            </div>

            <div class="bonuses" v-if="getItemBonuses(item).length > 0">
              <div class="header bold-cyan">Bonuses</div>
              <div class="bonus" v-for="bonus in getItemBonuses(item)" :key="bonus.label">
                <div class="value bold-green">+{{ bonus.value }}</div>
                <div class="label bold-white">{{ bonus.label }}</div>
                <div class="flag black" v-if="bonus.flag">[<span class="bold-white">{{ bonus.flag }}</span>]</div>
              </div>
            </div>

            <div class="crafting" v-if="item.ingredients || item.itemsNeeded || item.skillsNeeded">
              <div class="header bold-yellow">Crafting</div>
              <div class="row" v-if="item.ingredients">
                <div class="label">Ingredients:</div>
                <div class="value" v-html-safe="renderIngredients(item)"></div>
              </div>
              <div class="row" v-if="item.itemsRequired">
                <div class="label">Items Needed:</div>
                <div class="value" v-html-safe="renderItemsRequired(item)"></div>
              </div>
              <div class="row" v-if="item.skillsRequired">
                <div class="label">Skills Needed:</div>
                <div class="value" v-html-safe="renderSkillsRequired(item)"></div>
              </div>
            </div>

          </div>

        </div>
      </NGi>
    </NGrid>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { NGrid, NGi } from 'naive-ui'
import { state } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { constants } from '@/composables/constants/constants'

const { ansiToHtml, copperToMoneyString, ucfirst, renderNumber, ansi, listToString } = useHelpers()
const { fetchItems } = useWebSocket()

const items = ref([])
const selectedItem = ref({})

function getBaseStats (item) {
  if (item.type == 'armor') {
    return [{
      label: copperToMoneyString(item.value, true),
      value: false
    }, {
      label: 'Quality',
      value: item.quality,
      color: 'bold-green'
    }, {
      label: false,
      value: item.weight + ' lbs',
    }]
  } else if (item.type == 'weapon') {
    return [{
      label: copperToMoneyString(item.value, true),
      value: false
    }, {
      label: 'Quality',
      value: item.quality,
      color: 'bold-green'
    }, {
      label: false,
      value: item.weight + ' lbs',
    }, {
      label: 'Damage',
      value: `${item.damLow}-${item.damHigh}`,
      color: 'bold-red'
    }, {
      label: 'DPR',
      value: renderNumber(item.dpr),
      color: 'bold-red'
    }, {
      label: 'APR',
      value: renderNumber(item.apr),
      color: 'bold-yellow'
    }, ]
  } else if (item.type == 'consumable') {
    let stats = [{
      label: copperToMoneyString(item.value, true),
      value: false
    }, {
      label: false,
      value: item.weight + ' lbs',
    }]

    if (item.food > 0) {
      stats.push({
        label: 'Food',
        value: item.food,
        color: 'bold-green'
      })
    }

    return stats
  } else {
    return [{
      label: copperToMoneyString(item.value, true),
      value: false
    }, {
      label: false,
      value: item.weight + ' lbs',
    }]
  }
}

function getBaseStatValueClass (stat) {
  let classes = ['value']
  if (stat.color) {
    classes.push(stat.color)
  }
  if (stat.label === false) {
    classes.push('wide')
  }
  return classes.join(' ')
}

function getItemNameClass (item) {
  return selectedItem.value == item ? 'selected' : ''
}

function selectItem (item) {
  if (selectedItem.value == item) {
    selectedItem.value = {}
    return
  }
  selectedItem.value = item
}

function getItemBonuses (item) {
  let bonuses = []

  let bonusKeys = Object.keys(item)
  for (let key of bonusKeys) {
    let itemEffect = constants.ITEM_EFFECTS.find(effect => effect.bonus == key)
    if (!itemEffect) {
      continue
    }

    if (item[key] == 0) {
      continue
    }

    bonuses.push({
      label: itemEffect.label,
      value: getBonusAmount({ name: itemEffect.bonus, amount: item[key] })
    })
  }

  if (item.flags) {
    for (let flag of item.flags) {
      for (let bonus of flag.bonuses) {
        let itemEffect = constants.ITEM_EFFECTS.find(effect => effect.bonus == bonus.name)
        let row = {
          label: itemEffect ? itemEffect.label : bonus.name,
          value: getBonusAmount(bonus),
          flag: flag.name
        }

        bonuses.push(row)
      }
    }
  }

  if (item.bonuses) {
    for (let bonus of item.bonuses) {
      let itemEffect = constants.ITEM_EFFECTS.find(effect => effect.bonus == bonus.name)
      let row = {
        label: itemEffect ? itemEffect.label : bonus.name,
        value: getBonusAmount({ name: bonus.name, amount: bonus.value })
      }

      bonuses.push(row)
    }
  }

  return bonuses
}

const renderBonusPercent = [
  'critical', 'xpBonus'
]

const renderBonusSeconds = [
  'skillCooldown', 'spellCooldown', 'castingTime'
]

const renderBonusMultipliers = [
  'criticalMultiplier'
]

function getBonusAmount (bonus) {
  if (renderBonusPercent.includes(bonus.name)) {
    return `${renderNumber(bonus.amount)}%`
  } else if (renderBonusSeconds.includes(bonus.name)) {
    return `${renderNumber(bonus.amount)}s`
  } else if (renderBonusMultipliers.includes(bonus.name)) {
    return `${renderNumber(bonus.amount)}x`
  } else {
    return renderNumber(bonus.amount)
  }
}

function numGemSlotsAvailable (item) {
  return item.numGemSlots - item.gemSlots.length
}

function renderGemSlotBonus (item, slotNum) {
  let flag = item.flags.find(flag => flag.gemSlot === slotNum)
  if (!flag) { 
    return ''
  }

  let bonus = flag.bonuses[0]
  let itemEffect = constants.ITEM_EFFECTS.find(effect => effect.bonus == bonus.name)
  if (!itemEffect) {
    return ''
  }

  return `${ansi.boldBlack}[${ansi.green}+${ansi.boldGreen}${bonus.amount} ${ansi.boldWhite}${itemEffect.label}${ansi.boldBlack}]`
}

function renderIngredients (item) {
  return listToString(item.ingredients.map(i => `<span class="bold-white">${i.amount}</span>x <span class="bold-cyan">${i.name}</span>`))
}

function renderItemsRequired (item) {
  let items = []

  if (item.itemsRequired.room) {
    for (let itemRequired of item.itemsRequired.room) {
      let itemName = typeof itemRequired == 'string' ? itemRequired : itemRequired.subtype
      items.push(`<span class="bold-cyan">${itemName}</span> (<span class="bold-magenta">room</span>)`)
    }
  }

  if (item.itemsRequired.toolbelt) {
    for (let itemRequired of item.itemsRequired.toolbelt) {
      let itemName = typeof itemRequired == 'string' ? itemRequired : itemRequired.subtype
      items.push(`<span class="bold-cyan">${itemName}</span> (<span class="bold-yellow">toolbelt</span>)`)
    }
  }

  if (item.itemsRequired.inventory) {
    for (let itemRequired of item.itemsRequired.inventory) {
      let itemName = typeof itemRequired == 'string' ? itemRequired : itemRequired.subtype
      items.push(`<span class="bold-cyan">${itemName}</span> (<span class="bold-white">inventory</span>)`)
    }
  }

  return items.join(', ')
}

function renderSkillsRequired (item) {
  return listToString(item.skillsRequired.map(req => `<span class="bold-green">${req.name}</span> (level <span class="bold-white">${req.level}</span>)`))
}

let watchers = []
onMounted(async () => {
  items.value = await fetchItems(state.gameState.inventory)
  
  watchers.push(
    watch(state.gameState, async (newVal) => items.value = await fetchItems(newVal.inventory))
  )
})

onBeforeUnmount(() => {
  for (let watcher of watchers) {
    watcher()
  }
})
</script>

<style lang="less" scoped>
.scroll-container {
  height: calc(100vh - 225px);
  overflow-y: scroll;
  .inventory {
    .item {
      .name {
        font-size: 16px;
        padding: 5px 10px;
        cursor: pointer;
        // background: #111;

        &:hover, &.selected {
          background: #121;
        }
      }

      .details {
        background: #111;
        padding-top: 10px;
        .tags {
          font-size: 16px;
          display: flex;
          flex-direction: row;
          padding: 0 10px 0px 10px;
          line-height: 18px;
          background: #111;
          margin-bottom: 10px;
          .tag {
            margin-right: 10px;
          }
        }

        .desc {
          padding: 0 10px 10px 10px;
          line-height: 18px;
          background: #111;
          white-space: pre-line;
        }

        .base-stats {
          display: flex;
          flex-direction: row;
          padding: 0 10px 10px 10px;
          max-width: 450px;
          background: #111;
          flex-wrap: wrap;

          .stat {
            display: flex;
            flex-direction: row;
            width: 33%;
            line-height: 18px;
            .value {
              margin-right: 10px;
              // text-align: right;
              &.wide {
                width: 100%;
              }
            }

            .label {
              text-align: left;
            }
          }
        }

        .gemslots {
          display: flex;
          flex-direction: column;
          padding: 0 10px 10px 10px;
          background: #111;
          flex-wrap: wrap;

          .header {
            line-height: 18px;
          }

          .no-gems {
            line-height: 18px;
            margin-left: 10px;
          }

          .gem {
            margin-left: 10px;
            display: flex;
            flex-direction: row;
            .slot, .gem-name {
              margin-right: 10px;
            }
          }
        }

        .bonuses {
          display: flex;
          flex-direction: column;
          padding: 0 10px 10px 10px;
          background: #111;
          flex-wrap: wrap;

          .header {
            line-height: 18px;
          }

          .bonus {
            display: flex;
            flex-direction: row;
            width: 100%;
            line-height: 18px;
            margin-left: 10px;
            .value {
              margin-right: 10px;
            }

            .label {
              text-align: left;
            }

            .flag {
              margin-left: 10px;
            }
          }
        }

        .crafting {
          display: flex;
          flex-direction: column;
          padding: 0 10px 10px 10px;
          background: #111;
          flex-wrap: wrap;

          .header {
            line-height: 18px;
          }

          .row {
            display: flex;
            flex-direction: row;
            width: 100%;
            line-height: 18px;
            margin-left: 10px;
            .label {
              margin-right: 10px;
            }

            .value {
              text-align: left;
            }
          }
        
        }
      }
    }
  }
}

@media screen and (max-width: 500px) {
  .inventory {
    .item {
      .details {
        .base-stats {
          .stat {
            width: 50%;
          }
        }
      }
    }
  }
}
</style>