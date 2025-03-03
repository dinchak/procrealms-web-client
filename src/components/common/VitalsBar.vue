<template>
  <div class="vital-row">
    <div class="vital-bar hp bold-green">
      <div class="vital-fill hp" :style="{ width: hpPercent + '%' }"></div>
      <div class="vital-value">
        {{ hpLabel }}
      </div>
    </div>

    <div class="vital-bar energy bold-cyan">
      <div class="vital-fill energy" :style="{ width: energyPercent + '%' }">
      </div>
      <div class="vital-value">
        {{ energyLabel }}
      </div>
    </div>

    <div class="vital-bar stamina bold-yellow">
      <div class="vital-fill stamina" :style="{ width: staminaPercent + '%' }">
      </div>
      <div class="vital-value">
        {{ staminaLabel }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, toRefs } from 'vue'

const props = defineProps([
  'hpPercent', 'hpLabel',
  'energyPercent', 'energyLabel',
  'staminaPercent', 'staminaLabel'
])

const {
  hpPercent, hpLabel,
  energyPercent, energyLabel,
  staminaPercent, staminaLabel
} = toRefs(props)

</script>
<style lang="less" scoped>
.vital-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-right: 5px;
  gap: 5px;

  .vital-bar {
    width: 100%;
    line-height: 1;
    border-radius: 2px;
    position: relative;
    width: 60px;

    &.hp {
      border: 1px solid #005500;
    }
    &.energy {
      border: 1px solid #005577;
    }
    &.stamina {
      border: 1px solid #554400;
    }

    .vital-value {
      position: relative;
      width: 100%;
      text-align: center;
      z-index: 10;
    }

    .vital-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      &.hp {
        background: linear-gradient(to right, #003300, #004400);
      }

      &.energy {
        background: linear-gradient(to right, #003344, #004455);
      }

      &.stamina {
        background: linear-gradient(to right, #443300, #554400);
      }
    }
  }
}

</style>