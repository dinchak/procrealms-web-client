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

      </div>
    </div>

    <div class="character-stats">
      <div class="row">
        <div><span class="white">+</span><span class="bold-red">{{ player().strengthDamageBonus }}</span></div>
        <div>Weapon Damage</div>
        <div><span class="white">+</span><span class="bold-yellow">{{ player().agilityMovementBonus }}</span></div>
        <div>Movement</div>
      </div>
      <div class="row">
        <div><span class="white">+</span><span class="red">{{ renderNumber(player().strengthCriticalMultiplierBonus) }}</span>x</div>
        <div>Multiplier</div>
        <div><span class="white">+</span><span class="bold-red">{{ renderNumber(player().agilityCriticalBonus) }}</span>%</div>
        <div>Critical Hit</div>
      </div>
      <div class="row">
        <div class="bold-green">{{ player().strengthHpBonus }}</div>
        <div>Max Health</div>
        <div><span class="white">+</span><span class="bold-yellow">{{ renderNumber(player().agilitySpeedBonus) }}</span>s</div>
        <div>Speed</div>
      </div>
      <div class="row">
        <div><span class="white">+</span><span class="bold-yellow">{{ player().strengthStaminaBonus }}</span></div>
        <div>Max Stamina</div>
        <div><span class="white">+</span><span class="yellow">{{ player().agilitySkillCooldownBonus }}</span>s</div>
        <div>Skill Cooldown</div>
      </div>
    </div>

    <div class="character-stats">
      <div class="row">
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
        <div><span class="white">+</span><span class="bold-magenta">{{ player().magicDamageBonus }}</span></div>
        <div>Magic Damage</div>
        <div><span class="white">+</span><span class="green">{{ player().spiritHealingPowerBonus }}</span>%</div>
        <div>Healing Power</div>
      </div>
      <div class="row">
        <div><span class="white">+</span><span class="bold-white">{{ player().magicEnergyBonus }}</span></div>
        <div>Max Energy</div>
        <div><span class="white">+</span><span class="bold-white">{{ player().spiritEnergyBonus }}</span></div>
        <div>Max Energy</div>
      </div>
      <div class="row">
        <div><span class="white">+</span><span class="bold-cyan">{{ renderNumber(player().magicFocusBonus) }}</span>s</div>
        <div>Focus</div>
        <div><span class="white">+</span><span class="magenta">{{ player().spiritCommandBonus }}</span></div>
        <div>Command</div>
      </div>
      <div class="row">
        <div><span class="white">+</span><span class="cyan">{{ renderNumber(player().magicSpellCooldownBonus) }}</span>s</div>
        <div>Spell Cooldown</div>
        <div><span class="white">+</span><span class="magenta">{{ player().spiritSummoningPowerBonus }}</span>%</div>
        <div>Regeneration</div>
      </div>
    </div>

    <div class="character-stats">
      <div class="row">
        <div class="col-2">
          <div class="stat-header">
            <div :class="'damage-value ' + getDamageColor()">
              {{ player().damLow }}<span class="black">-</span>{{ player().damHigh }} <span class="black">+</span>{{ getDamageBonus() }}
            </div>
            <div class="stat-label">
              {{ getDamageType() }}
            </div>
          </div>
        </div>

        <div class="col-2">
          <div class="stat-header">
            <div :class="'damage-value ' + getDamageColor()">
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
        <div>+<span class="bold-red">{{ renderNumber(player().damage) }}</span></div>
        <div>Weapon Damage</div>
        <div class="bold-yellow">{{ renderNumber(player().skillCooldown) }}<span class="white">s</span></div>
        <div>Skill Cooldown</div>
      </div>

      <div class="row">
        <div>+<span class="red">{{ renderNumber(player().magicDamage) }}</span></div>
        <div>Magic Damage</div>
        <div class="bold-yellow">{{ renderNumber(player().apr) }}</div>
        <div>APR</div>
      </div>

      <div class="row">
        <div class="bold-red">{{ renderNumber(player().criticalChance) }}<span class="white">%</span></div>
        <div>Critical</div>
        <div class="bold-white">{{ player().armor }}</div>
        <div>Armor</div>
      </div>

      <div class="row">
        <div class="red">{{ renderNumber(player().criticalMultiplier) }}<span class="white">x</span></div>
        <div>Multiplier</div>
        <div class="bold-white">{{ renderNumber(player().armorAbsorption) }}<span class="white">%</span></div>
        <div>absorb vs L<span class="bold-white">{{ player().level }}</span></div>
      </div>

      <div class="row">
        <div class="bold-magenta">{{ renderNumber(player().command) }}</div>
        <div>Command</div>
        <div class="bold-green">{{ renderNumber(player().regeneration) }}</div>
        <div>Regeneration</div>
      </div>

      <div class="row">
        <div>+<span class="magenta">{{ Math.round(player().summoningPower * 100) }}</span><span class="white">%</span></div>
        <div>Summon Power</div>
        <div>+<span class="green">{{ renderNumber(player().healingPower) }}</span>%</div>
        <div>Healing Bonus</div>
      </div>

      <div class="row">
        <div><span class="bold-yellow">{{ renderNumber(player().speed) }}</span>s</div>
        <div>Speed</div>
        <div><span class="bold-cyan">{{ renderNumber(player().focus) }}</span>s</div>
        <div>Focus</div>
      </div>

      <div class="row">
        <div><span class="yellow">{{ renderNumber(player().skillCooldown) }}</span>s</div>
        <div>Skill Cooldown</div>
        <div><span class="cyan">{{ renderNumber(player().spellCooldown) }}</span>s</div>
        <div>Spell Cooldown</div>
      </div>
    </div>

    <div class="resistances">Damage / Resistance</div>

    <div class="damage-types">
      <div class="row">
        <div>+<span class="green">{{ player().damageBonusAcid }}</span></div>
        <div>-<span class="green">{{ player().resistAcid }}</span></div>
        <div>Acid</div>
        <div>+<span class="bold-cyan">{{ player().damageBonusArcane }}</span></div>
        <div>-<span class="bold-cyan">{{ player().resistArcane }}</span></div>
        <div>Arcane</div>
      </div>

      <div class="row">
        <div>+<span class="magenta">{{ player().damageBonusBludgeoning }}</span></div>
        <div>-<span class="magenta">{{ player().resistBludgeoning }}</span></div>
        <div>Bludgeoning</div>
        <div>+<span class="bold-yellow">{{ player().damageBonusElectric }}</span></div>
        <div>-<span class="bold-yellow">{{ player().resistElectric }}</span></div>
        <div>Electric</div>
      </div>

      <div class="row">
        <div>+<span class="red">{{ player().damageBonusPiercing }}</span></div>
        <div>-<span class="red">{{ player().resistPiercing }}</span></div>
        <div>Piercing</div>
        <div>+<span class="bold-red">{{ player().damageBonusFire }}</span></div>
        <div>-<span class="bold-red">{{ player().resistFire }}</span></div>
        <div>Fire</div>
      </div>

      <div class="row">
        <div>+<span class="bold-green">{{ player().damageBonusPoison }}</span></div>
        <div>-<span class="bold-green">{{ player().resistPoison }}</span></div>
        <div>Poison</div>
        <div>+<span class="bold-white">{{ player().damageBonusHoly }}</span></div>
        <div>-<span class="bold-white">{{ player().resistHoly }}</span></div>
        <div>Holy</div>
      </div>

      <div class="row">
        <div>+<span class="bold-red">{{ player().damageBonusSlashing }}</span></div>
        <div>-<span class="bold-red">{{ player().resistSlashing }}</span></div>
        <div>Slashing</div>
        <div>+<span class="bold-blue">{{ player().damageBonusIce }}</span></div>
        <div>-<span class="bold-blue">{{ player().resistIce }}</span></div>
        <div>Ice</div>
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

const { runCommand, fetchItem } = useWebSocket()
const { renderNumber } = useHelpers()

const props = defineProps(['character', 'equipment', 'isPlayer'])

const weapon = ref({})

function player () {
  return props.character || {}
}

function addStatPoint (stat) {
  const command = props.isPlayer ? `point ${stat}` : `order eid:${props.character.eid} point ${stat}`
  runCommand(command)
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
onMounted(() => {
  watchers.push(
    watch(() => state.gameState.equipment, () => {
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

.damage-types {
  display: table;
  margin-bottom: 10px;
  width: 100%;
  .row {
    display: table-row;
    > div {
      display: table-cell;
      &:nth-child(3), &:nth-child(6) {
        text-align: left;
        padding: 0 0px 3px 3px;
        width: 65px;
      }
      &:nth-child(1), &:nth-child(2), &:nth-child(4), &:nth-child(5) {
        text-align: center;
      }
    }
  }
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
        padding: 0 3px 4px 0;
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
          .damage-value {
            font-size: 1.2rem;
          }
          .stat-label {
            font-size: 1.0rem;
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
