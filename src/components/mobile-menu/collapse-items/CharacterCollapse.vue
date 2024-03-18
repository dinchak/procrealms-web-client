<template>
  <n-collapse-item title="Statistics">

    <div class="ability-points" v-if="player().abilityPoints > 0">
      You have <span class="bold-yellow">{{ player().abilityPoints }}</span> unspent ability points. Use the point command or the <n-icon class="inline"><AddBoxOutlined></AddBoxOutlined></n-icon> symbol below to spend them.
    </div>

    <div class="character-stats">

      <div class="row">
        <div class="col header">
          <div class="stat-header">
            <div class="stat-value">
              <span class="bold-red">{{ player().strength }}</span><span class="black">+</span><span class="red">{{ player().strength - player()._strength }}</span>
            </div>
            <div class="increase-stat">
              <n-icon class="add-point" v-if="player().abilityPoints > 0" @click="addStatPoint('strength')"><AddBoxOutlined></AddBoxOutlined></n-icon>
            </div>
            <div class="stat-label">
              Strength
            </div>
          </div>
        </div>

        <div class="col header">
          <div class="stat-header">
            <div class="stat-value">
              <span class="bold-cyan">{{ player().magic }}</span><span class="black">+</span><span class="cyan">{{ player().magic - player()._magic }}</span>
            </div>
            <div class="increase-stat">
              <n-icon class="add-point" v-if="player().abilityPoints > 0" @click="addStatPoint('magic')"><AddBoxOutlined></AddBoxOutlined></n-icon>
            </div>
            <div class="stat-label">
              Magic
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div class="flex-row">
            <div class="value bold-green">
              {{ player().strengthHpBonus }} 
            </div>
            <div class="bonus">
              Max Health
            </div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value bold-white">
              {{ player().magicEnergyBonus }} 
            </div>
            <div class="bonus">
              Max Energy
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div class="flex-row">
            <div class="value bold-yellow">
              {{ player().strengthStaminaBonus }} 
            </div>
            <div class="bonus">
              Max Stamina
            </div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value magenta">
              {{ renderNumber(player().magicSpellCooldownBonus) }} 
            </div>
            <div class="bonus">
              Spell Cooldown
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div class="flex-row">
            <div class="value bold-red">
              {{ player().strengthDamageBonus }} 
            </div>
            <div class="bonus">
              Damage
            </div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value bold-magenta">
              {{ renderNumber(player().magicDamageBonus) }} 
            </div>
            <div class="bonus">
              Magic Damage
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div class="flex-row">
            <div class="value red">
              {{ player().strengthResistBonus }} 
            </div>
            <div class="bonus">
              Resist Physical
            </div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value bold-cyan">
              {{ renderNumber(player().magicResistBonus) }} 
            </div>
            <div class="bonus">
              Resist Magic
            </div>
          </div>
        </div>
      </div>

      <div class="spacer"></div>

      <div class="row">
        <div class="col header">
          <div class="stat-header">
            <div class="stat-value">
              <span class="bold-yellow">{{ player().agility }}</span><span class="black">+</span><span class="yellow">{{ player().agility - player()._agility }}</span>
            </div>
            <div class="increase-stat">
              <n-icon class="add-point" v-if="player().abilityPoints > 0" @click="addStatPoint('agility')"><AddBoxOutlined></AddBoxOutlined></n-icon>
            </div>
            <div class="stat-label">
              Agility
            </div>
          </div>
        </div>

        <div class="col header">
          <div class="stat-header">
            <div class="stat-value">
              <span class="bold-green">{{ player().spirit }}</span><span class="black">+</span><span class="green">{{ player().spirit - player()._spirit }}</span>
            </div>
            <div class="increase-stat">
              <n-icon class="add-point" v-if="player().abilityPoints > 0" @click="addStatPoint('spirit')"><AddBoxOutlined></AddBoxOutlined></n-icon>
            </div>
            <div class="stat-label">
              Spirit
            </div>
          </div>
        </div>

      </div>

      <div class="row">
        <div class="col">
          <div class="flex-row">
            <div class="value bold-yellow">
              {{ player().agilitySpeedBonus }} 
            </div>
            <div class="bonus">
              Speed
            </div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value bold-white">
              {{ player().spiritEnergyBonus }}
            </div>
            <div class="bonus">
              Max Energy
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div class="flex-row">
            <div class="value yellow">
              {{ renderNumber(player().agilitySkillCooldownBonus) }} 
            </div>
            <div class="bonus">
              Skill Cooldown
            </div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value bold-blue">
              {{ player().spiritFocusBonus }} 
            </div>
            <div class="bonus">
              Focus
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div class="flex-row">
            <div class="value bold-red">
              {{ renderNumber(player().agilityCriticalBonus) }}
            </div>
            <div class="bonus">
              % Critical Hit
            </div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value bold-green">
              {{ player().spiritCommandBonus }}
            </div>
            <div class="bonus">
              Command
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div class="flex-row">
            <div class="value red">
              {{ renderNumber(player().agilityCriticalMultiplierBonus) }}
            </div>
            <div class="bonus">
              x Multiplier
            </div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value green">
              {{ player().spiritResistBonus }} 
            </div>
            <div class="bonus">
              Resist Spirit
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="subtitle"><span class="title">Combat</span></div>

    <div class="character-stats">
      <div class="damage-row">
        <div class="flex-row">
          <div :class="'value ' + getDamageColor()">{{ player().damLow }}<span class="black">-</span>{{ player().damHigh }} <span class="black">+</span>{{ getDamageBonus() }}</div>
        </div>
        <div class="flex-row">
          <div class="label">
            <span :class="getDamageColor()">{{ getDamageType() }}</span>
            damage
          </div>
        </div>
      </div>
      <div class="damage-row">
        <div class="flex-row">
          <div :class="'value ' + getDamageColor()">{{ renderNumber(player().dpr) }}</div>
        </div>
        <div class="flex-row">
          <div class="label">avg/round</div>
        </div>
      </div>
    </div>

    <div class="character-stats">
      <div class="combat-row">
        <div class="flex-row">
          <div class="left-label">Armor</div>
          <div class="left-value bold-white">{{ player().armor }}</div>
          <div class="right-value bold-white">{{ player().armorAbsorbtion }}</div>
          <div class="right-label">absorbtion</div>
        </div>
      </div>

      <div class="combat-row">
        <div class="flex-row">
          <div class="left-label">Speed</div>
          <div class="left-value bold-yellow">{{ player().speed }}</div>
          <div class="right-value bold-green">{{ renderNumber(player().recoveryTime) }}<span class="white">s</span></div>
          <div class="right-label">recovery</div>
        </div>
      </div>

      <div class="combat-row">
        <div class="flex-row">
          <div class="left-label">Recovery</div>
          <div class="left-value bold-yellow">{{ renderNumber(player().recoveryTime) }}<span class="white">s</span></div>
          <div class="right-value bold-yellow">{{ renderNumber(player().apr) }}</div>
          <div class="right-label">attacks/round</div>
        </div>
      </div>

      <div class="combat-row">
        <div class="flex-row">
          <div class="left-label">Critical</div>
          <div class="left-value bold-red">{{ renderNumber(player().critical) }}<span class="white">%</span></div>
          <div class="right-value bold-red">{{ renderNumber(player().criticalMultiplier) }}<span class="white">x</span></div>
          <div class="right-label">multiplier</div>
        </div>
      </div>

      <div class="combat-row">
        <div class="flex-row">
          <div class="left-label">Focus</div>
          <div class="left-value bold-blue">{{ renderNumber(player().focus) }}</div>
          <div class="right-value bold-blue">{{ renderNumber(player().interruptChance) }}<span class="white">%</span></div>
          <div class="right-label">interrupt</div>
        </div>
      </div>

      <div class="combat-row">
        <div class="flex-row">
          <div class="left-label">Command</div>
          <div class="left-value bold-green">{{ renderNumber(player().focus) }}</div>
          <div class="right-value bold-green">{{ player().numCharmies }}<span class="white">/</span><span class="green">{{ player().maxCharmies }}</span></div>
          <div class="right-label">followers</div>
        </div>
      </div>
    </div>

    <div class="spacer"></div>

    <div class="character-stats">
      <div class="row">
        <div class="col">
          <div class="flex-row">
            <div class="value bold-cyan">
              {{ renderNumber(player().castingTime) }}<span class="white">s</span>
            </div>
            <div class="bonus">
              Casting Time
            </div>
          </div>
        </div>

        <div class="col">
          <div class="flex-row">
            <div class="value bold-magenta">
              {{ renderNumber(player().magicDamage) }}
            </div>
            <div class="bonus">
              Magic Damage
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div class="flex-row">
            <div class="value magenta">
              {{ renderNumber(player().spellCooldown) }}<span class="white">s</span>
            </div>
            <div class="bonus">
              Spell Cooldown
            </div>
          </div>
        </div>

        <div class="col">
          <div class="flex-row">
            <div class="value bold-blue">
              {{ renderNumber(player().magicFindBonus) }}
            </div>
            <div class="bonus">
              Magic Find
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div class="flex-row">
            <div class="value yellow">
              {{ renderNumber(player().skillCooldown) }}<span class="white">s</span>
            </div>
            <div class="bonus">
              Skill Cooldown
            </div>
          </div>
        </div>

        <div class="col">
          <div class="flex-row">
            <div class="value bold-yellow">
              {{ renderNumber(player().xpBonus) }}<span class="white">%</span>
            </div>
            <div class="bonus">
              EXP Bonus
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="subtitle"><span class="title">Resistances</span></div>

    <div class="character-stats">
      <div class="resist-row">
        <div class="col">
          <div class="flex-row">
            <div class="value magenta">{{ player().resistBludgeoning }}</div>
            <div class="label">Bludgeon</div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value bold-cyan">{{ player().resistArcane }}</div>
            <div class="label">Arcane</div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value bold-yellow">{{ player().resistHoly }}</div>
            <div class="label">Acid</div>
          </div>
        </div>
      </div>


      <div class="resist-row">
        <div class="col">
          <div class="flex-row">
            <div class="value red">{{ player().resistPiercing }}</div>
            <div class="label">Pierce</div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value bold-yellow">{{ player().resistElectric }}</div>
            <div class="label">Electric</div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value bold-white">{{ player().resistHoly }}</div>
            <div class="label">Holy</div>
          </div>
        </div>
      </div>

      <div class="resist-row">
        <div class="col">
          <div class="flex-row">
            <div class="value bold-red">{{ player().resistSlashing }}</div>
            <div class="label">Slash</div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value red">{{ player().resistFire }}</div>
            <div class="label">Fire</div>
          </div>
        </div>
        <div class="col">
          <div class="flex-row">
            <div class="value green">{{ player().resistPoison }}</div>
            <div class="label">Poison</div>
          </div>
        </div>
      </div>

      <div class="resist-row">
        <div class="col"></div>
        <div class="col">
          <div class="flex-row">
            <div class="value bold-blue">{{ player().resistIce }}</div>
            <div class="label">Ice</div>
          </div>
        </div>
        <div class="col"></div>
      </div>
    </div>
  </n-collapse-item>
</template>

<script setup>
import { NCollapseItem, NIcon } from 'naive-ui'
import { defineProps, ref, onMounted, watch } from 'vue'

import AddBoxOutlined from '@vicons/material/AddBoxOutlined'

import { constants } from '@/composables/constants/constants'
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
  return constants.DAMAGE_TYPE_COLORS[getDamageType()]
}

function getDamageType () {
  if (weapon.value && weapon.value.damageType) {
    return weapon.value.damageType
  } else {
    return 'bludgeoning'
  }
}

onMounted(() => {
  setWeapon()
})

watch(props.equipment, () => {
  setWeapon()
})
</script>

<style lang="less">

.subtitle {
  font-size: 16px;
  text-align: center;
  margin-top: 10px;
  margin-left: -10px;
  .title {
    border-bottom: 1px solid #333;
  }
}

.character-stats {
  display: table;
  width: 100%;
  border-spacing: 5px;
  margin-left: -10px;

  .row {
    display: table-row;

    .col {
      display: table-cell;
      width: 50%;
      .stat-header {
        color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        .stat-label {
          font-size: 16px;
          border-bottom: 1px solid #333;
        }
        .stat-value {
          font-size: 28px;
          line-height: 26px;
        }
      }

      .flex-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        line-height: 10px;
        .value {
          width: 42px;
          margin-right: 5px;
          text-align: right;
        }
        .bonus {
          color: #aaa;
          font-size: 11px;
          line-height: 10px;
          width: 83px;
        }
      }
    }
  }

  .damage-row {
    display: table-row;
    margin-bottom: 20px;
    .flex-row {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      .value {
        font-size: 24px;
        line-height: 20px;
      }
      .label {
        font-size: 11px;
        line-height: 14px;
        color: #aaa;
        margin-left: 5px;
        margin-bottom: 5px;
      }
    }
  }

  .combat-row {
    display: table-row;

    .flex-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      line-height: 14px;

      .left-label {
        font-size: 11px;
        line-height: 10px;
        width: 70px;
        text-align: right;
        margin-right: 5px;
        color: #aaa;
      }
      .left-value {
        width: 50px;
        text-align: left;
      }

      .right-value {
        margin-right: 5px;
        text-align: right;
        width: 50px;
      }
      .right-label {
        text-align: left;
        color: #aaa;
        font-size: 11px;
        line-height: 10px;
        width: 70px;
      }
    }
  }

  .resist-row {
    display: table-row;
    width: 100%;
    .col {
      display: table-cell;
      .flex-row {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 10px;
        .value {
          width: 30px;
          text-align: right;
        }
        .label {
          width: 40px;
          color: #aaa;
          font-size: 11px;
          text-align: left;
          line-height: 10px;
          margin-left: 5px;
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

.inline {
  font-size: 1rem;
  display: inline-flex;
  vertical-align: middle;
}

.spacer {
  width: 100%;
  height: 10px;
}
</style>
