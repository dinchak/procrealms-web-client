<template>
  <div :class="getClass(entity)" @click="target(entity)">
    <div class="entity-info">
      <div class="info">

        <div class="name" v-html-safe="ansiToHtml(`${entity.hp > 0 ? entity.tag + ' ' : ''}${entity.name}`)"></div>

        <div class="affects" v-html-safe="ansiToHtml(`${ansi.boldBlack}L${ansi.boldWhite}${entity.level}${ansi.reset} ${getAffects(entity)}`)"></div>

      </div>
      <div class="vitals">

        <div class="vital">
          <div class="amount bold-green">{{ entity.hp }}<span class="green" v-if="entity.side == 'evil'">%</span></div>
          <n-progress v-if="entity.hp > 0" class="hp" type="line" status="success" aria-label="Health" :percentage="entity.hpPercent" :height="2" :show-indicator="false"></n-progress>
        </div>

        <div class="vital">
          <div class="amount bold-cyan">{{ entity.en }}<span class="cyan" v-if="entity.side == 'evil'">%</span></div>
          <n-progress v-if="entity.en > 0" type="line" status="default" aria-label="Energy" :percentage="entity.enPercent" :height="2" :show-indicator="false"></n-progress>
        </div>

        <div class="vital">
          <div class="amount bold-yellow">{{ entity.st }}<span class="yellow" v-if="entity.side == 'evil'">%</span></div>
          <n-progress v-if="entity.st > 0" type="line" status="warning" aria-label="Stamina" :percentage="entity.stPercent" :height="2" :show-indicator="false"></n-progress>
        </div>

      </div>
    </div>

    <n-progress type="line" status="error" :height="2" :percentage="entity.nextAction / 40 * 100" :show-indicator="false"></n-progress>

    <!-- <n-progress v-if="entity.hp > 0" class="hp" type="line" status="success" aria-label="Health" :percentage="entity.hp" :height="15">{{ entity.hp }}% <span class="bold-green">HP</span></n-progress>

    <n-progress v-if="entity.hp > 0" class="en" type="line" status="default" aria-label="Energy" :percentage="entity.en" :height="15">{{ entity.en }}% <span class="bold-cyan">EN</span></n-progress>

    <n-progress v-if="entity.hp > 0" class="st" type="line" status="warning" aria-label="Stamina" :percentage="entity.st" :height="15">{{ entity.st }}% <span class="bold-yellow">ST</span></n-progress> -->

    <!-- <div class="footer">
      <div class="left">
        <div v-if="entity.targetName && entity.hp > 0" class="targeting" v-html-safe="'Target: ' + ansiToHtml(entity.targetName)"></div>
        <div v-if="!entity.targetName && entity.hp > 0" class="targeting" v-html-safe="'Target: None'"></div>
      </div>
      <div class="right">
        <div class="action" v-if="entity.hp > 0">
          <n-progress type="circle" status="error" :percentage="entity.nextAction / 40 * 100" :show-indicator="false"></n-progress>
        </div>
      </div>
    </div> -->
  </div>
</template>
<script setup>
import { defineProps, toRefs } from 'vue'
import { NProgress } from 'naive-ui'
import stripAnsi from 'strip-ansi'

import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const { ansiToHtml, ansi } = useHelpers()
const { cmd } = useWebSocket()

const props = defineProps({
  entity: Object,
})
const { entity } = toRefs(props)

function target (entity) {
  if (entity.hp == 0) return
  cmd(`target ${stripAnsi(entity.tag)}`)
}

function getClass (entity) {
  return [
    'battle-entity',
    'selectable',
    entity.hp == 0 ? 'dead' : entity.side,
    entity.isActing ? 'acting' : '',
  ].join(' ')
}

function getAffects (entity) {
  if (entity.hp == 0) {
    return ansi.boldRed + 'DEAD' + ansi.reset
  }
  if (entity.affects.length == 0) {
    return ''
  }
  return entity.affects.join(' ')
}
</script>
<style lang="less">
.battle-entity {
  display: flex;
  width: 400px;
  flex-direction: column;
  justify-content: space-between;
  background-color: #462233;
  padding: 2px;

  &.selected {
    // border: 1px solid #f8ff25;
    box-shadow: 0 0 5px #f8ff25;
    color: #f8ff25;
  }

  &.good {
    cursor: pointer;
    background-color: #030a03;

    @media (hover: hover) {
      transition: all 0.3s;
      // &:hover {
      //   box-shadow: 0 0 5px #50ff50;
      //   background-color: #111611;
      // }
    }

    // &.acting {
    //   border-color: #50ff50;
    //   box-shadow: 0 0 5px #50ff50;
    // }
  }
  &.evil {
    cursor: pointer;
    background-color: #0a0303;

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
    flex-direction: row;
    justify-content: space-between;
    .info {
      display: flex;
      flex-direction: column;
      width: 300px;
      .name {
        font-size: 16px;
      }
      .affects {
        font-size: 14px;
      }
    }

    .vitals {
      width: 100px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      .vital {
        text-align: center;
        width: 30px;
      }
    }
  }

  .footer {
    display: flex;
    flex-direction: row;
    margin-top: 3px;
    .left {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      .targeting {
        font-size: 12px;
      }
    }

    .right {
      display: flex;
      flex-direction: column;
      .action {
        display: flex;
        justify-content: center;
        .n-progress {
          height: 15px;
          width: 15px;
        }
      }
    }
  }

  .n-progress {
    .n-progress-custom-content {
      width: 55px;
      text-align: right;
      margin: 0;
    }
    --n-rail-height: 2px !important;
    .n-progress-content {
      .n-progress-graph {
        .n-progress-graph-line-rail {
          border-radius: 0 !important;
          .n-progress-graph-line-fill {
            border-radius: 0 !important;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 450px) {
  .battle-entity {
    width: 300px;
    .entity-info {
      .info {
        .name {
          font-size: 14px;
        }
        .affects {
          font-size: 12px;
        }
      }
      .vitals {
        font-size: 12px;
      }
    }  
  }
}

</style>