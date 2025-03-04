<template>
  <div class="stats">
    <VitalsBar
      :hpLabel="entity.hp"
      :hpPercent="entity.hp / entity.maxHp * 100"
      :energyLabel="entity.energy"
      :energyPercent="entity.energy / entity.maxEnergy * 100"
      :staminaLabel="entity.stamina"
      :staminaPercent="entity.stamina / entity.maxStamina * 100"
    ></VitalsBar>
  </div>
  <AffectsBar :entity="entity" :affects="affects" />
</template>

<script setup>
import { defineProps, toRefs } from 'vue'
import VitalsBar from '@/components/common/VitalsBar.vue'
import AffectsBar from '@/components/common/AffectsBar.vue'

const props = defineProps(['entity', 'affects'])

const { entity, affects } = toRefs(props)

</script>

<style lang="less">
.stats {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  word-break: normal;
}
</style>
