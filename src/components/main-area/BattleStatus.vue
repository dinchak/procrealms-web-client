<template>
  <div class="battle-status" ref="battleStatus">
    <div class="side good">
      <div class="entity" v-for="entity in getSide('good')" :key="entity.name">
        <BattleAction :entity="entity"></BattleAction>
        <BattleVitals :entity="entity"></BattleVitals>
        <BattleName :entity="entity"></BattleName>
        <BattleCaret :entity="entity" caret="&lt;"></BattleCaret>
      </div>
    </div>

    <div class="vs">VS</div>

    <div class="side evil">
      <div class="entity" v-for="entity in getSide('evil')" :key="entity.name">
        <BattleCaret :entity="entity" caret="&gt;"></BattleCaret>
        <BattleName :entity="entity"></BattleName>
        <BattleVitals :entity="entity"></BattleVitals>
        <BattleAction :entity="entity"></BattleAction>
      </div>
    </div>
  </div>

  <div class="mobile-battle-status">
    <div class="side good">
      <div class="entity" v-for="entity in getSide('good')" :key="entity.name">
        <BattleAction :entity="entity"></BattleAction>
        <BattleVitals :entity="entity"></BattleVitals>
        <BattleName :entity="entity"></BattleName>
        <BattleCaret :entity="entity" caret="&lt;"></BattleCaret>
      </div>
    </div>

    <div class="vs">- VS -</div>

    <div class="side evil">
      <div class="entity" v-for="entity in getSide('evil')" :key="entity.name">
        <BattleCaret :entity="entity" caret="&gt;"></BattleCaret>
        <BattleName :entity="entity"></BattleName>
        <BattleVitals :entity="entity"></BattleVitals>
        <BattleAction :entity="entity"></BattleAction>
      </div>
    </div>
  </div>

</template>

<script setup>
import { onMounted, ref } from 'vue'

import { state } from '@/composables/state'

import BattleAction from '@/components/main-area/battle-items/BattleAction.vue'
import BattleCaret from '@/components/main-area/battle-items/BattleCaret.vue'
import BattleName from '@/components/main-area/battle-items/BattleName.vue'
import BattleVitals from '@/components/main-area/battle-items/BattleVitals.vue'

const battleStatus = ref(null)

function getSide (side) {
  return state.gameState.battle.participants.filter(p => p.side == side)
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
        .status {
          height: 16px;
          width: 100%;
          text-align: center;
        }
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
        .status {
          height: 16px;
          width: 100%;
          text-align: center;
        }
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
