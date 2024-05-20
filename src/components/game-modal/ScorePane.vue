<template>
  <div :class="getScrollContainerClass()">
    <SelectGameModalAs></SelectGameModalAs>
    <NGrid cols="1 800:2">
      <NGi class="grid-item">
        <div class="name">{{ player().name }}</div>
        <div class="exp-row">
          <div class="level">
            Level <span class="bold-cyan">{{ player().level }}</span> {{ player().class }}
          </div>
          <div class="exp">
            <span class="bold-cyan">{{ player().xp }}</span><span class="black">/</span><span class="cyan">{{ player().xpForNextLevel }}</span> EXP
          </div>
          <div class="tnl">
            <span class="bold-yellow">{{ player().xpForNextLevel - player().xp }}</span> TNL
          </div>
        </div>
        <div class="experience"></div>
        <NProgress
          :percentage="getExpPercentage()"
          type="line"
          status="default"
          border-radius="0px"
          :show-indicator="false"
        ></NProgress>
      </NGi>

      <NGi class="grid-item">
        <div class="vital">
          <div class="amount">
            <span class="bold-green">{{ player().hp }}</span>
            <span class="black">/</span>
            <span class="bold-green">{{ player().maxHp }}</span>
          </div>
          <div class="label bold-green">
            HP (Health)
          </div>
          <div class="progress">
            <NProgress
              :percentage="getHpPercentage()"
              type="line"
              status="success"
              border-radius="0px"
              :show-indicator="false"
            ></NProgress>
          </div>
        </div>

        <div class="vital">
          <div class="amount">
            <span class="bold-cyan">{{ player().energy }}</span>
            <span class="black">/</span>
            <span class="bold-cyan">{{ player().maxEnergy }}</span>
          </div>
          <div class="label bold-cyan">
            EN (Energy)
          </div>
          <div class="progress">
            <NProgress
              :percentage="player().energy / player().maxEnergy * 100"
              type="line"
              status="default"
              border-radius="0px"
              :show-indicator="false"
            ></NProgress>
          </div>
        </div>

        <div class="vital">
          <div class="amount">
            <span class="bold-yellow">{{ player().stamina }}</span>
            <span class="black">/</span>
            <span class="bold-yellow">{{ player().maxStamina }}</span>
          </div>
          <div class="label bold-yellow">
            ST (Stamina)
          </div>
          <div class="progress">
            <NProgress
              :percentage="player().stamina / player().maxStamina * 100"
              type="line"
              status="warning"
              border-radius="0px"
              :show-indicator="false"
            ></NProgress>
          </div>
        </div>

        <div class="vital">
          <div class="amount">
            <span class="bold-magenta">{{ player().food }}</span>
            <span class="black">/</span>
            <span class="bold-magenta">{{ player().maxFood }}</span>
          </div>
          <div class="label bold-magenta">
            Food
          </div>
          <div class="progress">
            <NProgress
              :percentage="player().food / player().maxFood * 100"
              type="line"
              border-radius="0px"
              color="#b4009e"
              :show-indicator="false"
            ></NProgress>
          </div>
        </div>
      </NGi>
    </NGrid>

    <div class="space"></div>

    <NGrid cols="2 800:4">
      <NGi class="grid-item">
        <div class="ability-point">
          <div class="ability-point-value">
            <span class="bold-red">{{ player()._strength }}</span> <span class="black">+</span>
            <span class="red">{{ player().strength - player()._strength }}</span>
          </div>
          <div class="ability-point-label bold-red">Strength</div>

          <div class="add-point-button" v-if="player().abilityPoints > 0">
            <NButton ghost size="tiny" class="spend-point-button selectable" @click="spendPoint('strength')">
              <div class="column">
                <NIcon><AddFilled></AddFilled></NIcon>
                <div class="spend-point">Spend Point</div>
                <div class="points-remaining">{{ player().abilityPoints }} remaining</div>
              </div>
            </NButton>
          </div>

          <div class="ability-bonus">
            <div class="value bold-green">{{ player().strengthHpBonus }}</div>
            <div class="label">Max Health</div>
          </div>
          <div class="ability-bonus">
            <div class="value bold-yellow">{{ player().strengthStaminaBonus }}</div>
            <div class="label">Max Stamina</div>
          </div>
          <div class="ability-bonus">
            <div class="value bold-red">{{ player().strengthDamageBonus }}</div>
            <div class="label">Damage</div>
          </div>
          <div class="ability-bonus">
            <div class="value red">{{ player().strengthResistBonus }}</div>
            <div class="label">Resist Physical</div>
          </div>
        </div>
      </NGi>

      <NGi class="grid-item">
        <div class="ability-point">
          <div class="ability-point-value">
            <span class="bold-yellow">{{ player()._agility }}</span> <span class="black">+</span>
            <span class="yellow">{{ player().agility - player()._agility }}</span>
          </div>
          <div class="ability-point-label bold-yellow">Agility</div>
          <div class="add-point-button" v-if="player().abilityPoints > 0">
            <NButton ghost size="tiny" class="spend-point-button selectable" @click="spendPoint('agility')">
              <div class="column">
                <NIcon><AddFilled></AddFilled></NIcon>
                <div class="spend-point">Spend Point</div>
                <div class="points-remaining">{{ player().abilityPoints }} remaining</div>
              </div>
            </NButton>
          </div>
          <div class="ability-bonus">
            <div class="value bold-yellow">{{ player().agilitySpeedBonus }}</div>
            <div class="label">Speed</div>
          </div>
          <div class="ability-bonus">
            <div class="value yellow">{{ renderNumber(player().agilitySkillCooldownBonus) }}<span class="black">s</span></div>
            <div class="label">Skill Cooldown</div>
          </div>
          <div class="ability-bonus">
            <div class="value bold-red">{{ renderNumber(player().agilityCriticalBonus) }}<span class="black">%</span></div>
            <div class="label">Critical Hit</div>
          </div>
          <div class="ability-bonus">
            <div class="value red">{{ renderNumber(player().agilityCriticalMultiplierBonus) }}<span class="black">x</span></div>
            <div class="label">Multiplier</div>
          </div>
        </div>
      </NGi>

      <NGi class="grid-item">
        <div class="ability-point">
          <div class="ability-point-value">
            <span class="bold-cyan">{{ player()._magic }}</span> <span class="black">+</span>
            <span class="cyan">{{ player().magic - player()._magic }}</span>
          </div>
          <div class="ability-point-label bold-cyan">Magic</div>
          <div class="add-point-button" v-if="player().abilityPoints > 0">
            <NButton ghost size="tiny" class="spend-point-button selectable" @click="spendPoint('magic')">
              <div class="column">
                <NIcon><AddFilled></AddFilled></NIcon>
                <div class="spend-point">Spend Point</div>
                <div class="points-remaining">{{ player().abilityPoints }} remaining</div>
              </div>
            </NButton>
          </div>
          <div class="ability-bonus">
            <div class="value bold-white">{{ player().magicEnergyBonus }}</div>
            <div class="label">Max Energy</div>
          </div>
          <div class="ability-bonus">
            <div class="value magenta">{{ renderNumber(player().magicSpellCooldownBonus) }}<span class="black">s</span></div>
            <div class="label">Spell Cooldown</div>
          </div>
          <div class="ability-bonus">
            <div class="value bold-magenta">{{ player().magicDamageBonus }}</div>
            <div class="label">Magic Damage</div>
          </div>
          <div class="ability-bonus">
            <div class="value bold-cyan">{{ player().magicResistBonus }}</div>
            <div class="label">Resist Magic</div>
          </div>
        </div>
      </NGi>

      <NGi class="grid-item">
        <div class="ability-point">
          <div class="ability-point-value">
            <span class="bold-green">{{ player()._spirit }}</span> <span class="black">+</span>
            <span class="green">{{ player().spirit - player()._spirit }}</span>
          </div>
          <div class="ability-point-label bold-green">Spirit</div>
          <div class="add-point-button" v-if="player().abilityPoints > 0">
            <NButton ghost size="tiny" class="spend-point-button selectable" @click="spendPoint('spirit')">
              <div class="column">
                <NIcon><AddFilled></AddFilled></NIcon>
                <div class="spend-point">Spend Point</div>
                <div class="points-remaining">{{ player().abilityPoints }} remaining</div>
              </div>
            </NButton>
          </div>
          <div class="ability-bonus">
            <div class="value bold-white">{{ player().spiritEnergyBonus }}</div>
            <div class="label">Max Energy</div>
          </div>
          <div class="ability-bonus">
            <div class="value bold-blue">{{ player().spiritFocusBonus }}</div>
            <div class="label">Focus</div>
          </div>
          <div class="ability-bonus">
            <div class="value bold-green">{{ player().spiritCommandBonus }}</div>
            <div class="label">Command</div>
          </div>
          <div class="ability-bonus">
            <div class="value green">{{ player().spiritResistBonus }}</div>
            <div class="label">Resist Spirit</div>
          </div>
        </div>
      </NGi>

    </NGrid>

    <div class="space"></div>

    <h3 class="bold-white">Statistics</h3>
    <NGrid cols="1 600:2 800:3">
      <NGi class="grid-item">
        <div class="combat-stat">
          <div class="row">
            <div class="value bold-red">{{ player().damLow }}<span class="black">-</span>{{ player().damHigh }} <span class="black">+</span>{{ getDamageBonus() }}</div>
            <div class="label">Damage</div>
          </div>
          <div class="row">
            <div class="value bold-white">{{ player().armor }}</div>
            <div class="label">Armor</div>
          </div>
          <div class="row">
            <div class="value bold-yellow">{{ player().speed }}</div>
            <div class="label">Speed</div>
          </div>
          <div class="row">
            <div class="value bold-yellow">{{ renderNumber(player().recoveryTime) }}<span class="black">s</span></div>
            <div class="label">Recovery Time</div>
          </div>
          <div class="row">
            <div class="value bold-red">{{ renderNumber(player().criticalChance) }}%</div>
            <div class="label">Critical Chance</div>
          </div>
          <div class="row">
            <div class="value bold-blue">{{ player().focus }}</div>
            <div class="label">Focus</div>
          </div>
          <div class="row">
            <div class="value green">{{ player().command }}</div>
            <div class="label">Command</div>
          </div>
        </div>
      </NGi>

      <NGi class="grid-item">
        <div class="combat-stat">
          <div class="row">
            <div class="value bold-red">{{ renderNumber(player().dpr) }}</div>
            <div class="label"><span :class="getDamageColor()">{{ ucfirst(getDamageType()) }}</span>/Round</div>
          </div>        
          <div class="row">
            <div class="value bold-white">{{ player().armorAbsorbtion }}</div>
            <div class="label">Damage Absorbtion</div>
          </div>
          <div class="row">
            <div class="value bold-green">{{ renderNumber(player().recoveryTimeBonus) }}<span class="black">s</span></div>
            <div class="label">Faster Recovery</div>
          </div>
          <div class="row">
            <div class="value bold-yellow">{{ renderNumber(player().apr) }}</div>
            <div class="label">Attacks/Round</div>
          </div>
          <div class="row">
            <div class="value bold-red">{{ renderNumber(player().criticalMultiplier) }}<span class="black">x</span></div>
            <div class="label">Critical Multiplier</div>
          </div>
          <div class="row">
            <div class="value bold-blue">{{ renderNumber(player().interruptChance) }}<span class="black">%</span></div>
            <div class="label">Interrupt Chance</div>
          </div>
          <div class="row">
            <div class="value"><span class="bold-green">{{ player().numCharmies }}</span><span class="black">/</span><span class="green">{{ player().maxCharmies }}</span></div>
            <div class="label">Charmed Followers</div>
          </div>
        </div>
      </NGi>

      <NGi class="grid-item">
        <div class="combat-stat">
          <div class="row">
            <div class="value bold-green">{{ player().regeneration }}</div>
            <div class="label">Regeneration</div>
          </div>
          <div class="row">
            <div class="value yellow">{{ renderNumber(player().skillCooldown) }}<span class="black">s</span></div>
            <div class="label">Skill Cooldown</div>
          </div>
          <div class="row">
            <div class="value magenta">{{ renderNumber(player().spellCooldown) }}<span class="black">s</span></div>
            <div class="label">Spell Cooldown</div>
          </div>

          <div class="row">
            <div class="value bold-cyan">{{ renderNumber(player().castingTime) }}<span class="black">s</span></div>
            <div class="label">Casting Time</div>
          </div>

          <div class="row">
            <div class="value bold-magenta">{{ player().magicDamage }}</div>
            <div class="label">Magic Damage</div>
          </div>

          <div class="row">
            <div class="value cyan">{{ player().magicFindBonus }}</div>
            <div class="label">Magic Find</div>
          </div>

          <div class="row">
            <div class="value bold-blue">{{ renderNumber(player().xpGainBonus * 100) }}<span class="black">%</span></div>
            <div class="label">EXP Bonus</div>
          </div>
        </div>
      </NGi>
    </NGrid>

    <div class="space"></div>

    <NGrid cols="1 600:3">
      <NGi class="grid-item">
        <div class="resistance">
          <div class="resistance-label"><span class="bold-red">Physical</span> Resistance</div>
          <div class="resistance-row">
            <div class="value bold-magenta">{{ player().resistBludgeoning }}</div>
            <div class="label">Bludgeoning</div>
          </div>
          <div class="resistance-row">
            <div class="value red">{{ player().resistPiercing }}</div>
            <div class="label">Piercing</div>
          </div>
          <div class="resistance-row">
            <div class="value bold-red">{{ player().resistSlashing }}</div>
            <div class="label">Slashing</div>
          </div>
        </div>
      </NGi>

      <NGi class="grid-item">
        <div class="resistance">
          <div class="resistance-label"><span class="bold-cyan">Magic</span> Resistance</div>
          <div class="resistance-row">
            <div class="value bold-cyan">{{ player().resistArcane }}</div>
            <div class="label">Arcane</div>
          </div>
          <div class="resistance-row">
            <div class="value bold-yellow">{{ player().resistElectric }}</div>
            <div class="label">Electric</div>
          </div>
          <div class="resistance-row">
            <div class="value red">{{ player().resistFire }}</div>
            <div class="label">Fire</div>
          </div>
          <div class="resistance-row">
            <div class="value bold-blue">{{ player().resistIce }}</div>
            <div class="label">Ice</div>
          </div>
        </div>
      </NGi>

      <NGi class="grid-item">
        <div class="resistance">
          <div class="resistance-label"><span class="bold-green">Spirit</span> Resistance</div>
          <div class="resistance-row">
            <div class="value bold-white">{{ player().resistAcid }}</div>
            <div class="label">Acid</div>
          </div>
          <div class="resistance-row">
            <div class="value bold-yellow">{{ player().resistHoly }}</div>
            <div class="label">Holy</div>
          </div>
          <div class="resistance-row">
            <div class="value green">{{ player().resistPoison }}</div>
            <div class="label">Poison</div>
          </div>
        </div>
      </NGi>

    </NGrid>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, defineProps, toRefs } from 'vue'
import { state } from '@/static/state'
import { NGrid, NGi, NProgress, NButton, NIcon } from 'naive-ui'

import AddFilled from '@vicons/material/AddFilled'

import SelectGameModalAs from '@/components/game-modal/SelectGameModalAs.vue'

import { DAMAGE_TYPE_COLORS } from '@/static/constants'
import { useWebSocket } from '@/composables/web_socket'
import { useHelpers } from '@/composables/helpers'

const { cmd, fetchItem } = useWebSocket()
const { ucfirst, renderNumber } = useHelpers()

const weapon = ref({})

const props = defineProps(['miniOutputEnabled'])
const { miniOutputEnabled } = toRefs(props)

function spendPoint (stat) {
  if (state.gameModalAs && state.gameState.charmies[state.gameModalAs]) {
    cmd(`order eid:${state.gameModalAs} point ${stat}`)
  } else {
    cmd(`point ${stat}`)
  }
}

function player () {
  if (state.gameModalAs && state.gameState.charmies[state.gameModalAs]) {
    return state.gameState.charmies[state.gameModalAs].stats || {}
  }

  return state.gameState.player || {}
}

function getExpPercentage () {
  return player().xp / player().xpForNextLevel * 100
}

function getHpPercentage () {
  return player().hp / player().maxHp * 100
}

async function setWeapon () {
  let iid = state.gameState.equipment.weapon
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

function getScrollContainerClass () {
  return {
    'scroll-container': true,
    'mini-output-enabled': miniOutputEnabled.value
  }
}

onMounted(() => {
  setWeapon()
})

watch(state.gameState.equipment, () => {
  setWeapon()
})
</script>

<style lang="less" scoped>
.scroll-container {
  height: calc(100vh - 75px);
  overflow-y: scroll;
  max-width: 1200px;
  margin: 0 auto;

  &.mini-output-enabled {
    height: calc(100vh - 225px);
  }

  .space {
    width: 100%;
    height: 20px;
  }

  .name {
    font-size: 24px;
    height: 36px;
  }

  .grid-item {
    display: flex;
    flex-direction: column;
    padding: 5px;
  }

  .exp-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .vital {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    height: 18px;
    .amount {
      width: 160px;
      text-align: right;
      padding-right: 10px;
    }
    .label {
      width: 220px;
    }
    .progress {
      width: 100%;
    }
  }

  .ability-point {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .ability-point-value {
      font-size: 24px;
      line-height: 32px;
      width: 100%;
      text-align: center;
      padding-right: 10px;
      padding-bottom: 0px;
      padding-top: 5px;
    }
    .ability-point-label {
      width: 100%;
      text-align: center;
      font-size: 24px;
      padding-bottom: 5px;
    }
    .add-point-button {
      width: 100%;
      text-align: center;
      padding-bottom: 5px;
      .spend-point-button {
        height: initial;
        padding: 5px 10px;
        .column {
          display: flex;
          flex-direction: column;
          align-items: center;
          .n-icon {
            font-size: 24px;
          }
          .spend-point {
            margin-top: 5px;
          }
          .points-remaining {
            margin-top: 5px;
          }
        }
      }
      &.selected {
        box-shadow: 0 0 5px #f8ff25;
        color: #f8ff25;
      }
    }
    .ability-bonus {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      width: 100%;
      .value {
        text-align: right;
        padding-right: 10px;
        width: 50%;
      }
      .label {
        width: 100%;
        text-align: left;
      }
    }
  }

  h3 {
    font-weight: normal;
    font-size: 24px;
    text-align: center;
    margin: 0;
  }

  .combat-stat {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .row {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      width: 100%;
      .value {
        text-align: right;
        padding-right: 10px;
        width: 40%;
      }
      .label {
        text-align: left;
        color: #cccccc;
      }
    }

  }

  .resistance {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .resistance-label {
      width: 100%;
      text-align: center;
      font-size: 24px;
      padding-bottom: 5px;
    }
    .resistance-row {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      width: 100%;
      .value {
        text-align: right;
        padding-right: 10px;
        width: 75%;
      }
      .label {
        width: 100%;
        text-align: left;
      }
    }
  }
}
</style>