<template>
  <div :class="getClass(participant)" @click="target(participant)">
    <div class="name-row">
      <div class="name">
        <div v-html-safe="ansiToHtml(`${participant.hpPercent > 0 ? participant.tag + ' ' : ''}L${ANSI.boldWhite}${participant.level} ${participant.name}`)"></div>
        <div class="affects" v-html-safe="ansiToHtml(getAffects(participant))"></div>
      </div>

      <div class="rage-combo">
        <div class="vital" v-if="side == 'good' && entity.combo > 0">
          <div class="amount bold-yellow">{{ entity.combo }}</div>
          <div class="label yellow">Combo</div>
        </div>
        <div class="vital" v-if="side == 'good' && entity.rage > 0">
          <div class="amount bold-red">{{ entity.rage }}</div>
          <div class="label red">Rage</div>
        </div>
      </div>
    </div>

    <div class="vital" v-if="side == 'good'">
      <div class="amount bold-green">{{ entity.hp }}</div>
      <n-progress
        type="line" status="success" aria-label="Health" :height="4" :show-indicator="false" :border-radius="0"
        :percentage="entity.hp / entity.maxHp * 100"
      ></n-progress>
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
      <div class="amount bold-green">{{ participant.hpPercent }}%</div>
      <n-progress v-if="participant.hpPercent > 0" class="hp" type="line" status="success" aria-label="Health" :percentage="participant.hpPercent" :height="4" :border-radius="0" :show-indicator="false"></n-progress>
    </div>

    <div class="vital" v-if="side == 'evil'">
      <div class="amount bold-cyan">{{ participant.energyPercent }}%</div>
      <n-progress v-if="participant.energyPercent > 0" type="line" status="default" aria-label="Energy" :percentage="participant.energyPercent" :height="4" :border-radius="0" :show-indicator="false"></n-progress>
    </div>

    <div class="vital" v-if="side == 'evil'">
      <div class="amount bold-yellow">{{ participant.staminaPercent }}%</div>
      <n-progress v-if="participant.staminaPercent > 0" type="line" status="warning" aria-label="Stamina" :percentage="participant.staminaPercent" :height="4" :border-radius="0" :show-indicator="false"></n-progress>
    </div>

    <n-progress class="next-action" type="circle" status="error" :stroke-width="16" :percentage="100 - participant.nextAction / 40 * 100" :show-indicator="false"></n-progress>

  </div>

</template>
<script setup>
import { defineProps, toRefs } from 'vue'
import { NProgress } from 'naive-ui'
import stripAnsi from 'strip-ansi'

import { state } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { ANSI } from '@/composables/constants'

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
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #462233;
  padding: 5px;
  border: 1px solid #333;
  width: 500px;
  
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

  .name-row {
    width: 316px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .name {
      font-size: 16px;
      line-height: 16px;
      display: flex;
      flex-direction: column;
      .affects {
        font-size: 14px;
        line-height: 14px;
        min-height: 14px;
      }
    }
    
    .rage-combo {
      display: flex;
      flex-direction: row;
      .vital {
        width: 30px;
        padding: 0;
      }
    }
  }

  .vital {
    width: 40px;
    padding: 0 5px;
    font-size: 20px;
    line-height: 16px;
    text-align: center;
    .label {
      font-size: 10px;
      line-height: 4px;
    }
  }

  .next-action {
    padding: 0 5px;
    width: 24px;
  }


}

@media screen and (max-width: 1575px) {
  .battle-entity.mobile-menu-open {
    width: 450px;
  }
}

@media screen and (max-width: 1375px) {
  .battle-entity.mobile-menu-open {
    width: 350px;
  }
}

@media screen and (max-width: 1300px) {
  .battle-entity {
    width: 450px;
  }
}

@media screen and (max-width: 1100px) {
  .battle-entity {
    width: 350px;
  }
}

@media screen and (max-width: 400px) {
  .battle-entity {
    width: 325px;
  }
}


</style>