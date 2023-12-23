<template>
  <div :class="getClass(participant)" @click="target(participant)">
    <div class="entity-info">
      <div class="row">
        <div class="name" v-html-safe="ansiToHtml(`${participant.hpPercent > 0 ? participant.tag + ' ' : ''}${ansi.boldBlack}L${ansi.boldWhite}${participant.level} ${participant.name}`)"></div>
        <n-progress type="circle" status="error" :percentage="100 - participant.nextAction / 40 * 100" :show-indicator="false"></n-progress>
      </div>

      <div class="affects" v-html-safe="ansiToHtml(getAffects(participant))"></div>

      <div class="target">
        <div class="targeting" v-show="participant.hpPercent > 0 && participant.targetName" v-html-safe="getTargetName(participant)"></div>
        <div class="targeting" v-show="participant.hpPercent > 0 && !participant.targetName" v-html-safe="'Target: None'"></div>

        <div class="status" v-html-safe="ansiToHtml(getStatus(participant))"></div>
      </div>

      <AllyVitals v-show="side == 'good'" :entity="entity"></AllyVitals>
      <EnemyVitals v-show="side == 'evil'" :participant="participant"></EnemyVitals>
    </div>
</div>
</template>
<script setup>
import { defineProps, toRefs } from 'vue'
import { NProgress } from 'naive-ui'
import stripAnsi from 'strip-ansi'

import AllyVitals from '@/components/main-area/battle-items/AllyVitals.vue'
import EnemyVitals from '@/components/main-area/battle-items/EnemyVitals.vue'

import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const { ansiToHtml, ansi } = useHelpers()
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
  ].join(' ')
}

function getAffects (participant) {
  if (participant.hpPercent == 0) {
    return ansi.boldRed + 'DEAD' + ansi.reset
  }
  if (participant.affects.length == 0) {
    return ''
  }
  return participant.affects.join(' ')
}

function getStatus (participant) {
  if (participant.hpPercent == 0) {
    return ''
  }
  return participant.status
}

function getTargetName (participant) {
  if (participant.targetName) {
    return 'Target: ' + ansiToHtml(participant.targetName)
  }
  return ''
}
</script>
<style lang="less">
.battle-entity {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #462233;
  padding: 5px;
  border: 1px solid #333;

  &.selected {
    // border: 1px solid #f8ff25;
    box-shadow: 0 0 5px #f8ff25;
    color: #f8ff25;
  }

  &.good {
    cursor: pointer;
    background-color: #001800;

    @media (hover: hover) {
      transition: all 0.3s;
      &:hover {
        background-color: #002800;
      }
    }

    // &.acting {
    //   border-color: #50ff50;
    //   box-shadow: 0 0 5px #50ff50;
    // }
  }
  &.evil {
    cursor: pointer;
    background-color: #180000;

    @media (hover: hover) {
      transition: all 0.3s;
      // &:hover {
      //   box-shadow: 0 0 5px #ff5050;
      //   background-color: #161111;
      // }
    }

    // &.acting {
    //   border-color: #ff5050;
    //   box-shadow: 0 0 5px #ff5050;
    // }
  }

  // &.dead {
  //   border-color: #333;
  // }
  .entity-info {
    display: flex;
    flex-direction: column;
    width: 250px;
    .row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;

      .name {
        font-size: 16px;
      }

      .n-progress {
        width: 15px;
        margin-left: 5px;
        .n-progress-content {
          width: 15px;
          .n-progress-graph {
            .n-progress-graph-circle {
              display: flex;
            }
          }
        }
      }
    }

    .affects {
      font-size: 14px;
    }

    .target {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      height: 20px;
      align-items: center;
      .targeting {
        display: flex;
        flex-direction: row;
        font-size: 14px;
        span {
          &:first-child {
            margin-left: 5px;
          }
        }
      }
      .status {
        font-size: 14px;
      }
    }
  }

}

@media screen and (max-width: 950px) {
  .battle-entity {
    .entity-info {
      width: 200px;
      .row {
        .name {
          font-size: 14px;
        }
      }
      .affects {
        font-size: 12px;
      }
      .target {
        .targeting {
          font-size: 12px;
        }
      }
    }  
  }
}

</style>