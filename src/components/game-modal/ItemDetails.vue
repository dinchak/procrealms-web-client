<template>
  <div class="details">

    <div class="actions">
      <NButton ghost v-for="action in actions" :key="action.label" :onClick="action.onClick" :class="action.class + (!action.disabled ? ' selectable' : '')" :disabled="action.disabled">{{ action.label }}</NButton>
    </div>

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
      <div class="stat" v-for="stat in getBaseStats()" :key="stat.label">
        <div :class="getBaseStatValueClass(stat)" v-if="stat.value !== false" v-html-safe="stat.value"></div>
        <div class="label" v-if="stat.label !== false" v-html-safe="stat.label"></div>
      </div>
    </div>

    <div class="gemslots" v-if="item.numGemSlots > 0">
      <div class="header bold-magenta" v-if="numGemSlotsAvailable() > 0">Gem Slots <span class="black">[</span>{{ numGemSlotsAvailable() }} <span class="bold-white">slot available</span><span class="black">]</span></div>
      <div class="header bold-magenta" v-if="numGemSlotsAvailable() == 0">Gem Slots <span class="black">[</span><span class="magenta">Filled</span><span class="black">]</span></div>
      <div class="no-gems" v-if="numGemSlotsAvailable() == item.numGemSlots">No gems have been enchanted into this item.</div>
      <div class="gem" v-for="(gem, i) in item.gemSlots" :key="gem.name">
        <div class="slot">Slot <span class="bold-magenta">{{ i + 1 }}</span>: </div>
        <div class="gem-name bold-white">{{ gem }}</div>
        <div class="bonus black" v-html-safe="ansiToHtml(renderGemSlotBonus(i))"></div>
      </div>
    </div>

    <div class="bonuses" v-if="getItemBonuses().length > 0">
      <div class="header bold-cyan">Bonuses</div>
      <div class="bonus" v-for="bonus in getItemBonuses()" :key="bonus.name">
        <div class="value bold-green">+{{ renderBonusAmount(bonus) }}</div>
        <div class="label bold-white">{{ bonus.name }}</div>
        <div class="flag black" v-if="bonus.flag">[<span class="bold-white">{{ bonus.flag }}</span>]</div>
      </div>
    </div>

    <div class="crafting" v-if="item.ingredients || item.itemsNeeded || item.skillsNeeded">
      <div class="header bold-yellow">Crafting</div>
      <div class="row" v-if="item.ingredients">
        <div class="label">Ingredients:</div>
        <div class="value" v-html-safe="renderIngredients()"></div>
      </div>
      <div class="row" v-if="item.itemsRequired">
        <div class="label">Items Needed:</div>
        <div class="value" v-html-safe="renderItemsRequired()"></div>
      </div>
      <div class="row" v-if="item.skillsRequired">
        <div class="label">Skills Needed:</div>
        <div class="value" v-html-safe="renderSkillsRequired()"></div>
      </div>
    </div>

  </div>

</template>
<script setup>
import { defineProps, toRefs } from 'vue'
import { NButton } from 'naive-ui'
import { useHelpers } from '@/composables/helpers'
import { ANSI, ITEM_EFFECTS } from '@/static/constants'

const { ansiToHtml, copperToMoneyString, ucfirst, renderNumber, listToString } = useHelpers()

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  actions: {
    type: Array,
    default: () => []
  }
})

const { item, actions } = toRefs(props)

function getBaseStats () {
  if (item.value.type == 'armor') {
    return [{
      label: copperToMoneyString(item.value.value, true),
      value: false
    }, {
      label: 'Quality',
      value: item.value.quality,
      color: 'bold-green'
    }, {
      label: false,
      value: item.value.weight + ' lbs',
    }]
  } else if (item.value.type == 'weapon') {
    return [{
      label: copperToMoneyString(item.value.value, true),
      value: false
    }, {
      label: 'Quality',
      value: item.value.quality,
      color: 'bold-green'
    }, {
      label: false,
      value: item.value.weight + ' lbs',
    }, {
      label: 'Damage',
      value: `${item.value.damLow}-${item.value.damHigh}`,
      color: 'bold-red'
    }, {
      label: 'DPR',
      value: renderNumber(item.value.dpr),
      color: 'bold-red'
    }, {
      label: 'APR',
      value: renderNumber(item.value.apr),
      color: 'bold-yellow'
    }, ]
  } else if (item.value.type == 'consumable') {
    let stats = [{
      label: copperToMoneyString(item.value.value, true),
      value: false
    }, {
      label: false,
      value: item.value.weight + ' lbs',
    }]

    if (item.value.food > 0) {
      stats.push({
        label: 'Food',
        value: item.value.food,
        color: 'bold-green'
      })
    }

    return stats
  } else {
    return [{
      label: copperToMoneyString(item.value.value, true),
      value: false
    }, {
      label: false,
      value: item.value.weight + ' lbs',
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

function getItemBonuses () {
  let bonuses = []
  let bonusKeys = Object.keys(item.value)

  for (let key of bonusKeys) {
    let itemEffect = ITEM_EFFECTS.find(effect => effect.bonus == key)
    if (!itemEffect) {
      continue
    }

    if (item[key] == 0) {
      continue
    }

    bonuses.push({
      name: itemEffect.label || key,
      amount: item.value[key]
    })
  }

  if (item.value.flags) {
    for (let flag of item.value.flags) {
      if (!flag.bonuses) {
        continue
      }

      for (let bonus of flag.bonuses) {
        let itemEffect = ITEM_EFFECTS.find(effect => effect.bonus == bonus.name)
        let row = bonuses.find(b => b.label == (itemEffect ? itemEffect.label : bonus.name))
        if (row) {
          row.amount += bonus.amount
          row.flag = flag.name
          continue
        }
        
        row = {
          name: itemEffect ? itemEffect.label : bonus.name,
          amount: bonus.amount,
          flag: flag.name
        }

        bonuses.push(row)
      }
    }
  }

  if (item.value.bonuses) {
    for (let bonus of item.value.bonuses) {
      let itemEffect = ITEM_EFFECTS.find(effect => effect.bonus == bonus.name)
      let row = bonuses.find(b => b.label == (itemEffect ? itemEffect.label : bonus.name))

      if (row) {
        row.value += bonus.amount
        continue
      }
      
      row = {
        name: itemEffect ? itemEffect.label : bonus.name,
        amount: bonus.amount
      }

      bonuses.push(row)
    }
  }

  return bonuses
}

const renderBonusPercent = [
  'critical', 'xpBonus', 'castingTime'
]

const renderBonusSeconds = [
  'skillCooldown', 'spellCooldown'
]

const renderBonusMultipliers = [
  'criticalMultiplier'
]

function renderBonusAmount (bonus) {
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

function numGemSlotsAvailable () {
  return item.value.numGemSlots - item.value.gemSlots.length
}

function renderGemSlotBonus (slotNum) {
  let flag = item.value.flags.find(flag => flag.gemSlot === slotNum)
  if (!flag) { 
    return ''
  }

  let bonus = flag.bonuses[0]
  let itemEffect = ITEM_EFFECTS.find(effect => effect.bonus == bonus.name)
  if (!itemEffect) {
    return ''
  }

  return `${ANSI.boldBlack}[${ANSI.green}+${ANSI.boldGreen}${bonus.amount} ${ANSI.boldWhite}${itemEffect.label}${ANSI.boldBlack}]`
}

function renderIngredients () {
  return listToString(item.value.ingredients.map(i => `<span class="bold-white">${i.amount}</span>x <span class="bold-cyan">${i.name}</span>`))
}

function renderItemsRequired () {
  let items = []

  if (item.value.itemsRequired.room) {
    for (let itemRequired of item.value.itemsRequired.room) {
      let itemName = typeof itemRequired == 'string' ? itemRequired : itemRequired.subtype
      items.push(`<span class="bold-cyan">${itemName}</span> (<span class="bold-magenta">room</span>)`)
    }
  }

  if (item.value.itemsRequired.toolbelt) {
    for (let itemRequired of item.value.itemsRequired.toolbelt) {
      let itemName = typeof itemRequired == 'string' ? itemRequired : itemRequired.subtype
      items.push(`<span class="bold-cyan">${itemName}</span> (<span class="bold-yellow">toolbelt</span>)`)
    }
  }

  if (item.value.itemsRequired.inventory) {
    for (let itemRequired of item.value.itemsRequired.inventory) {
      let itemName = typeof itemRequired == 'string' ? itemRequired : itemRequired.subtype
      items.push(`<span class="bold-cyan">${itemName}</span> (<span class="bold-white">inventory</span>)`)
    }
  }

  return items.join(', ')
}

function renderSkillsRequired () {
  return listToString(item.value.skillsRequired.map(req => `<span class="bold-green">${req.name}</span> (level <span class="bold-white">${req.level}</span>)`))
}

</script>
<style lang="less" scoped>
.details {
  background: rgb(16, 18, 22);
  padding-top: 10px;
  .tags {
    display: flex;
    flex-direction: row;
    padding: 0 10px 0px 10px;
    margin-bottom: 10px;
    .tag {
      margin-right: 10px;
    }
  }

  .desc {
    padding: 0 10px 10px 10px;
    white-space: pre-line;
  }

  .base-stats {
    display: flex;
    flex-direction: row;
    padding: 0 10px 10px 10px;
    max-width: 450px;
    flex-wrap: wrap;

    .stat {
      display: flex;
      flex-direction: row;
      width: 33%;
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
    flex-wrap: wrap;

    .no-gems {
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
    flex-wrap: wrap;

    .bonus {
      display: flex;
      flex-direction: row;
      width: 100%;
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
    flex-wrap: wrap;

    .row {
      display: flex;
      flex-direction: row;
      width: 100%;
      margin-left: 10px;
      .label {
        margin-right: 10px;
      }

      .value {
        text-align: left;
      }
    }
  }

  .actions {
    display: flex;
    flex-direction: row;
    padding: 0 10px 0px 10px;
    flex-wrap: wrap;

    .n-button {
      margin-right: 10px;
      margin-bottom: 10px;
      &.selected {
        box-shadow: 0 0 5px #f8ff25;
        color: #f8ff25;
      }
    }
  }
}

@media screen and (max-width: 500px) {
  .details {
    .base-stats {
      .stat {
        width: 50%;
      }
    }
  }
}

</style>