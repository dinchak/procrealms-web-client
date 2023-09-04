<template>
  <div class="stats">
    <span class="left">
      <span class="stat">
        <div class="value bold-green">{{ entity().hp }}<span class="label green">HP</span></div>
        <n-progress class="quick-stats" type="line" status="success" :percentage="entity().hp / entity().maxHp * 100" :show-indicator="false"></n-progress>
      </span>

      <span class="stat">
        <div class="value bold-cyan">{{ entity().energy }}<span class="label cyan">EN</span></div>
        <n-progress class="quick-stats" type="line" status="default" :percentage="entity().energy / entity().maxEnergy * 100" :show-indicator="false"></n-progress>
      </span>

      <span class="stat">
        <div class="value bold-yellow">{{ entity().stamina }}<span class="label yellow">ST</span></div>
        <n-progress class="quick-stats" type="line" status="warning" :percentage="entity().stamina / entity().maxStamina * 100" :show-indicator="false"></n-progress>
      </span>

      <span class="stat">
        <div class="value bold-green">{{ entity().regeneration }}</div>
        <div class="label green">Regen</div>
      </span>
    </span>

    <span class="right">
      <span class="stat" v-if="entity().rage > 0">
        <div class="label bold-red">Rage</div>
        <n-progress class="quick-stats" type="line" status="danger" :percentage="entity().rage / entity().maxRage * 100" :show-indicator="false"></n-progress>
      </span>

      <span class="stat" v-if="entity().combo > 0">
        <div class="label bold-yellow">Combo</div>
        <n-progress class="quick-stats" type="line" status="warning" :percentage="entity().combo / entity().maxCombo * 100" :show-indicator="false"></n-progress>
      </span>

      <span class="stat">
        <div class="label bold-green">Food</div>
        <n-progress class="quick-stats" type="line" status="success" :percentage="entity().food / entity().maxFood * 100" :show-indicator="false"></n-progress>
      </span>

    </span>

  </div>
</template>

<script setup>
import { NProgress } from 'naive-ui'
import { defineProps } from 'vue'

const props = defineProps(['entity'])

function entity () {
  return props.entity || {}
}
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

  .left {
    display: flex;
    flex-direction: row;
    .stat {
      margin-right: 5px;
      &:last-child {
        margin-right: 0px;
      }
      .value {
        font-size: 16px;
        text-align: center;
      }
      .label {
        font-size: 11px;
        line-height: 10px;
      }
    }
  }

  .right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    .stat {
      margin-right: 5px;
      width: 27px;
      &:last-child {
        margin-right: 0px;
      }
      .label {
        font-size: 11px;
        text-align: center;
      }
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
