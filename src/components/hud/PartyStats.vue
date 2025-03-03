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
          <n-popover trigger="hover" placement="top-start">
            <template #trigger>
              <div class="shortflags" v-html-safe="getAffectFlags(member, member.affects)" />
            </template>
            <HUDEffects :affects="member.affects"/>
          </n-popover>
          <div class="food-bar" v-if="member.maxFood" :style="{ height: `calc(${state.options.fontSize})` }">
            <div class="food-bar-fill" :style="{ width: (member.food / member.maxFood) * 100 + '%' }"></div>
            <div class="food-bar-content">
              {{ Math.round((member.food / member.maxFood) * 100) }} FD
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ANSI } from '@/static/constants'
import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { NPopover } from 'naive-ui'
import HUDEffects from '@/components/hud/HUDEffects.vue'
import VitalsBar from '@/components/common/VitalsBar.vue'

const { ansiToHtml, getAffectFlags } = useHelpers()

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

    .shortflags {
      flex-grow: 1;
      text-align: left;
      height: 18px;
      display: flex;
      gap: 3px;
      overflow-x: hidden;
      cursor: help;
    }

    .food-bar {
      border: 1px solid #d15959;
      width: 75px;

      .food-bar-fill {
        background: linear-gradient(to right, #6c2020, #a42121);
      }
    }

    .name {
      text-align: center;
    }
  }
}
</style>