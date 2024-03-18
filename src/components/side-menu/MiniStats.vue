<template>
  <div class="stats">
    <span class="left">
      <span class="stat">
        <div class="value bold-green">{{ entity.hp }}<span class="label green">HP</span></div>
        <n-progress class="quick-stats" type="line" status="success" :percentage="entity.hp / entity.maxHp * 100" :show-indicator="false" :height="8" :border-radius="0"></n-progress>
      </span>

      <span class="stat">
        <div class="value bold-cyan">{{ entity.energy }}<span class="label cyan">EN</span></div>
        <n-progress class="quick-stats" type="line" status="default" :percentage="entity.energy / entity.maxEnergy * 100" :height="8" :border-radius="0" :show-indicator="false"></n-progress>
      </span>

      <span class="stat">
        <div class="value bold-yellow">{{ entity.stamina }}<span class="label yellow">ST</span></div>
        <n-progress class="quick-stats" type="line" status="warning" :percentage="entity.stamina / entity.maxStamina * 100" :height="8" :border-radius="0" :show-indicator="false"></n-progress>
      </span>

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

    <span class="stat">
      <div class="value bold-green"><span class="label green">Food</span></div>
      <n-progress class="quick-stats" type="line" status="success" :percentage="entity.food / entity.maxFood * 100" :show-indicator="false" :height="8" :border-radius="0"></n-progress>
    </span>

  </div>
</template>

<script setup>
import { NProgress } from 'naive-ui'
import { defineProps, toRefs } from 'vue'

const props = defineProps(['entity'])

const { entity } = toRefs(props)

// function entity () {
//   return props.entity || {}
// }
</script>

<style lang="less">
.stats {
  padding: 2px 5px;
  display: flex;
  flex-direction: row;
  margin-bottom: 5px;
  align-items: center;
  justify-content: space-between;
  word-break: normal;

  .left, .right {
    display: flex;
    flex-direction: row;
    .stat {
      margin-right: 5px;
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
  }

  .right {
    justify-content: flex-end;
    .stat {
      width: 38px;
    }
  }
  //  .quick-stats {
  //   height: 12px;
  //   margin-right: 5px;
  //   width: 30px;
  //  }

  // .flex {
  //   display: flex;
  //   flex-direction: row;
  //   .quick-stats {
  //     margin-right: 10px;
  //     &:last-child {
  //       margin-right: 0px;
  //     }
  //   }
  // }
}

// .bar-label {
//   width: 50px;
//   display: inherit;
//   text-align: right;
// }

// .half-bar-label {
//   width: 50px;
//   display: inherit;
//   text-align: right;
// }
</style>
