<template>
  <div class="stats">
    <span class="left">
      <VitalsBar
        :hpLabel="entity.hp"
        :hpPercent="entity.hp / entity.maxHp * 100"
        :energyLabel="entity.energy"
        :energyPercent="entity.energy / entity.maxEnergy * 100"
        :staminaLabel="entity.stamina"
        :staminaPercent="entity.stamina / entity.maxStamina * 100"
      ></VitalsBar>
    </span>

    <span class="right">
      <span class="stat" v-if="entity.combo > 0">
        <div class="value bold-yellow">{{ entity.combo }}</div>
        <div class="label yellow">Combo</div>
      </span>

      <span class="stat" v-if="entity.rage > 0">
        <div class="value bold-red">{{ entity.rage }}</div>
        <div class="label red">Rage</div>
      </span>
    </span>

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

  .left, .right {
    display: flex;
    flex-direction: row;
    gap: 2px;
  }
  .stat {
    width: 38px;
    &:last-child {
      margin-right: 0px;
    }
    .value {
      font-size: 16px;
      text-align: center;
      line-height: 14px;
    }
    .label {
      font-size: 12px;
      line-height: 10px;
      text-align: center;
    }
  }

  .right {
    justify-content: flex-end;
    .stat {
      width: 38px;
    }
  }
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
</style>
