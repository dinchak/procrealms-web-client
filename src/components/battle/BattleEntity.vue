<template>
  <div :class="getClass(participant)" @click="target(participant)">
    <div class="name-area">
      <div class="name">
        <div v-html-safe="ansiToHtml(`${participant.hpPercent > 0 ? participant.tag + ' ' : ''}L${ANSI.boldWhite}${participant.level} ${participant.name}`)"></div>
      </div>
      
      <div class="affects-row">
        <div class="affects" v-html-safe="ansiToHtml(getAffects(participant))"></div>

        <div class="combo-rage" v-if="side == 'good'">
          <div class="affect" v-if="entity.combo > 0">
            <div class="amount bold-yellow">{{ entity.combo }}</div>
            <div class="label yellow">Combo</div>
          </div>

          <div class="affect" v-if="entity.rage > 0">
            <div class="amount bold-red">{{ entity.rage }}</div>
            <div class="label red">Rage</div>
          </div>
        </div>
      </div>
    </div>

    <div class="vital-row">
      <div class="vital-amount bold-green" v-if="side == 'good'">
        {{ entity.hp }}
      </div>

      <div class="vital-amount bold-green" v-if="side == 'evil'">
        {{ participant.hpPercent }}%
      </div>

      <NProgress
        class="vital-bar" type="line" status="success" aria-label="Health"
        v-if="side == 'good'"
        :stroke-width="16"
        :percentage="entity.hp / entity.maxHp * 100"
        :show-indicator="false"
        :border-radius="0"
        :height="10"
      ></NProgress>

      <NProgress
        class="vital-bar" type="line" status="success" aria-label="Health"
        v-if="side == 'evil'"
        :stroke-width="16"
        :percentage="participant.hpPercent"
        :show-indicator="false"
        :border-radius="0"
        :height="10"
      ></NProgress>
    </div>

    <div class="vital-row">
      <div class="vital-amount bold-cyan" v-if="side == 'good'">
        {{ entity.energy }}
      </div>

      <div class="vital-amount bold-cyan" v-if="side == 'evil'">
        {{ participant.energyPercent }}%
      </div>

      <NProgress
        class="vital-bar" type="line" status="default" aria-label="Health"
        v-if="side == 'good'"
        :stroke-width="16"
        :percentage="entity.energy / entity.maxEnergy * 100"
        :show-indicator="false"
        :border-radius="0"
        :height="10"
      ></NProgress>

      <NProgress
        class="vital-bar" type="line" status="default" aria-label="Health"
        v-if="side == 'evil'"
        :stroke-width="16"
        :percentage="participant.energyPercent"
        :show-indicator="false"
        :border-radius="0"
        :height="10"
      ></NProgress>
    </div>


    <div class="vital-row">
      <div class="vital-amount bold-yellow" v-if="side == 'good'">
        {{ entity.stamina }}
      </div>

      <div class="vital-amount bold-yellow" v-if="side == 'evil'">
        {{ participant.staminaPercent }}%
      </div>

      <NProgress
        class="vital-bar" type="line" status="warning" aria-label="Stamina"
        v-if="side == 'good'"
        :stroke-width="16"
        :percentage="entity.stamina / entity.maxStamina * 100"
        :show-indicator="false"
        :border-radius="0"
        :height="10"
      ></NProgress>

      <NProgress
        class="vital-bar" type="line" status="warning" aria-label="Stamina"
        v-if="side == 'evil'"
        :stroke-width="16"
        :percentage="participant.staminaPercent"
        :show-indicator="false"
        :border-radius="0"
        :height="10"
      ></NProgress>
    </div>


    <!-- <div class="vitals">
      <div class="vital" v-if="side == 'good' && entity.combo > 0">
        <div class="amount bold-yellow">{{ entity.combo }}</div>
        <div class="label yellow">Combo</div>
      </div>

      <div class="vital" v-if="side == 'good' && entity.rage > 0">
        <div class="amount bold-red">{{ entity.rage }}</div>
        <div class="label red">Rage</div>
      </div>

      <div class="vital" v-if="side == 'good'">
        <div class="amount bold-cyan">{{ entity.energy }}</div>
        <n-progress
          type="line" status="default" aria-label="Energy" :height="4" :show-indicator="false" :border-radius="0"
          :percentage="entity.energy / entity.maxEnergy * 100"
        ></n-progress>
      </div>

      <div class="vital" v-if="side == 'good'">
        <div class="amount bold-yellow">{{ entity.stamina }}</div>
        <n-progress
          type="line" status="warning" aria-label="Stamina" :height="4" :show-indicator="false" :border-radius="0"
          :percentage="entity.stamina / entity.maxStamina * 100" 
        ></n-progress>
      </div>

      <div class="vital" v-if="side == 'evil'">
        <div class="amount bold-cyan">{{ participant.energyPercent }}%</div>
        <n-progress v-if="participant.energyPercent > 0" type="line" status="default" aria-label="Energy" :percentage="participant.energyPercent" :height="4" :border-radius="0" :show-indicator="false"></n-progress>
      </div>

      <div class="vital" v-if="side == 'evil'">
        <div class="amount bold-yellow">{{ participant.staminaPercent }}%</div>
        <n-progress v-if="participant.staminaPercent > 0" type="line" status="warning" aria-label="Stamina" :percentage="participant.staminaPercent" :height="4" :border-radius="0" :show-indicator="false"></n-progress>
      </div>

      <div class="vital">
        <div class="amount bold-red">Act</div>
        <n-progress
          type="line" status="error" aria-label="Health"
          :height="4"
          :show-indicator="false"
          :border-radius="0"
          :percentage="100 - participant.nextAction / 40 * 100"
        ></n-progress>
      </div>

    </div>
 -->

  </div>

</template>
<script setup>
import { defineProps, toRefs } from 'vue'
import { NProgress } from 'naive-ui'
import stripAnsi from 'strip-ansi'

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { ANSI } from '@/static/constants'

const { ansiToHtml } = useHelpers()
const { cmd } = useWebSocket()

const props = defineProps({
  participant: Object,
  entity: Object,
  side: String
})
const { participant, entity, side } = toRefs(props)

function target (participant) {
  if (participant.hpPercent == 0) return
  cmd(`target ${stripAnsi(participant.tag)}`)
}

function getClass (participant) {
  return [
    'battle-entity',
    'selectable',
    participant.hpPercent == 0 ? 'dead' : participant.side,
    participant.isActing ? 'acting' : '',
    state.options.showMobileMenu ? 'mobile-menu-open' : ''
  ].join(' ')
}

function getAffects (participant) {
  if (participant.hpPercent == 0) {
    return ANSI.boldRed + 'DEAD' + ANSI.reset
  }
  if (participant.affects.length == 0) {
    return ''
  }
  return participant.affects.join(' ')
}

// function getStatus (participant) {
//   if (participant.hpPercent == 0) {
//     return ''
//   }
//   return participant.status
// }

// function getTargetName (participant) {
//   if (participant.targetName) {
//     return 'Target: ' + ansiToHtml(participant.targetName)
//   }
//   return ''
// }
</script>
<style lang="less" scoped>
.battle-entity {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #462233;
  padding: 5px;
  border: 2px solid #333;
  margin: 2px;
  width: 250px;
  
  &.selected {
    // border: 1px solid #f8ff25;
    box-shadow: 0 0 5px #f8ff25 !important;
    color: #f8ff25 !important;
  }

  &.good {
    cursor: pointer;
    background-color: #001800;
    border-color: #001800;

    @media (hover: hover) {
      transition: all 0.3s;
      &:hover {
        background-color: #002800;
      }
    }

    &.acting {
      border-color: #50ff50;
      box-shadow: 0 0 5px #50ff50;
    }
  }
  &.evil {
    cursor: pointer;
    background-color: #180000;
    border-color: #180000;

    @media (hover: hover) {
      transition: all 0.3s;
      &:hover {
        background-color: #280000;
      }
    }

    &.acting {
      border-color: #ff5050;
      box-shadow: 0 0 5px #ff5050;
    }
  }

  .name-area {
    min-height: 36px;
    .affects-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .combo-rage {
        .affect {
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;
          gap: 5px;
        }
      }
    }
  }

  .vital-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
    padding-right: 15px;
    .vital-amount {
      width: 50px;
      text-align: right;
    }
  }

  .vitals {
    display: flex;
    flex-direction: row;
    .vital {
      width: 40px;
      padding: 0 5px 0 0;
      line-height: 16px;
      text-align: center;
      .label {
        font-size: 10px;
        line-height: 4px;
      }
    }
  }
}

@media screen and (max-width: 1575px) {
  .battle-entity.mobile-menu-open {
    width: 230px;
  }
}

@media screen and (max-width: 1375px) {
  .battle-entity.mobile-menu-open {
    width: 220px;
  }
}

@media screen and (max-width: 1300px) {
  .battle-entity {
    width: 210px;
  }
}

@media screen and (max-width: 1100px) {
  .battle-entity {
    width: 200px;
  }
}

@media screen and (max-width: 400px) {
  .battle-entity {
    width: 250px;
  }
}


</style>