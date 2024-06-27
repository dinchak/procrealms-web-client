<template>
  <NCollapseItem title="Statistics" @click="setWeapon()">

    <div class="ability-points" v-if="player().abilityPoints > 0">
      You have <span class="bold-yellow">{{ player().abilityPoints }}</span> unspent ability points. Use the point command or the <NIcon class="inline"><AddBoxOutlined></AddBoxOutlined></NIcon> symbol below to spend them.
    </div>

    <div class="character-stats">

      <div class="row">
        <div class="col-2">
          <div class="stat-header">
            <div class="stat-value">
              <span class="bold-red">{{ player()._strength }}</span><span class="black">+</span><span class="red">{{ player().strength - player()._strength }}</span>
            </div>
            <div class="increase-stat">
              <NIcon class="add-point" v-if="player().abilityPoints > 0" @click="addStatPoint('strength')"><AddBoxOutlined></AddBoxOutlined></NIcon>
            </div>
            <div class="stat-label">
              Strength
            </div>
          </div>
        </div>

        <div class="col-2">
          <div class="stat-header">
            <div class="stat-value">
              <span class="bold-cyan">{{ player()._magic }}</span><span class="black">+</span><span class="cyan">{{ player().magic - player()._magic }}</span>
            </div>
            <div class="increase-stat">
              <NIcon class="add-point" v-if="player().abilityPoints > 0" @click="addStatPoint('magic')"><AddBoxOutlined></AddBoxOutlined></NIcon>
            </div>
            <div class="stat-label">
              Magic
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="character-stats">
      <div class="row">
        <div class="bold-green">{{ player().strengthHpBonus }}</div>
        <div>Max Health</div>
        <div class="bold-white">{{ player().magicEnergyBonus }}</div>
        <div>Max Energy</div>
      </div>
      <div class="row">
        <div class="bold-yellow">{{ player().strengthStaminaBonus }}</div>
        <div>Max Stamina</div>
        <div class="magenta">{{ renderNumber(player().magicSpellCooldownBonus) }}</div>
        <div>Spell Cooldown</div>
      </div>
      <div class="row">
        <div class="bold-red">{{ player().strengthDamageBonus }}</div>
        <div>Damage</div>
        <div class="bold-magenta">{{ renderNumber(player().magicDamageBonus) }}</div>
        <div>Magic Damage</div>
      </div>
      <div class="row">
        <div class="red">{{ player().strengthResistBonus }}</div>
        <div>Resist Physical</div>
        <div class="bold-cyan">{{ renderNumber(player().magicResistBonus) }}</div>
        <div>Resist Magic</div>
      </div>
    </div>

    <div class="character-stats">
      <div class="row">
        <div class="col-2">
          <div class="stat-header">
            <div class="stat-value">
              <span class="bold-yellow">{{ player()._agility }}</span><span class="black">+</span><span class="yellow">{{ player().agility - player()._agility }}</span>
            </div>
            <div class="increase-stat">
              <NIcon class="add-point" v-if="player().abilityPoints > 0" @click="addStatPoint('agility')"><AddBoxOutlined></AddBoxOutlined></NIcon>
            </div>
            <div class="stat-label">
              Agility
            </div>
          </div>
        </div>

        <div class="col-2">
          <div class="stat-header">
            <div class="stat-value">
              <span class="bold-green">{{ player()._spirit }}</span><span class="black">+</span><span class="green">{{ player().spirit - player()._spirit }}</span>
            </div>
            <div class="increase-stat">
              <NIcon class="add-point" v-if="player().abilityPoints > 0" @click="addStatPoint('spirit')"><AddBoxOutlined></AddBoxOutlined></NIcon>
            </div>
            <div class="stat-label">
              Spirit
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="character-stats">
      <div class="row">
        <div>{{ player().agilitySpeedBonus }}</div>
        <div>Speed</div>
        <div class="bold-white">{{ player().spiritEnergyBonus }}</div>
        <div>Max Energy</div>
      </div>
      <div class="row">
        <div>{{ player().agilitySkillCooldownBonus }}</div>
        <div>Skill Cooldown</div>
        <div class="bold-blue">{{ player().spiritFocusBonus }}</div>
        <div>Focus</div>
      </div>
      <div class="row">
        <div class="bold-red">{{ renderNumber(player().agilityCriticalBonus) }}</div>
        <div>% Critical Hit</div>
        <div class="bold-green">{{ player().spiritCommandBonus }}</div>
        <div>Command</div>
      </div>
      <div class="row">
        <div>{{ player().agilityCriticalMultiplierBonus }}</div>
        <div>x Multiplier</div>
        <div class="bold-yellow">{{ player().spiritResistBonus }}</div>
        <div>Resist Spirit</div>
      </div>
    </div>

    <div class="character-stats">
      <div class="row">
        <div class="col-2">
          <div class="stat-header">
            <div :class="'stat-value ' + getDamageColor()">
              {{ player().damLow }}<span class="black">-</span>{{ player().damHigh }} <span class="black">+</span>{{ getDamageBonus() }}
            </div>
            <div class="stat-label">
              {{ getDamageType() }}
            </div>
          </div>
        </div>

        <div class="col-2">
          <div class="stat-header">
            <div :class="'stat-value ' + getDamageColor()">
              <span class="bold-yellow">{{ renderNumber(player().dpr) }}</span>
            </div>
            <div class="stat-label">
              avg/round
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="character-stats">
      <div class="row">
        <div>Armor</div>
        <div class="bold-white">{{ player().armor }}</div>
        <div class="bold-white">{{ renderNumber(player().armorAbsorption) }}<span class="white">%</span></div>
        <div>absorption</div>
      </div>

      <div class="row">
        <div>Speed</div>
        <div class="bold-yellow">{{ player().speed }}</div>
        <div class="bold-green">{{ renderNumber(player().recoveryTimeBonus) }}<span class="white">s</span></div>
        <div>recovery</div>
      </div>

      <div class="row">
        <div>Recovery</div>
        <div class="bold-yellow">{{ renderNumber(player().recoveryTime) }}<span class="white">s</span></div>
        <div class="bold-yellow">{{ renderNumber(player().apr) }}</div>
        <div>attacks/round</div>
      </div>
    </div>

    <div class="character-stats">
      <div class="row">
        <div>Critical</div>
        <div class="bold-red">{{ renderNumber(player().criticalChance) }}<span class="white">%</span></div>
        <div class="bold-red">{{ renderNumber(player().criticalMultiplier) }}<span class="white">x</span></div>
        <div>multiplier</div>
      </div>

      <div class="row">
        <div>Focus</div>
        <div class="bold-blue">{{ renderNumber(player().focus) }}</div>
        <div class="bold-blue">{{ renderNumber(player().interruptChance) }}<span class="white">%</span></div>
        <div>interrupt</div>
      </div>

      <div class="row">
        <div>Command</div>
        <div class="bold-green">{{ renderNumber(player().command) }}</div>
        <div>+<span class="bold-green">{{ renderNumber(player().summonMultiplier) }}</span><span class="white">%</span></div>
        <div>summon power</div>
      </div>

      <div class="row" v-if="player().numSkeletons > 0">
        <div></div>
        <div></div>
        <div>
          <span class="bold-magenta">{{ renderNumber(player().numSkeletons) }}</span>/<span class="magenta">{{ renderNumber(player().maxSkeletons) }}</span>
        </div>
        <div>skeletons</div>
      </div>

      <div class="row" v-if="player().numTamed > 0">
        <div></div>
        <div></div>
        <div>
          <span class="bold-yellow">{{ renderNumber(player().numTamed) }}</span>/<span class="yellow">{{ renderNumber(player().maxTamed) }}</span>
        </div>
        <div>tamed</div>
      </div>

      <div class="row" v-if="player().numLivestock > 0">
        <div></div>
        <div></div>
        <div>
          <span class="bold-green">{{ renderNumber(player().numLivestock) }}</span>/<span class="green">{{ renderNumber(player().maxLivestock) }}</span>
        </div>
        <div>livestock</div>
      </div>
    </div>

    <div class="character-stats">
      <div class="row">
        <div>
          Magic Damage
        </div>
        <div class="bold-magenta">
          {{ renderNumber(player().magicDamage) }}
        </div>
        <div class="bold-cyan">
          {{ renderNumber(player().castingTime) }}<span class="white">%</span>
        </div>
        <div>
          Faster Casting
        </div>
      </div>

      <div class="row">
        <div>
          Magic Find
        </div>
        <div class="bold-blue">
          {{ renderNumber(player().magicFindBonus) }}
        </div>
        <div class="magenta">
          {{ renderNumber(player().spellCooldown) }}<span class="white">s</span>
        </div>
        <div>
          Spell Cooldown
        </div>
      </div>

      <div class="row">
        <div>
          EXP Bonus
        </div>
        <div class="bold-yellow">
          {{ renderNumber(100 * player().xpGainBonus) }}<span class="white">%</span>
        </div>
        <div class="yellow">
          {{ renderNumber(player().skillCooldown) }}<span class="white">s</span>
        </div>
        <div>
          Skill Cooldown
        </div>
      </div>
    </div>

    <div class="resistances">Resistances</div>

    <div class="character-stats">
      <div class="row">
        <div class="value magenta">{{ player().resistBludgeoning }}</div>
        <div class="label">Bludgeon</div>
        <div class="value bold-cyan">{{ player().resistArcane }}</div>
        <div class="label">Arcane</div>
        <div class="value bold-yellow">{{ player().resistHoly }}</div>
        <div class="label">Acid</div>
      </div>
      <div class="row">
        <div class="value red">{{ player().resistPiercing }}</div>
        <div class="label">Pierce</div>
        <div class="value bold-yellow">{{ player().resistElectric }}</div>
        <div class="label">Electric</div>
        <div class="value bold-white">{{ player().resistHoly }}</div>
        <div class="label">Holy</div>
      </div>

      <div class="row">
        <div class="value bold-red">{{ player().resistSlashing }}</div>
        <div class="label">Slash</div>
        <div class="value red">{{ player().resistFire }}</div>
        <div class="label">Fire</div>
        <div class="value green">{{ player().resistPoison }}</div>
        <div class="label">Poison</div>
      </div>

      <div class="row">
        <div></div>
        <div></div>
        <div class="value bold-blue">{{ player().resistIce }}</div>
        <div class="label">Ice</div>
        <div></div>
        <div></div>
      </div>
    </div>

  </NCollapseItem>
</template>

<script setup>
import { NCollapseItem, NIcon } from 'naive-ui'
import { defineProps, ref, onMounted, onBeforeUnmount, watch } from 'vue'

import AddBoxOutlined from '@vicons/material/AddBoxOutlined'

import { state } from '@/static/state'
import { DAMAGE_TYPE_COLORS } from '@/static/constants'

import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'

const { cmd, fetchItem } = useWebSocket()
const { renderNumber } = useHelpers()

const props = defineProps(['character', 'equipment', 'isPlayer'])

const weapon = ref({})

function player () {
  return props.character || {}
}

function addStatPoint (stat) {
  const command = props.isPlayer ? `point ${stat}` : `order eid:${props.character.eid} point ${stat}`
  cmd(command)
}

async function setWeapon () {
  let iid = props.equipment.weapon
  if (!iid) {
    weapon.value = false
    return
  }

  let item = await fetchItem(iid)
  if (!item) {
    weapon.value = false
    return
  }

  weapon.value = item
}

function getDamageBonus () {
  if (weapon.value && weapon.value.subtype == 'wand') {
    return player().magicDamage
  } else {
    return player().damage
  }
}

function getDamageColor () {
  return DAMAGE_TYPE_COLORS[getDamageType()]
}

function getDamageType () {
  if (weapon.value && weapon.value.damageType) {
    return weapon.value.damageType
  } else {
    return 'bludgeoning'
  }
}

let watchers = []
onMounted(async () => {
  watchers.push(
    watch(() => state.gameState.equipment, async () => {
      setWeapon()
    })
  )
})

onBeforeUnmount(() => {
  for (let watcher of watchers) {
    watcher()
  }
})

</script>

<style lang="less">

.resistances {
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.character-stats {
  display: table;
  margin-bottom: 10px;
  width: 100%;
  .row {
    display: table-row;
    > div {
      display: table-cell;
      &:nth-child(odd) {
        text-align: right;
        padding: 0 5px 5px 0;
      }
      &.col-2 {
        width: 50%;
        .stat-header {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          .stat-value {
            font-size: 1.5rem;
          }
          .increase-stat {
          }
          .stat-label {
            font-size: 1.2rem;
            text-align: center;
          }        
        }
      }
    }
  }
}

.ability-points {
  text-align: center;
  margin-bottom: 10px;
}

.add-point {
  font-size: 1rem;
  cursor: pointer;
}

</style>
