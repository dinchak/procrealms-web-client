<template>
  <div :class="getScrollContainerClass()">

    <NGrid class="skills" cols="1 800:2">

      <NGi>
        <div class="skill-container">
          <div class="header bold-yellow">Weapon Skills</div>
          <div v-for="skill of getWeaponSkills()" :key="skill.name" class="skill">
            <div class="skill-info">
              <div class="name bold-yellow">{{ skill.name }}</div>
              <div class="level">Level <span class="bold-white">{{ skill.level }}</span></div>
            </div>
            <NProgress type="line" status="default" :percentage="skill.tnl || 0" :border-radius="0" :height="8" :show-indicator="false"></NProgress>
          </div>
        </div>
      </NGi>

      <NGi>
        <div class="skill-container">
          <div class="header bold-magenta">Crafting Skills</div>
          <div class="skill-points" v-if="player().skillPoints > 0">
            You have <span class="bold-white">{{ player().craftingPoints }}</span> <span class="bold-magenta">crafting point{{ player().craftingPointsPoints > 1 ? 's' : '' }}</span> available to spend.
          </div>
          <div class="info" v-if="getCraftingSkills().length == 0">You haven't learned any crafting skills yet.</div>
          <div v-for="skill of getCraftingSkills()" :key="skill.name" class="skill">
            <div class="skill-info">
              <div class="name bold-yellow">{{ skill.name }}</div>
              <div class="level">Level <span class="bold-white">{{ skill.level }}</span></div>
            </div>
            <NProgress type="line" status="default" :percentage="skill.tnl || 0" :border-radius="0" :height="8" :show-indicator="false"></NProgress>
          </div>
        </div>
      </NGi>

      <NGi>
        <div class="skill-container">
          <div class="header bold-red">Combat Skills</div>
          <div class="skill-points" v-if="player().skillPoints > 0">
            You have <span class="bold-white">{{ player().skillPoints }}</span> <span class="bold-red">skill point{{ player().skillPoints > 1 ? 's' : '' }}</span> available to spend.
          </div>
          <div class="info" v-if="getCombatSkills().length == 0">You haven't learned any combat skills yet.</div>
          <div v-for="skill of getCombatSkills()" :key="skill.name" class="skill">
            <div class="skill-info">
              <div class="name bold-yellow">{{ skill.name }}</div>
              <div class="level">Rank <span class="bold-white">{{ skill.rank }}</span></div>
            </div>
          </div>
        </div>
      </NGi>

      <NGi>
        <div class="skill-container">
          <div class="header bold-cyan">Artisan Skills</div>
          <div class="skill-points" v-if="player().artisanPoints > 0">
            You have <span class="bold-white">{{ player().artisanPoints }}</span> <span class="bold-cyan">artisan point{{ player().artisanPoints > 1 ? 's' : '' }}</span> available to spend.
          </div>
          <div class="info" v-if="getArtisanSkills().length == 0">You haven't learned any artisan skills yet.</div>
          <div v-for="skill of getArtisanSkills()" :key="skill.name" class="skill">
            <div class="skill-info">
              <div class="name bold-yellow">{{ skill.name }}</div>
              <div class="level">Rank <span class="bold-white">{{ skill.rank }}</span></div>
            </div>
          </div>
        </div>
      </NGi>
    </NGrid>
  </div>
</template>

<script setup>
import { defineProps, toRefs } from 'vue'
import { state } from '@/composables/state'
import { NGrid, NGi, NProgress } from 'naive-ui'

const props = defineProps(['miniOutputEnabled'])
const { miniOutputEnabled } = toRefs(props)

function player () {
  if (state.gameModalAs && state.gameState.charmies[state.gameModalAs]) {
    return state.gameState.charmies[state.gameModalAs].stats || {}
  }

  return state.gameState.player || {}
}

function skills () {
  if (state.gameModalAs && state.gameState.charmies[state.gameModalAs]) {
    return state.gameState.charmies[state.gameModalAs].skills || {}
  }

  return state.gameState.skills || {}
}

function getWeaponSkills () {
  let weaponSkills = Object.values(skills())
    .filter(sk => sk.type.includes('weapon'))

  weaponSkills.sort((a, b) => a.name.localeCompare(b.name))

  return weaponSkills
}

function getCraftingSkills () {
  let craftingSkills = Object.values(skills())
    .filter(sk => sk.type.includes('crafting'))

  craftingSkills.sort((a, b) => a.name.localeCompare(b.name))

  return craftingSkills
}

function getCombatSkills () {
  let combatSkills = Object.values(skills())
    .filter(sk => sk.type.includes('combat'))

  combatSkills.sort((a, b) => a.name.localeCompare(b.name))

  return combatSkills
}

function getArtisanSkills () {
  let artisanSkills = Object.values(skills())
    .filter(sk => sk.type.includes('artisan'))

  artisanSkills.sort((a, b) => a.name.localeCompare(b.name))

  return artisanSkills
}

function getScrollContainerClass () {
  return {
    'scroll-container': true,
    'mini-output-enabled': miniOutputEnabled.value
  }
}
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

  .skills {
    .skill-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      .header {
        font-size: 18px;
        text-align: center;
        padding: 10px;
      }
      .skill-points, .info {
        margin-bottom: 10px;
      }
      .skill {
        width: 350px;
        padding: 0 20px 5px 20px;
        .skill-info {
          display: flex;
          justify-content: space-between;
        }
      }
    }
  }
}
</style>