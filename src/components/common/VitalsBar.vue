<template>
  <div class="vital-container">
    <div class="food-bar-container" v-if="showFoodBar">
      <div :class="getFoodBarClass()">
        <div class="food-fill" :style="{ height: foodPercent + '%' }"></div>
      </div>
    </div>

    <div :class="getVitalBarClass()">
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

  </div>
</template>

<script setup>
import { state } from '@/static/state'
import { defineProps, toRefs } from 'vue'

const props = defineProps([
  'hpPercent', 'hpLabel',
  'energyPercent', 'energyLabel',
  'staminaPercent', 'staminaLabel',
  'showFoodBar', 'foodPercent'
])

const {
  hpPercent, hpLabel,
  energyPercent, energyLabel,
  staminaPercent, staminaLabel,
  showFoodBar, foodPercent
} = toRefs(props)

function getVitalBarClass () {
  if (state.options.largeVitals) {
    return 'vital-col'
  } else {
    return 'vital-row'
  }
}

function getFoodBarClass () {
  let hungerLevel = Math.floor(foodPercent.value / 20)
  if (hungerLevel == 0) {
    return 'food-bar starving'
  } else if (hungerLevel == 1) {
    return 'food-bar very-hungry'
  } else if (hungerLevel == 2) {
    return 'food-bar hungry'
  }
  return 'food-bar full'
}

</script>
<style lang="less" scoped>
.vital-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 9px;

  .vital-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-right: 5px;
    gap: 5px;
    height: 100%;
  }

  .vital-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding-right: 5px;
    gap: 3px;
    flex-basis: 100%;
    width: 100%;
  }

  .food-bar-container {
    display: flex;
    flex-direction: column;
    width: 14px;

    .food-bar {
      width: 14px;
      height: 100%;
      border: 1px solid #000;
      border-radius: 2px;
      position: relative;

      .food-fill {
        position: absolute;
        bottom: 0;
        width: 100%;
      }

      &.full {
        border: 1px solid #005500;
        .food-fill {
          background: linear-gradient(to top, #003300, #004400);
        }
      }

      &.hungry {
        border: 1px solid #555500;
        .food-fill {
          background: linear-gradient(to top, #333300, #444400);
        }
      }

      &.very-hungry {
        border: 1px solid #660000;
        .food-fill {
          background: linear-gradient(to top, #660000, #770000);
        }
      }

      &.starving {
        border: 1px solid #550000;
        .food-fill {
          background: linear-gradient(to top, #330000, #440000);
        }
      }


    }
  }
}

.vital-bar {
  width: 100%;
  line-height: 1;
  border-radius: 2px;
  position: relative;
  min-width: 77px;

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


</style>