<template>
  <div class="stats">
    <span class="left">
      <span class="stat">
        <span class="value bold-green">{{ entity().hp }}</span>
        <span class="label green">HP</span>
        <n-progress class="quick-stats" type="line" status="success" :percentage="entity().hp / entity().maxHp * 100" :show-indicator="false"></n-progress>
      </span>

      <span class="stat">
        <span class="value bold-cyan">{{ entity().energy }}</span>
        <span class="label cyan">EN</span>
        <n-progress class="quick-stats" type="line" status="default" :percentage="entity().energy / entity().maxEnergy * 100" :show-indicator="false"></n-progress>
      </span>

      <span class="stat">
        <span class="value bold-yellow">{{ entity().stamina }}</span>
        <span class="label yellow">ST</span>
        <n-progress class="quick-stats" type="line" status="warning" :percentage="entity().stamina / entity().maxStamina * 100" :show-indicator="false"></n-progress>
      </span>

      <span class="stat" v-if="entity().rage > 0">
        <span class="value bold-red">{{ entity().rage }}</span>
        <span class="label red">RG</span>
        <n-progress class="quick-stats" type="line" status="warning" :percentage="entity().rage / entity().maxRage * 100" :show-indicator="false"></n-progress>
      </span>
    </span>

    <span class="right">
      <n-progress class="circle-stat" type="circle" status="success" :percentage="entity().food / entity().maxFood * 100">Food</n-progress>
<!--
      <n-progress v-if="entity().rage > 0" class="circle-stat" type="circle" status="danger" :percentage="entity().rage / entity().maxRage * 100">Rage</n-progress>
-->
      <n-progress v-if="entity().combo > 0" class="circle-stat" type="circle" status="warning" :percentage="entity().combo / entity().maxCombo * 100">Combo</n-progress>
    </span>

    <!-- <n-progress class="quick-stats" type="line" status="success" :percentage="entity().hp / entity().maxHp * 100">
      <div class="bar-label">
        <span class="bold-green">{{ entity().hp }}</span> <span class="green">HP</span>
      </div>
    </n-progress>
    <n-progress class="quick-stats" type="line" status="default" :percentage="entity().energy / entity().maxEnergy * 100">
      <div class="bar-label">
        <span class="bold-cyan">{{ entity().energy }}</span> <span class="cyan">EN</span>
      </div>
    </n-progress>
    <n-progress class="quick-stats" type="line" status="warning" :percentage="entity().stamina / entity().maxStamina * 100">
      <div class="bar-label">
        <span class="bold-yellow">{{ entity().stamina }}</span> <span class="yellow">ST</span>
      </div>
    </n-progress>
    <n-progress class="quick-stats" type="line" status="success" :percentage="entity().food / entity().maxFood * 100">
      <div class="bar-label">
        <span class="bold-green">{{ entity().food }}</span> <span class="green">FD</span>
      </div>
    </n-progress>
    <div class="flex">
      <n-progress class="quick-stats" type="line" status="warning" :percentage="entity().combo / entity().maxCombo * 100">
        <div class="half-bar-label">
          <span class="bold-yellow">{{ entity().combo }}</span> <span class="yellow">CB</span>
        </div>
      </n-progress>
      <n-progress class="quick-stats" type="line" status="danger" :percentage="entity().rage / entity().maxRage * 100">
        <div class="half-bar-label">
          <span class="bold-red">{{ entity().rage }}</span> <span class="red">RG</span>
        </div>
      </n-progress>
    </div> -->
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
      margin-right: 10px;
      &:last-child {
        margin-right: 0px;
      }
      .value {
        font-size: 14px;
        font-weight: bold;
      }
      .label {
        font-size: 10px;
      }
    }
  }

  .right {
    display: flex;
    flex-direction: row;
    .circle-stat {
      font-family: 'Inconsolata', monospace;
      width: 35px;
      height: 35px;
      font-size: 10px;
    }
  }
   .quick-stats {
    height: 12px;
    margin-right: 5px;
    width: 30px;
   }

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
