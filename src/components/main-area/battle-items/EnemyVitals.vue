<template>
  <div class="enemy-vitals">

    <div class="vital">
      <div class="amount bold-green">{{ participant.hpPercent }}%</div>
      <n-progress v-if="participant.hpPercent > 0" class="hp" type="line" status="success" aria-label="Health" :percentage="participant.hpPercent" :height="4" :border-radius="0" :show-indicator="false"></n-progress>
    </div>

    <div class="vital">
      <div class="amount bold-cyan">{{ participant.energyPercent }}%</div>
      <n-progress v-if="participant.energyPercent > 0" type="line" status="default" aria-label="Energy" :percentage="participant.energyPercent" :height="4" :border-radius="0" :show-indicator="false"></n-progress>
    </div>

    <div class="vital">
      <div class="amount bold-yellow">{{ participant.staminaPercent }}%</div>
      <n-progress v-if="participant.staminaPercent > 0" type="line" status="warning" aria-label="Stamina" :percentage="participant.staminaPercent" :height="4" :border-radius="0" :show-indicator="false"></n-progress>
    </div>

  </div>
</template>
<script setup>
import { defineProps, toRefs } from 'vue'
import { NProgress } from 'naive-ui'

const props = defineProps({
  participant: Object,
})

const { participant } = toRefs(props)

</script>
<style lang="less">
.enemy-vitals {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  font-size: 16px;
  .vital {
    text-align: center;
    width: 50px;
  }
}

</style>