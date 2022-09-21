<template>
  <div class="battle-status">
    <div class="side good">
      <div class="entity" v-for="entity in getSide('good')" :key="entity.name">
        <div class="vitals">
          <n-progress type="circle" status="success" :percentage="entity.hp">HP</n-progress>
          <n-progress type="circle" status="default" :percentage="entity.en">EN</n-progress>
          <n-progress type="circle" status="warning" :percentage="entity.st">ST</n-progress>
          <n-progress type="circle" status="error" :percentage="entity.nextAction / 20 * 100">AC</n-progress>
        </div>
        <div class="name" v-html="ansiSpan(entity.name)"></div>
        <div class="caret" v-if="entity.isActing">&lt;</div>
        <div class="caret" v-if="!entity.isActing"></div>
      </div>
    </div>

    <div class="vs">VS</div>

    <div class="side evil">
      <div class="entity" v-for="entity in getSide('evil')" :key="entity.name">
        <div class="caret" v-if="entity.isActing">&gt;</div>
        <div class="caret" v-if="!entity.isActing"></div>
        <div class="name" v-html="ansiSpan(entity.name)" @click="target(entity)"></div>
        <div class="vitals">
          <n-progress type="circle" status="success" :percentage="entity.hp">HP</n-progress>
          <n-progress type="circle" status="default" :percentage="entity.en">EN</n-progress>
          <n-progress type="circle" status="warning" :percentage="entity.st">ST</n-progress>
          <n-progress type="circle" status="error" :percentage="entity.nextAction / 20 * 100">AC</n-progress>
        </div>
      </div>
    </div>
  </div>

  <div class="mobile-battle-status">
    <div class="side good">
      <div class="entity" v-for="entity in getSide('good')" :key="entity.name">
        <div class="vitals">
          <n-progress type="circle" status="success" :percentage="entity.hp">HP</n-progress>
          <n-progress type="circle" status="default" :percentage="entity.en">EN</n-progress>
          <n-progress type="circle" status="warning" :percentage="entity.st">ST</n-progress>
          <n-progress type="circle" status="error" :percentage="entity.nextAction / 20 * 100">AC</n-progress>
        </div>
        <div class="name" v-html="ansiSpan(entity.name)"></div>
        <div class="caret" v-if="entity.isActing">&lt;</div>
        <div class="caret" v-if="!entity.isActing"></div>
      </div>
    </div>

    <div class="vs">VS</div>

    <div class="side evil">
      <div class="entity" v-for="entity in getSide('evil')" :key="entity.name">
        <div class="caret" v-if="entity.isActing">&gt;</div>
        <div class="caret" v-if="!entity.isActing"></div>
        <div class="name" v-html="ansiSpan(entity.name)" @click="target(entity)"></div>
        <div class="vitals">
          <n-progress type="circle" status="success" :percentage="entity.hp">HP</n-progress>
          <n-progress type="circle" status="default" :percentage="entity.en">EN</n-progress>
          <n-progress type="circle" status="warning" :percentage="entity.st">ST</n-progress>
          <n-progress type="circle" status="error" :percentage="entity.nextAction / 20 * 100">AC</n-progress>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ansiSpan } from 'ansi-to-span'
import stripAnsi from 'strip-ansi'

import { state } from '@/composables/state'
import { useKeyHandler } from '@/composables/key_handler'
import { useWebSocket } from '@/composables/web_socket'

import { NProgress } from 'naive-ui'

const { cmd } = useWebSocket()
const { onKeydown } = useKeyHandler()

onKeydown((ev) => {
  console.log(`LineOutput onKeyDown=${ev.key}`)
})

function getSide (side) {
  return state.gameState.battle.participants.filter(p => p.side == side)
}

function target (entity) {
  cmd(`target ${stripAnsi(entity.tag)}`)
}

</script>

<style lang="less">
.mobile-battle-status {
  display: none;
  background-color: rgba(20, 0, 0, 0.95);
  border-bottom: 1px solid rgba(255, 0, 0, 0.15);
  padding: 10px;
  position: absolute;
  top: 0;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;

  .vs {
    font-size: 14px;
    align-self: center;
    text-align: center;
    margin: 2px 0px;
    color: darken(#c50f1f, 5%);
  }

  .side {
    width: 100%;
    .entity {
      width: 100%;
      padding: 2px 2px 5px 2px;
      border-bottom: 1px solid rgba(255, 0, 0, 0.15);
      margin-bottom: 5px;
      align-items: center;
      &:last-child {
        border: 0;
        margin-bottom: 0;
        padding: 2px;
      }
      .vitals {
        width: 130px;
        align-content: center;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        align-items: center;
        align-content: center;
      }
      .name {
        width: ~"calc(100% - 10px)";
        margin: 0 5px;
        font-size: 20px;
        line-height: 32px;
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }
      .caret {
        font-size: 12px;
        line-height: 32px;
        color: #f9f1a5;
      }
      .n-progress {
        width: 24px;
        height: 28px;
        margin: 0 2px;
      }
    }

    &.good {
      .entity {
        display: grid;
        grid-template-columns: 130px calc(100% - 150px) 10px;
      }
    }

    &.evil {
      .entity {
        display: grid;
        grid-template-columns: 10px calc(100% - 160px) 130px;
        margin-right: 10px;
        .name {
          text-align: right;
        }
      }
    }
  }
}

.battle-status {
  background-color: rgba(20, 0, 0, 0.95);
  border-bottom: 1px solid rgba(255, 0, 0, 0.15);
  padding: 10px;
  position: absolute;
  top: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  z-index: 100;

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
      border-bottom: 1px solid rgba(255, 0, 0, 0.15);
      margin-bottom: 5px;
      align-items: center;
      &:last-child {
        border: 0;
        margin-bottom: 0;
        padding: 2px;
      }
      .vitals {
        width: 130px;
        align-content: center;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        align-items: center;
        align-content: center;
      }
      .name {
        width: ~"calc(100% - 10px)";
        margin: 0 5px;
        font-size: 20px;
        line-height: 32px;
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }
      .caret {
        font-size: 12px;
        line-height: 32px;
        color: #f9f1a5;
      }
      .n-progress {
        width: 24px;
        height: 28px;
        margin: 0 2px;
      }
    }

    &.good {
      .entity {
        display: grid;
        grid-template-columns: 130px calc(100% - 150px) 10px;
      }
    }

    &.evil {
      .entity {
        display: grid;
        grid-template-columns: 10px calc(100% - 160px) 130px;
        margin-right: 10px;
        .name {
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
          width: 75px;
        }
      }
      &.good {
        .entity {
          display: grid;
          grid-template-columns: 75px calc(100% - 100px) 10px;
        }
      }
      &.evil {
        .entity {
          grid-template-columns: 10px calc(100% - 100px) 75px;
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
          width: 75px;
        }
      }
      &.good {
        .entity {
          display: grid;
          grid-template-columns: 75px calc(100% - 100px) 10px;
        }
      }
      &.evil {
        .entity {
          grid-template-columns: 10px calc(100% - 100px) 75px;
        }
      }
    }
  }
}


</style>
