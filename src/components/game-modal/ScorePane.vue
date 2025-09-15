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
          <div v-if="player().level < 100" class="exp">
            <span class="bold-cyan">{{ player().xp }}</span><span class="black">/</span><span class="cyan">{{ player().xpForNextLevel }}</span> EXP
          </div>
          <div v-if="player().level < 100" class="tnl">
            <span class="bold-yellow">{{ player().xpForNextLevel - player().xp }}</span> TNL
          </div>
        </div>
        <div v-if="player().level < 100" class="experience"></div>
        <NProgress
          v-if="player().level < 100"
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
            <div class="value">+<span class="bold-red">{{ player().strengthDamageBonus }}</span></div>
            <div class="label">Weapon Damage</div>
          </div>
          <div class="ability-bonus">
            <div class="value">+<span class="red">{{ renderNumber(player().strengthCriticalMultiplierBonus) }}</span>x</div>
            <div class="label">Critical Multiplier</div>
          </div>
          <div class="ability-bonus">
            <div class="value">+<span class="bold-green">{{ player().strengthHpBonus }}</span></div>
            <div class="label">Max Health</div>
          </div>
          <div class="ability-bonus">
            <div class="value">+<span class="bold-yellow">{{ player().strengthStaminaBonus }}</span></div>
            <div class="label">Max Stamina</div>
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
            <div class="value">+<span class="bold-yellow">{{ player().agilityMovementBonus }}</span></div>
            <div class="label">Movement</div>
          </div>
          <div class="ability-bonus">
            <div class="value">+<span class="bold-red">{{ renderNumber(player().agilityCriticalBonus) }}</span>%</div>
            <div class="label">Critical Hit</div>
          </div>
          <div class="ability-bonus">
            <div class="value">+<span class="bold-yellow">{{ renderNumber(player().agilitySpeedBonus) }}</span>s</div>
            <div class="label">Speed</div>
          </div>
          <div class="ability-bonus">
            <div class="value">+<span class="yellow">{{ renderNumber(player().agilitySkillCooldownBonus) }}</span>s</div>
            <div class="label">Skill Cooldown</div>
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
            <div class="value">+<span class="bold-magenta">{{ player().magicDamageBonus }}</span></div>
            <div class="label">Magic Damage</div>
          </div>
          <div class="ability-bonus">
            <div class="value">+<span class="bold-white">{{ player().magicEnergyBonus }}</span></div>
            <div class="label">Max Energy</div>
          </div>
          <div class="ability-bonus">
            <div class="value">+<span class="bold-cyan">{{ renderNumber(player().magicFocusBonus) }}</span>s</div>
            <div class="label">Focus</div>
          </div>
          <div class="ability-bonus">
            <div class="value">+<span class="cyan">{{ renderNumber(player().magicSpellCooldownBonus) }}</span>s</div>
            <div class="label">Recharge</div>
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
            <div class="value">+<span class="green">{{ player().spiritHealingPowerBonus }}</span>%</div>
            <div class="label">Healing Power</div>
          </div>
          <div class="ability-bonus">
            <div class="value">+<span class="bold-white">{{ player().spiritEnergyBonus }}</span></div>
            <div class="label">Max Energy</div>
          </div>
          <div class="ability-bonus">
            <div class="value">+<span class="magenta">{{ player().spiritSummoningPowerBonus }}</span>%</div>
            <div class="label">Summoning Power</div>
          </div>
          <div class="ability-bonus">
            <div class="value">+<span class="bold-magenta">{{ player().spiritCommandBonus }}</span></div>
            <div class="label">Command</div>
          </div>
        </div>
      </NGi>

    </NGrid>

    <NGrid cols="1 500:2">
      <NGi class="grid-item">
        <div class="weapon-stat">
          <div :class="'value ' + getDamageColor()">
            {{ player().damLow }}<span class="white">-</span>{{ player().damHigh }} <span class="white">+</span>{{ getDamageBonus() }}
          </div>
          <div class="label">
            <span :class="getDamageColor()">{{ getDamageType() }}</span> damage
          </div>
        </div>
      </NGi>
      <NGi class="grid-item">
        <div class="weapon-stat">
          <div :class="'value ' + getDamageColor()">
            {{ renderNumber(player().dpr) }}
          </div>
          <div class="label">
            avg/round
          </div>
        </div>
      </NGi>
    </NGrid>


    <NGrid cols="2 800:4">
      <NGi class="grid-item">
        <div class="combat-stat">
          <div>+<span class="red">{{ renderNumber(player().damage) }}</span></div>
          <div>Weapon Damage</div>
        </div>
        <div class="combat-stat">
          <div>+<span class="red">{{ renderNumber(player().magicDamage) }}</span></div>
          <div>Magic Damage</div>
        </div>
        <div class="combat-stat">
          <div class="bold-white">{{ player().armor }}</div>
          <div>Armor</div>
        </div>
        <div class="combat-stat">
          <div class="bold-white">{{ renderNumber(player().armorAbsorption) }}<span class="white">%</span></div>
          <div>absorb vs L<span class="bold-white">{{ player().level }}</span></div>
        </div>
      </NGi>

      <NGi class="grid-item">
        <div class="combat-stat">
          <div class="bold-yellow">{{ renderNumber(player().recoveryTime) }}<span class="white">s</span></div>
          <div>Attack Speed</div>
        </div>
        <div class="combat-stat">
          <div class="bold-yellow">{{ renderNumber(player().apr) }}</div>
          <div>Attacks per Round</div>
        </div>
        <div class="combat-stat">
          <div class="bold-red">{{ renderNumber(player().criticalChance) }}<span class="white">%</span></div>
          <div>Critical</div>
        </div>
        <div class="combat-stat">
          <div class="red">{{ renderNumber(player().criticalMultiplier) }}<span class="white">x</span></div>
          <div>Multiplier</div>
        </div>
      </NGi>

      <NGi class="grid-item">
        <div class="combat-stat">
          <div><span class="bold-yellow">{{ renderNumber(player().speed) }}</span>s</div>
          <div>Speed</div>
        </div>
        <div class="combat-stat">
          <div><span class="yellow">{{ renderNumber(player().skillCooldown) }}</span>s</div>
          <div>Skill Cooldown</div>
        </div>
        <div class="combat-stat">
          <div><span class="bold-cyan">{{ renderNumber(player().focus) }}</span>s</div>
          <div>Focus</div>
        </div>
        <div class="combat-stat">
          <div><span class="cyan">{{ renderNumber(player().spellCooldown) }}</span>s</div>
          <div>Spell Cooldown</div>
        </div>
      </NGi>

      <NGi class="grid-item">
        <div class="combat-stat">
          <div class="bold-magenta">{{ renderNumber(player().command) }}</div>
          <div>Command</div>
        </div>
        <div class="combat-stat">
          <div>+<span class="magenta">{{ Math.round(player().summoningPower) }}</span><span class="white">%</span></div>
          <div>Summoning Power</div>
        </div>
        <div class="combat-stat">
          <div class="bold-green">{{ renderNumber(player().regeneration) }}</div>
          <div>Regeneration</div>
        </div>
        <div class="combat-stat">
          <div>+<span class="green">{{ renderNumber(player().healingPower) }}</span>%</div>
          <div>Healing Power</div>
        </div>
      </NGi>
    </NGrid>

    <div class="space"></div>
    <h3>Damage / Resistance</h3>
    <div class="space"></div>

    <NGrid cols="2">
      <NGi class="grid-item">
        <div class="resistance-stat">
          <div>+<span class="green">{{ player().damageBonusAcid }}</span></div>
          <div>-<span class="green">{{ player().resistAcid }}</span></div>
          <div>Acid</div>
        </div>
        <div class="resistance-stat">
          <div>+<span class="magenta">{{ player().damageBonusBludgeoning }}</span></div>
          <div>-<span class="magenta">{{ player().resistBludgeoning }}</span></div>
          <div>Bludgeoning</div>
        </div>
        <div class="resistance-stat">
          <div>+<span class="red">{{ player().damageBonusPiercing }}</span></div>
          <div>-<span class="red">{{ player().resistPiercing }}</span></div>
          <div>Piercing</div>
        </div>
        <div class="resistance-stat">
          <div>+<span class="bold-green">{{ player().damageBonusPoison }}</span></div>
          <div>-<span class="bold-green">{{ player().resistPoison }}</span></div>
          <div>Poison</div>
        </div>
        <div class="resistance-stat">
          <div>+<span class="bold-red">{{ player().damageBonusSlashing }}</span></div>
          <div>-<span class="bold-red">{{ player().resistSlashing }}</span></div>
          <div>Slashing</div>
        </div>
      </NGi>
      <NGi class="grid-item">
        <div class="resistance-stat">
          <div>+<span class="bold-cyan">{{ player().damageBonusArcane }}</span></div>
          <div>-<span class="bold-cyan">{{ player().resistArcane }}</span></div>
          <div>Arcane</div>
        </div>
        <div class="resistance-stat">
          <div>+<span class="bold-yellow">{{ player().damageBonusElectric }}</span></div>
          <div>-<span class="bold-yellow">{{ player().resistElectric }}</span></div>
          <div>Electric</div>
        </div>
        <div class="resistance-stat">
          <div>+<span class="bold-red">{{ player().damageBonusFire }}</span></div>
          <div>-<span class="bold-red">{{ player().resistFire }}</span></div>
          <div>Fire</div>
        </div>
        <div class="resistance-stat">
          <div>+<span class="bold-white">{{ player().damageBonusHoly }}</span></div>
          <div>-<span class="bold-white">{{ player().resistHoly }}</span></div>
          <div>Holy</div>
        </div>
        <div class="resistance-stat">
          <div>+<span class="bold-blue">{{ player().damageBonusIce }}</span></div>
          <div>-<span class="bold-blue">{{ player().resistIce }}</span></div>
          <div>Ice</div>
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

const { runCommand, fetchItem } = useWebSocket()
const { renderNumber } = useHelpers()

const weapon = ref({})

const props = defineProps(['miniOutputEnabled'])
const { miniOutputEnabled } = toRefs(props)

function spendPoint (stat) {
  if (state.gameModalAs && state.gameState.charmies[state.gameModalAs]) {
    runCommand(`order eid:${state.gameModalAs} point ${stat}`)
  } else {
    runCommand(`point ${stat}`)
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
    flex-direction: row;
    justify-content: center;
    align-items: center;
    > :nth-child(1) {
      text-align: right;
      padding-right: 10px;
      width: 50%;
    }
    > :nth-child(2) {
      width: 100%;
      text-align: left;
    }
  }

  .resistance-stat {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    > :nth-child(1) {
      text-align: right;
      padding-right: 10px;
      width: 50%;
    }
    > :nth-child(2) {
      padding-right: 10px;
      width: 20px;
    }
    > :nth-child(3) {
      width: 50%;
      text-align: left;
    }
  }

  .weapon-stat {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    .value {
      font-size: 24px;
      line-height: 32px;
      width: 100%;
      text-align: center;
      padding-right: 10px;
      padding-bottom: 0px;
      padding-top: 5px;
    }
    .label {
      width: 100%;
      text-align: center;
      font-size: 24px;
      padding-bottom: 5px;
    }
  }

}
</style>