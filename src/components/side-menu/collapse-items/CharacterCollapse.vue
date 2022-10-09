<template>
  <n-collapse-item title="Statistics">

    <div class="ability-points" v-if="player().abilityPoints > 0">
      You have <span class="bold-yellow">{{ player().abilityPoints }}</span> unspent ability points. Use the point command to spend them.
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Strength</div>
        <div class="value bold-red">{{ player().strength }}<span class="black">|</span><span class="red">{{ player()._strength }}</span></div>
      </div>
      <div class="stat">
        <div class="label">Magic</div>
        <div class="value bold-cyan">{{ player().magic }}<span class="black">|</span><span class="cyan">{{ player()._magic }}</span></div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Agility</div>
        <div class="value bold-yellow">{{ player().agility }}<span class="black">|</span><span class="yellow">{{ player()._agility }}</span></div>
      </div>
      <div class="stat">
        <div class="label">Spirit</div>
        <div class="value bold-green">{{ player().spirit }}<span class="black">|</span><span class="green">{{ player()._spirit }}</span></div>
      </div>
    </div>

    <div class="stat-title bold-white">Combat</div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Damage</div>
        <div class="value red">{{ player().damLow }}-{{ player().damHigh }}</div>
      </div>
      <div class="stat">
        <div class="label">Avg/Round</div>
        <div class="value red">{{ renderNumber(player().dpr) }}</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Speed</div>
        <div class="value bold-yellow">{{ player().speed }}</div>
      </div>
      <div class="stat">
        <div class="label">Recover</div>
        <div class="value yellow">{{ player().battleSpeed }}</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Critical</div>
        <div class="value bold-red">{{ renderNumber(player().criticalChance) }}%</div>
      </div>
      <div class="stat">
        <div class="label">Multiplier</div>
        <div class="value red">{{ renderNumber(player().criticalMultiplier) }}x</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Focus</div>
        <div class="value bold-blue">{{ player().focus }}</div>
      </div>
      <div class="stat">
        <div class="label">Interrupt</div>
        <div class="value bold-blue">{{ renderNumber(player().focusChance) }}%</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Cast Time</div>
        <div class="value bold-cyan">{{ renderNumber(player().magicCastingTimeBonus) }}s</div>
      </div>
      <div class="stat">
        <div class="label">Cooldown</div>
        <div class="value bold-magenta">{{ renderNumber(player().cooldownTime) }}s</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Armor</div>
        <div class="value bold-white">{{ player().armor }}</div>
      </div>
      <div class="stat">
        <div class="label">Absorb</div>
        <div class="value bold-white">{{ player().armorAbsorbtion }}%</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Regen</div>
        <div class="value bold-green">{{ player().regeneration }}</div>
      </div>
      <div class="stat">
        <div class="label">XP Bonus</div>
        <div class="value bold-cyan">{{ renderNumber(player().xpGainBonus * 100) }}%</div>
      </div>
    </div>

    <div class="stat-title bold-white">Resistance</div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Bludgeon</div>
        <div class="value yellow">{{ player().resistBludgeoning }}</div>
      </div>
      <div class="stat">
        <div class="label">Slash</div>
        <div class="value bold-red">{{ player().resistSlashing }}</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Pierce</div>
        <div class="value red">{{ player().resistPiercing }}</div>
      </div>
      <div class="stat">
        <div class="label">Holy</div>
        <div class="value bold-white">{{ player().resistHoly }}</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Arcane</div>
        <div class="value bold-cyan">{{ player().resistArcane }}</div>
      </div>
      <div class="stat">
        <div class="label">Ice</div>
        <div class="value bold-blue">{{ player().resistIce }}</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Electric</div>
        <div class="value bold-yellow">{{ player().resistElectric }}</div>
      </div>
      <div class="stat">
        <div class="label">Fire</div>
        <div class="value bold-red">{{ player().resistFire }}</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Poison</div>
        <div class="value green">{{ player().resistPoison }}</div>
      </div>
      <div class="stat">
        <div class="label">Acid</div>
        <div class="value bold-green">{{ player().resistAcid }}</div>
      </div>
    </div>

  </n-collapse-item>
</template>

<script setup>
import { NCollapseItem } from 'naive-ui'

import { state } from '@/composables/state'

function player () {
  return state.gameState.player || {}
}

function renderNumber (value, digits = 2) {
  if (typeof value == 'undefined') {
    return 0
  }
  if (value == Math.floor(value)) return Math.round(value) + ''
  return value.toFixed(digits)
}
</script>

<style lang="less">
.stat-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .stat {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .label {
      color: #aaa;
      width: 70px;
      text-align: right;
    }
    .value {
      margin-left: 5px;
      width: 45px;
    }
  }
}

.stat-title {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ability-points {
  text-align: center;
  margin-bottom: 10px;
}
</style>
