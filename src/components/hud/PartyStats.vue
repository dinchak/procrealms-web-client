<template>
  <div class="party-health-container">
    <div class="party-health-inner">
      <div class="party-member" v-for="member in getPartyMembers()" :key="member.eid">

        <div class="name"
          v-html-safe="ansiToHtml(`${ANSI.reset}L${ANSI.boldWhite}${member.level} ${member.colorName}`)"
        ></div>

        <div class="vital-row">
          <VitalsBar
            :hpLabel="member.hp"
            :hpPercent="member.hp / member.maxHp * 100"
            :energyLabel="member.energy"
            :energyPercent="member.energy / member.maxEnergy * 100"
            :staminaLabel="member.stamina"
            :staminaPercent="member.stamina / member.maxStamina * 100"
          ></VitalsBar>
        </div>

        <div class="bottom-bar">
          <AffectsBar :entity="member" :affects="member.affects" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ANSI } from '@/static/constants'
import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import AffectsBar from '../common/AffectsBar.vue'
import VitalsBar from '@/components/common/VitalsBar.vue'

const { ansiToHtml } = useHelpers()

function getPartyMembers () {
  let members = Object.values(state.gameState.party)
  members.sort((a, b) => { return a.sort < b.sort ? -1 : 1 })
  return members
}
</script>
<style lang="less" scoped>
.party-health-container {
  background-color: rgb(16, 18, 22);
  overflow-x: auto;

  .party-health-inner {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 10px;
    width: 0;
  }

  .party-member {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    flex: 0 0 auto;
    width: 201px;
    gap: 3px;

    .bottom-bar {
      display: flex;
      justify-content: space-between;
      gap: 3px;
    }

    .food-bar {
      border: 1px solid #d15959;
      width: 75px;

      .food-bar-fill {
        background: linear-gradient(to right, #6c2020, #a42121);
      }
    }
  }
}
</style>