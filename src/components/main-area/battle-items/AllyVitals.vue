<template>
  <div class="ally-vitals">

    <div class="col">
      <div class="vital">
        <div class="amount bold-green">{{ entity.hp }}</div>
        <n-progress
          type="line" status="success" aria-label="Health" :height="4" :show-indicator="false" :border-radius="0"
          :percentage="entity.hp / entity.maxHp * 100"
        ></n-progress>
      </div>

      <div class="vital">
        <div class="amount bold-cyan">{{ entity.energy }}</div>
        <n-progress
          type="line" status="default" aria-label="Energy" :height="4" :show-indicator="false" :border-radius="0"
          :percentage="entity.energy / entity.maxEnergy * 100"
        ></n-progress>
      </div>

      <div class="vital">
        <div class="amount bold-yellow">{{ entity.stamina }}</div>
        <n-progress
          type="line" status="warning" aria-label="Stamina" :height="4" :show-indicator="false" :border-radius="0"
          :percentage="entity.stamina / entity.maxStamina * 100" 
        ></n-progress>
      </div>
    </div>

    <div class="col combo-rage">
      <div class="vital combo-rage" v-show="entity.combo > 0 && !hideRageCombo">
        <div class="amount bold-yellow">{{ entity.combo }}</div>
        <div class="label">Combo</div>
      </div>

      <div class="vital combo-rage" v-show="entity.rage > 0 && !hideRageCombo">
        <div class="amount bold-red">{{ entity.rage }}</div>
        <div class="label">Rage</div>
      </div>
    </div>

  </div>
</template>
<script setup>
import { defineProps, toRefs } from 'vue'
import { NProgress } from 'naive-ui'

const props = defineProps({
  entity: Object,
  hideRageCombo: Boolean
})

const { entity, hideRageCombo } = toRefs(props)

</script>
<style lang="less">
.ally-vitals {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  .col {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;

    &.combo-rage {
      justify-content: flex-end;
    }

    .vital {
      text-align: center;
      width: 40px;
      margin-right: 5px;

      &.combo-rage {
        width: 30px;
      }

      &:last-child {
        margin-right: 0;
      }

      .label {
        font-size: 10px;
        line-height: 4px;
      }
    }
  }
}

</style>