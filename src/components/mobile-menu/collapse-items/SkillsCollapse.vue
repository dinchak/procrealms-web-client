<template>
  <NCollapseItem title="Skills">
    <div class="skills">
      <div class="skill-type bold-red">Weapon Skills</div>
      <div class="skill" v-for="skill in getSortedSkills('weapon')" :key="skill.name">
        <div class="skill-header">
          <div>{{ skill.name }}</div>
          <div>Level {{ skill.level }}</div>
        </div>
        <NProgress type="line" status="default" :percentage="skill.tnl" indicator-placement="inside">
        </NProgress>
      </div>

      <div class="skill-type bold-magenta" v-if="isPlayer">Crafting Skills</div>
      <div class="points" v-if="character.craftingPoints > 0">
        You have <span class="bold-magenta">{{ character.craftingPoints }}</span> unspent crafting {{ character.craftingPoints > 1 ? 'points' : 'point' }}. Find a crafting skill book to read.
      </div>
      <div class="skill" v-for="skill in getSortedSkills('crafting')" :key="skill.name">
        <div class="skill-header">
          <div>{{ skill.name }}</div>
          <div>Level {{ skill.level }}</div>
        </div>
        <NProgress type="line" status="default" :percentage="skill.tnl" indicator-placement="inside">
        </NProgress>
      </div>

      <div class="skill-type bold-red">Combat Skills</div>
      <div class="points" v-if="character.skillPoints > 0">
        You have <span class="bold-red">{{ character.skillPoints }}</span> unspent skill {{ character.skillPoints > 1 ? 'points' : 'point' }}. Find a combat skill book to read.
      </div>
      <div class="skill" v-for="skill in getSortedSkills('combat')" :key="skill.name">
        <div class="skill-header">
          <div>{{ skill.name }}</div>
          <div>Rank {{ skill.rank }}</div>
        </div>
      </div>

      <div class="skill-type bold-cyan">Artisan Skills</div>
      <div class="points" v-if="character.artisanPoints > 0">
        You have <span class="bold-cyan">{{ character.artisanPoints }}</span> unspent artisan {{ character.artisanPoints > 1 ? 'points' : 'point' }}. Find an artisan skill book to read.
      </div>
      <div class="skill" v-for="skill in getSortedSkills('artisan')" :key="skill.name">
        <div class="skill-header">
          <div>{{ skill.name }}</div>
          <div>Rank {{ skill.rank }}</div>
        </div>
      </div>
    </div>
  </NCollapseItem>
</template>

<script setup>
import { defineProps, toRefs } from 'vue'

import { NCollapseItem, NProgress } from 'naive-ui'

const props = defineProps(['character', 'skills', 'isPlayer'])

const { character, skills, isPlayer } = toRefs(props)
const getSortedSkills = (type) => {

  const filtered = skills.value
  .filter(sk => sk.type.includes(type))
  .sort((a,b) => a.name.localeCompare(b.name))

  if (type === 'weapon' || type === 'crafting') return filtered

  if (type === 'artisan') return filtered

  if (type === 'combat') {
    const reqOrder = ['strength', 'agility', 'magic', 'spirit',
      'strength+agility', 'strength+magic', 'strength+spirit',
      'agility+magic', 'agility+spirit', 'magic+spirit']

    return filtered
    .sort((a, b) => { // Sort by total required stat points
      const sum = (obj) => Object.values(obj).reduce((a,b) => a + b.amount, 0)
      return sum(a.requirements) - sum(b.requirements)
    })
    .sort((a, b) => { // Then sort by bespoke requirement order (array above)
      const getReq = sk => {
        const sortedReq = Object.values(sk.requirements).sort((a, b) => reqOrder.indexOf(a.stat) - reqOrder.indexOf(b.stat) )
        return sortedReq.map(a => a.stat).join('+')
      }
      return reqOrder.indexOf(getReq(a)) - reqOrder.indexOf(getReq(b))
    })
  }

  return filtered;
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
