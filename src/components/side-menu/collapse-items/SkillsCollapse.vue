<template>
  <n-collapse-item title="Skills">
    <div class="skills">
      <div class="skill-type bold-red">Weapon Skills</div>
      <div class="skill" v-for="skill in skills().filter(sk => sk.type.includes('weapon'))" :key="skill.name">
        <div class="skill-header">
          <div>{{ skill.name }}</div>
          <div>Level {{ skill.level }}</div>
        </div>
        <n-progress type="line" status="default" :percentage="skill.tnl" indicator-placement="inside">
        </n-progress>
        <!-- <div>{{ skill }}</div> -->
      </div>

      <div class="skill-type bold-magenta">Crafting Skills</div>
      <div class="points" v-if="player().craftingPoints > 0">
        You have <span class="bold-magenta">{{ player().craftingPoints }}</span> unspent crafting points. Find a crafting skill book to read.
      </div>
      <div class="skill" v-for="skill in skills().filter(sk => sk.type.includes('crafting'))" :key="skill.name">
        <div class="skill-header">
          <div>{{ skill.name }}</div>
          <div>Level {{ skill.level }}</div>
        </div>
        <n-progress type="line" status="default" :percentage="skill.tnl" indicator-placement="inside">
        </n-progress>
        <!-- <div>{{ skill }}</div> -->
      </div>

      <div class="skill-type bold-cyan">Learned Skills</div>
      <div class="points" v-if="player().craftingPoints > 0">
        You have <span class="bold-cyan">{{ player().skillPoints }}</span> unspent skill points. Find a skill book to read.
      </div>
      <div class="skill" v-for="skill in skills().filter(sk => sk.type.includes('learned'))" :key="skill.name">
        <div class="skill-header">
          <div>{{ skill.name }}</div>
          <div>Rank {{ skill.rank }}</div>
        </div>
      </div>
    </div>
  </n-collapse-item>
</template>

<script setup>
import { NCollapseItem, NProgress } from 'naive-ui'
import { state } from '@/composables/state'

function skills () {
  return state.gameState.skills || []
}

function player () {
  return state.gameState.player
}

</script>

<style lang="less">
.skills {
  .skill-type {
    margin-top: 15px;
    margin-bottom: 15px;
    text-align: center;
    &:first-child {
      margin-top: 0;
    }
  }
  .skill {
    margin-bottom: 5px;
    .skill-header {
      padding: 0 10px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }

    .expand-link {
      color: #fff;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  .points {
    margin-bottom: 10px;
    text-align: center;
  }
}
</style>
