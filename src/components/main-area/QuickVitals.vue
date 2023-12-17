<template>
  <div class="vitals">
    <h3>{{ name }}</h3>
    <div class="grid">
      <div class="stat">
        <div class="vital-label">
          <span class="amount bold-green">{{ entity.hp }}</span>
          <span class="label green">HP</span>
        </div>
        <!-- <n-progress
          type="line"
          :show-indicator="false"
          border-radius="1"
          :height="15"
          status="success"
          :percentage="entity.hp / entity.maxHp * 100"
        ></n-progress> -->
      </div>

      <div class="stat">
        <div class="vital-label">
          <span class="amount bold-cyan">{{ entity.energy }}</span>
          <span class="label cyan">EN</span>
        </div>
        <!-- <n-progress
          type="line"
          :show-indicator="false"
          border-radius="1"
          :height="15"
          status="default"
          :percentage="entity.energy / entity.maxEnergy * 100"
        ></n-progress> -->
      </div>

      <div class="stat">
        <div class="vital-label">
          <span class="amount bold-yellow">{{ entity.stamina }}</span>
          <span class="label yellow">ST</span>
        </div>
        <!-- <n-progress
          type="line"
          :show-indicator="false"
          border-radius="1"
          :height="15"
          status="warning"
          :percentage="entity.stamina / entity.maxStamina * 100"
        ></n-progress> -->
      </div>

      <!-- <div class="stat"> -->
        <!-- <div :class="`hunger-mobile bold-${getHungerColor()}`">
          {{ Math.round(100 - (entity.food / entity.maxFood * 100)) }}%
        </div> -->
        <!-- <div class="vital-label"> -->
          <!-- <span :class="`label ${getHungerColor()}`">Hunger</span> -->
        <!-- </div> -->
        <!-- <n-progress
          type="line"
          :show-indicator="false"
          border-radius="1"
          :height="15"
          :status="getHungerStatus()"
          :percentage="100 - (entity.food / entity.maxFood * 100)"
        ></n-progress> -->
      <!-- </div> -->

      <!-- <div class="row">

        <div class="stat" v-if="entity.rage > 0">
          <div class="text">
            <span class="amount bold-red">{{ entity.rage }}</span>
            <span class="label red">Rage</span>
          </div>
        </div>

        <div class="stat" v-if="entity.combo > 0">
          <div class="text">
            <span class="amount bold-yellow">{{ entity.combo }}</span>
            <span class="label yellow">Combo</span>
          </div>
        </div>

      </div> -->

    </div>

  </div>

</template>

<script setup>
import { defineProps, toRefs } from 'vue'
// import { NProgress } from 'naive-ui'

const props = defineProps({
  entity: Object,
  name: String
})

const { entity, name } = toRefs(props)

// function getHungerColor () {
//   let hunger = (entity.value.maxFood - entity.value.food) / entity.value.maxFood
//   if (hunger >= 0.66) {
//     return 'red'
//   } else if (hunger >= 0.33) {
//     return 'yellow'
//   } else {
//     return 'green'
//   }
// }

// function getHungerStatus () {
//   let hunger = (entity.value.maxFood - entity.value.food) / entity.value.maxFood
//   if (hunger >= 0.66) {
//     return 'error'
//   } else if (hunger >= 0.33) {
//     return 'warning'
//   } else {
//     return 'success'
//   }
// }
</script>

<style scoped lang="less">
.vitals {
  min-width: 200px;
  h3 {
    font-size: 14px;
    margin: 0px 0 0 10px;
    overflow: hidden;
    // white-space: nowrap;
    text-overflow: ellipsis;
  }
  .grid {
    display: grid;
    grid-template-columns: 60px 60px 60px;
    margin-left: 3px;
    margin-bottom: 3px;
    .stat {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding-left: 5px;

      .vital-label {
        line-height: 15px;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: baseline;
        text-align: right;
        .amount {
          font-size: 17px;
        }
        .label {
          font-size: 12px;
          // margin-left: 2px;
        }
      }

      .text {
        line-height: 14px;
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .n-progress {
        width: 100px;
        // height: 10px;
        margin-left: 5px;
      }
    }
  }
}
</style>