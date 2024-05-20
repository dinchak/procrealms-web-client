<template>
  <div class="party-health-container" :style="{ height: getPartyStatsHeight() + 'px' }">
    <div class="party-member" v-for="member in getPartyMembers()" :key="member.eid">

      <div class="name" v-html-safe="ansiToHtml(`${ANSI.reset}L${ANSI.boldWhite}${member.level} ${member.colorName}`)"></div>

      <div class="health-bar" :style="{ height: `calc(${state.options.fontSize})` }">
        <div class="health-bar-fill" :style="{ width: (member.hp / member.maxHp) * 100 + '%' }"></div>
        <div class="health-bar-content">
          {{ member.hp }} HP
        </div>
      </div>
      <div class="energy-stamina-bars">
        <div class="energy-bar" :style="{ height: `calc(${state.options.fontSize})` }">
          <div class="energy-bar-fill" :style="{ width: (member.energy / member.maxEnergy) * 100 + '%' }"></div>
          <div class="energy-bar-content">
            {{ member.energy }} EN
          </div>
        </div>

        <div class="stamina-bar" :style="{ height: `calc(${state.options.fontSize})` }">
          <div class="stamina-bar-fill" :style="{ width: (member.stamina / member.maxStamina) * 100 + '%' }"></div>
          <div class="stamina-bar-content">
            {{ member.stamina }} ST
          </div>
        </div>
      </div>

      <div class="shortflags" v-html-safe="getShortFlags(member)"></div>
    </div>
  </div>
</template>
<script setup>
import { ANSI } from '@/static/constants'
import { state, getPartyStatsHeight } from '@/static/state'
import { useHelpers } from '@/composables/helpers'

const { ansiToHtml } = useHelpers()

function getShortFlags (member) {
  return ansiToHtml(
    Object.values(member.affects)
      .map(affect => affect.shortFlag)
      .join(' ')
  )
}

function getPartyMembers () {
  let members = Object.values(state.gameState.party)
  members.sort((a, b) => a.sort < b.sort ? -1 : 1)
  return members
}
</script>
<style lang="less" scoped>
.party-health-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding: 0 10px;
  overflow-x: scroll;
  background-color: rgb(16, 18, 22);

  .party-member {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-right: 10px;

    .health-bar {
      width: 201px;
      background-color: #333;
      overflow: hidden;
      position: relative;
      border: 1px solid #59d162;
      margin-bottom: 2px;

      .health-bar-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: linear-gradient(to right, #206c2d, #21a425);
      }

      .health-bar-content {
        width: 100%;
        color: white;
        text-align: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }

    .energy-stamina-bars {
      display: flex;
      flex-direction: row;
      
      .energy-bar, .stamina-bar {
        width: 98px;
        background-color: #333;
        overflow: hidden;
        position: relative;

        .energy-bar-fill, .stamina-bar-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
        }

        .energy-bar-fill {
          background: linear-gradient(to right, #176a81, #1992b4);
        }

        .stamina-bar-fill {
          background: linear-gradient(to right, #8b7421, #a89f27);
        }

        .energy-bar-content, .stamina-bar-content {
          width: 100%;
          color: #fff;
          text-align: center;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
      }

      .energy-bar {
        border: 1px solid #61d3df;
        margin-right: 3px;
      }
      
      .stamina-bar {
        border: 1px solid #cbcb0d;
      }
    }

    .shortflags {
      text-align: left;
      width: 100%;
      height: 18px;
    }

    .name {
    }
  }
}
</style>