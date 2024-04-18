<template>
  <div class="party-health-container">
    <div class="party-member" v-for="member in getPartyMembers()" :key="member.eid">

      <div class="name" v-html-safe="ansiToHtml(member.colorName)"></div>

      <div class="health-bar">
        <div class="health-bar-fill" :style="{ width: (member.hp / member.maxHp) * 100 + '%' }"></div>
        <div class="health-bar-content">
          {{ member.hp }} HP
        </div>
      </div>
      <div class="energy-stamina-bars">
        <div class="energy-bar">
          <div class="energy-bar-fill" :style="{ width: (member.energy / member.maxEnergy) * 100 + '%' }"></div>
          <div class="energy-bar-content">
            {{ member.energy }} EN
          </div>
        </div>

        <div class="stamina-bar">
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
import { state } from '@/composables/state'
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
  members.sort((a, b) => a.traits.includes('player') ? -1 : a.name.localeCompare(b.name))
  return members
}
</script>
<style lang="less" scoped>
.party-health-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding: 0 10px;
  height: 65px;
  overflow-x: scroll;

  .party-member {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-right: 10px;

    .health-bar {
      width: 201px;
      height: 12px;
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
        line-height: 0.9;
        font-size: 0.8rem;
        color: white;
        text-align: center;
        position: absolute;
        top: 0;
        left: 0;
      }
    }

    .energy-stamina-bars {
      display: flex;
      flex-direction: row;
      
      .energy-bar, .stamina-bar {
        width: 99px;
        height: 12px;
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
          line-height: 0.9;
          font-size: 0.8rem;
          color: #fff;
          text-align: center;
          position: absolute;
          top: 0;
          left: 0;
        }
      }

      .energy-bar {
        border: 1px solid #61d3df;
        margin-right: 2px;
      }
      
      .stamina-bar {
        border: 1px solid #cbcb0d;
      }
    }

    .shortflags {
      font-size: 0.8rem;
      line-height: 0.9;
      text-align: left;
      width: 100%;
    }

    .name {
      font-size: 0.9rem;
    }
  }
}
</style>