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
  <NPopover trigger="hover" placement="top-start">
    <template #trigger>
      <div className="affect-row popover">
        <span v-if="affects.length == 0" class="affect">No Affects</span>
        <div class="shortflags" v-html-safe="getAffectFlags(entity, affects)" />
      </div>
    </template>
    <HUDEffects :affects="getAffects()"/>
  </NPopover>
</template>

<script setup>
import { defineProps, toRefs } from 'vue'
import { NPopover } from 'naive-ui'
import { useHelpers } from '@/composables/helpers'
import HUDEffects from '@/components/hud/HUDEffects.vue'
import VitalsBar from '@/components/common/VitalsBar.vue'

const { getAffectFlags } = useHelpers()

const props = defineProps(['entity', 'affects'])

const { entity, affects } = toRefs(props)

function getAffects () {
  return Object.values(affects.value).map(af => {
    return {
      name: af.longFlag
    }
  })
}

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
