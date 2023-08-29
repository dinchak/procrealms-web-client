<template>
  <div :class="getClass(entity)" @click="target(entity)">
    <div class="status">
      <div class="name" v-html-safe="ansiToHtml(`${entity.hp > 0 ? entity.tag + ' ' : ''}${entity.name}`)"></div>
      <div class="affects" v-html-safe="ansiToHtml(`${ansi.boldBlack}L${ansi.boldWhite}${entity.level}${ansi.reset} ${getAffects(entity)}`)"></div>
    </div>

    <n-progress v-if="entity.hp > 0" class="hp" type="line" status="success" aria-label="Health" :percentage="entity.hp">{{ entity.hp }}% <span class="bold-green">HP</span></n-progress>
    <n-progress v-if="entity.hp > 0" class="en" type="line" status="default" aria-label="Energy" :percentage="entity.en">{{ entity.en }}% <span class="bold-cyan">EN</span></n-progress>
    <n-progress v-if="entity.hp > 0" class="st" type="line" status="warning" aria-label="Stamina" :percentage="entity.st">{{ entity.st }}% <span class="bold-yellow">ST</span></n-progress>

    <div class="footer">
      <div class="left">
        <div v-if="entity.targetName && entity.hp > 0" class="targeting" v-html-safe="'Target: ' + ansiToHtml(entity.targetName)"></div>
        <div v-if="!entity.targetName && entity.hp > 0" class="targeting" v-html-safe="'Target: None'"></div>
      </div>
      <div class="right">
        <div class="action" v-if="entity.hp > 0">
          <n-progress type="circle" status="error" :percentage="entity.nextAction / 40 * 100" :show-indicator="false"></n-progress>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, toRefs } from 'vue'
import { NProgress } from 'naive-ui'
import stripAnsi from 'strip-ansi'

import { helpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'

const { ansiToHtml, ansi } = helpers()
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
  padding: 4px 8px;
  border: 2px solid #fff;
  border-radius: 4px;
  display: flex;
  width: 200px;
  flex-direction: column;
  justify-content: space-between;
  &.good {
    border-color: #246424;
    cursor: pointer;

    @media (hover: hover) {
      transition: all 0.3s;
      &:hover {
        box-shadow: 0 0 5px #50ff50;
        background-color: #111611;
      }
    }

    &.acting {
      border-color: #50ff50;
      box-shadow: 0 0 5px #50ff50;
    }
  }
  &.evil {
    border-color: #642424;
    cursor: pointer;

    @media (hover: hover) {
      transition: all 0.3s;
      &:hover {
        box-shadow: 0 0 5px #ff5050;
        background-color: #161111;
      }
    }

    &.acting {
      border-color: #ff5050;
      box-shadow: 0 0 5px #ff5050;
    }
  }

  &.dead {
    border-color: #333;
  }

  .status {
    display: flex;
    flex-direction: column;
    min-height: 30px;
    .name {
      font-size: 1rem;
    }
    .affects {
      font-size: 0.9rem;
    }
    .sten {
      display: flex;
      flex-direction: row;
      .en {
        flex-grow: 1;
      }
      .st {
        flex-grow: 1;
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
    font-size: 0.9rem;
    line-height: 0.9rem;
    .n-progress-custom-content {
      width: 60px;
      text-align: right;
      margin: 0;
    }
    --n-rail-height: 12px !important;
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

@media screen and (max-width: 1000px) {
  .battle-entity {
    width: 150px;
    .status {
      .name {
        font-size: 0.9rem;
      }
      .affects {
        font-size: 0.8rem;
      }
    }
    .targeting {
      font-size: 0.8rem;
    }
    .n-progress {
      font-size: 0.8rem;
      line-height: 0.8rem;
      .n-progress-custom-content {
        width: 50px;
        text-align: right;
        margin: 0;
      }
      --n-rail-height: 10px !important;
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

}

@media screen and (max-width: 800px) {
  .battle-entity {
    width: 125px;
    .status {
      .name {
        font-size: 0.8rem;
      }
      .affects {
        font-size: 0.7rem;
      }
    }
    .targeting {
      font-size: 0.7rem;
    }

    .n-progress {
      font-size: 0.7rem;
      line-height: 0.7rem;
      .n-progress-custom-content {
        width: 40px;
        text-align: right;
        margin: 0;
      }
      --n-rail-height: 8px !important;
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
}

</style>