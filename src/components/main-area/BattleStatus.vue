<template>
  <div class="battle-status" ref="battleStatus">
    <div class="side good">
      <div class="entity" v-for="entity in getSide('good')" :key="entity.name">
        <div class="action">
          <n-progress type="circle" status="error" :percentage="entity.nextAction / 20 * 100" :show-indicator="false"></n-progress>
        </div>
        <div class="vitals" v-if="entity.hp > 0">
          <n-progress type="line" status="success" aria-label="Health" :percentage="entity.hp" :show-indicator="false"></n-progress>
          <n-progress type="line" status="default" aria-label="Energy" :percentage="entity.en" :show-indicator="false"></n-progress>
          <n-progress type="line" status="warning" aria-label="Stamina" :percentage="entity.st" :show-indicator="false"></n-progress>
        </div>
        <div class="vitals bold-red" v-if="entity.hp == 0">DEAD</div>
        <div class="name-container">
          <div class="name" v-html="ansiToHtml(entity.name)" @click="target(entity)"></div>
          <div v-if="entity.target" class="targeting" v-html="'Target: ' + ansiToHtml(entity.target)"></div>
          <div v-if="!entity.target" class="targeting">No target</div>
        </div>
        <div class="caret" v-if="entity.isActing">&lt;</div>
        <div class="caret" v-if="!entity.isActing"></div>
      </div>
    </div>

    <div class="vs">VS</div>

    <div class="side evil">
      <div class="entity" v-for="entity in getSide('evil')" :key="entity.name">
        <div class="caret" v-if="entity.isActing">&gt;</div>
        <div class="caret" v-if="!entity.isActing"></div>
        <div class="name-container">
          <div class="name" v-html="ansiToHtml(entity.name)" @click="target(entity)"></div>
          <div v-if="entity.target" class="targeting" v-html="'Target: ' + ansiToHtml(entity.target)"></div>
          <div v-if="!entity.target" class="targeting">No target</div>
        </div>
        <div class="vitals" v-if="entity.hp > 0">
          <n-progress type="line" status="success" aria-label="Enemy Health" :percentage="entity.hp" :show-indicator="false"></n-progress>
          <n-progress type="line" status="default" aria-label="Enemy Energy" :percentage="entity.en" :show-indicator="false"></n-progress>
          <n-progress type="line" status="warning" aria-label="Enemy Stamina" :percentage="entity.st" :show-indicator="false"></n-progress>
        </div>
        <div class="vitals bold-red" v-if="entity.hp == 0">DEAD</div>
        <div class="action">
          <n-progress type="circle" status="error" :percentage="entity.nextAction / 20 * 100" :show-indicator="false"></n-progress>
        </div>
      </div>
    </div>
  </div>

  <div class="mobile-battle-status">
    <div class="side good">
      <div class="entity" v-for="entity in getSide('good')" :key="entity.name">
        <div class="action">
          <n-progress type="circle" status="error" :percentage="entity.nextAction / 20 * 100" :show-indicator="false"></n-progress>
        </div>
        <div class="vitals" v-if="entity.hp > 0">
          <n-progress type="line" status="success" :percentage="entity.hp" :show-indicator="false"></n-progress>
          <n-progress type="line" status="default" :percentage="entity.en" :show-indicator="false"></n-progress>
          <n-progress type="line" status="warning" :percentage="entity.st" :show-indicator="false"></n-progress>
        </div>
        <div class="vitals bold-red" v-if="entity.hp == 0">DEAD</div>
        <div class="name-container">
          <div class="name" v-html="ansiToHtml(entity.name)" @click="target(entity)"></div>
          <div v-if="entity.target" class="targeting" v-html="'Target: ' + ansiToHtml(entity.target)"></div>
          <div v-if="!entity.target" class="targeting">No target</div>
        </div>
        <div class="caret" v-if="entity.isActing">&lt;</div>
        <div class="caret" v-if="!entity.isActing"></div>
      </div>
    </div>

    <div class="vs">- VS -</div>

    <div class="side evil">
      <div class="entity" v-for="entity in getSide('evil')" :key="entity.name">
        <div class="caret" v-if="entity.isActing">&gt;</div>
        <div class="caret" v-if="!entity.isActing"></div>
        <div class="name-container">
          <div class="name" v-html="ansiToHtml(entity.name)" @click="target(entity)"></div>
          <div v-if="entity.target" class="targeting" v-html="'Target: ' + ansiToHtml(entity.target)"></div>
          <div v-if="!entity.target" class="targeting">No target</div>
        </div>
        <div class="vitals" v-if="entity.hp > 0">
          <n-progress type="line" status="success" :percentage="entity.hp" :show-indicator="false"></n-progress>
          <n-progress type="line" status="default" :percentage="entity.en" :show-indicator="false"></n-progress>
          <n-progress type="line" status="warning" :percentage="entity.st" :show-indicator="false"></n-progress>
        </div>
        <div class="vitals bold-red" v-if="entity.hp == 0">DEAD</div>
        <div class="action">
          <n-progress type="circle" status="error" :percentage="entity.nextAction / 20 * 100" :show-indicator="false"></n-progress>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { onMounted, ref } from 'vue'
import stripAnsi from 'strip-ansi'

import { state } from '@/composables/state'
import { useWebSocket } from '@/composables/web_socket'

import { helpers } from '@/composables/helpers'

import { NProgress } from 'naive-ui'

const { cmd } = useWebSocket()
const { ansiToHtml } = helpers()

const battleStatus = ref(null)

function getSide (side) {
  return state.gameState.battle.participants.filter(p => p.side == side)
}

function target (entity) {
  cmd(`target ${stripAnsi(entity.tag)}`)
}

onMounted(() => {
  let parent = battleStatus.value?.parentElement
  if (parent) {
    parent.scrollTo(0, parent.scrollHeight)
  }
})

</script>

<style lang="less">
.mobile-battle-status {
  display: none;
  background-color: rgb(20, 0, 0, );
  border-bottom: 1px solid rgb(30, 0, 0, );
  top: 0;
  width: 100%;
  margin-top: 5px;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .vs {
    font-size: 14px;
    line-height: 40px;
    align-self: center;
    text-align: center;
    color: darken(#c50f1f, 5%);
  }

  .side {
    width: 100%;
    .entity {
      width: 100%;
      padding: 2px;
      align-items: center;
      &:last-child {
        border: 0;
        margin-bottom: 0;
        padding: 2px;
      }
      .action {
        display: flex;
        justify-content: center;
        .n-progress {
          height: 20px;
          width: 20px;
        }
      }
      .vitals {
        width: 130px;
        align-content: center;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        align-items: center;
        font-size: 16px;
      }
      .name-container {
        width: ~"calc(100% - 10px)";
        margin: 0 5px;
        display: flex;
        flex-direction: column;
        .name {
          font-size: 20px;
          line-height: 16px;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
        .targeting {
          font-size: 14px;
          line-height: 10px;
        }
      }
      .caret {
        font-size: 12px;
        line-height: 24px;
        color: #f9f1a5;
      }
      .n-progress {
        // width: 28px;
        // height: 32px;
        // margin: 0 2px;
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

    &.good {
      .entity {
        display: grid;
        grid-template-columns: 35px 130px calc(100% - 180px) 10px;
      }
    }

    &.evil {
      .entity {
        display: grid;
        grid-template-columns: 10px calc(100% - 180px) 130px 35px;
        margin-right: 10px;
        .name-container {
          text-align: right;
        }
      }
    }
  }
}

.battle-status {
  background-color: rgb(20, 0, 0);
  border-bottom: 1px solid rgb(30, 0, 0);
  width: 100%;
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  z-index: 100;
  position: relative;
  bottom: 0;

  .vs {
    font-size: 24px;
    align-self: center;
    margin: 0 20px;
    color: darken(#c50f1f, 5%);
  }

  .side {
    width: 100%;
    .entity {
      width: 100%;
      padding: 2px 2px 5px 2px;
      border-bottom: 1px solid rgb(30, 0, 0);
      margin-bottom: 5px;
      align-items: center;
      &:last-child {
        border: 0;
        margin-bottom: 0;
        padding: 2px;
      }
      .action {
        display: flex;
        justify-content: center;
        .n-progress {
          height: 20px;
          width: 20px;
        }
      }
      .vitals {
        width: 130px;
        align-content: center;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        align-items: center;
        font-size: 16px;
      }
      .name-container {
        width: ~"calc(100% - 10px)";
        margin: 0 5px;
        display: flex;
        flex-direction: column;
        .name {
          font-size: 20px;
          line-height: 16px;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
        .targeting {
          font-size: 14px;
          line-height: 10px;
        }
      }
      .caret {
        font-size: 14px;
        line-height: 14px;
        color: #f9f1a5;
      }
      .n-progress {
        // width: 28px;
        // height: 32px;
        // margin: 0 2px;
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

    &.good {
      .entity {
        display: grid;
        grid-template-columns: 35px 130px calc(100% - 180px) 10px;
      }
    }

    &.evil {
      .entity {
        display: grid;
        grid-template-columns: 10px calc(100% - 180px) 130px 35px;
        margin-right: 10px;
        .name-container {
          text-align: right;
        }
      }
    }
  }
}

@media screen and (max-width: 1300px) {
  .battle-status {
    .side {
      .entity {
        .vitals {
          width: 60px;
        }
      }
      &.good {
        .entity {
          display: grid;
          grid-template-columns: 35px 60px calc(100% - 105px) 10px;
        }
      }
      &.evil {
        .entity {
          grid-template-columns: 10px calc(100% - 105px) 60px 35px;
        }
      }
    }
  }
}

@media screen and (max-width: 900px) {
  .battle-status {
    display: none;
  }
  .mobile-battle-status {
    display: flex;
  }
}

@media screen and (max-width: 650px) {
  .mobile-battle-status {
    .side {
      .entity {
        .vitals {
          width: 60px;
        }
      }
      &.good {
        .entity {
          display: grid;
          grid-template-columns: 35px 60px calc(100% - 105px) 10px;
        }
      }
      &.evil {
        .entity {
          grid-template-columns: 10px calc(100% - 105px) 60px 35px;
        }
      }
    }
  }
}

@media screen and (max-height: 500px) {
  .mobile-battle-status {
    .vs {
      line-height: 20px;
    }
    .side {
      .entity {
        .n-progress {
          // width: 28px;
          // height: 32px;
          // margin: 0 2px;
          --n-rail-height: 7px !important;
        }
        .name-container {
          .name {
            font-size: 16px;
            line-height: 12px;
          }
        }
      }
    }
  }
}


</style>
