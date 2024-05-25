<template>
  <div class="stats">
    <span class="left">
      <span class="stat">
        <div class="value bold-green">{{ entity.hp }}<span class="label green">HP</span></div>
        <NProgress class="quick-stats" type="line" status="success" :percentage="entity.hp / entity.maxHp * 100" :show-indicator="false" :height="8" :border-radius="0"></NProgress>
      </span>

      <span class="stat">
        <div class="value bold-cyan">{{ entity.energy }}<span class="label cyan">EN</span></div>
        <NProgress class="quick-stats" type="line" status="default" :percentage="entity.energy / entity.maxEnergy * 100" :height="8" :border-radius="0" :show-indicator="false"></NProgress>
      </span>

      <span class="stat">
        <div class="value bold-yellow">{{ entity.stamina }}<span class="label yellow">ST</span></div>
        <NProgress class="quick-stats" type="line" status="warning" :percentage="entity.stamina / entity.maxStamina * 100" :height="8" :border-radius="0" :show-indicator="false"></NProgress>
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

    <span class="stat food">
      <div class="value bold-red">{{ (entity.food / entity.maxFood) * 100 }}<span class="label red">FD</span></div>
      <NProgress class="quick-stats" type="line" status="success" :percentage="entity.food / entity.maxFood * 100" :show-indicator="false" :height="8" :border-radius="0"></NProgress>
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
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  word-break: normal;

  .left, .right {
    display: flex;
    flex-direction: row;
    gap: 10px;
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

  .food {
    .n-progress .n-progress-graph-line-rail .n-progress-graph-line-fill {
      background: #ff6983;
    }
  }
}
</style>
