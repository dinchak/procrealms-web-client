<template>
  <div class="bottom-hud">
    <div class="minimap-container" v-if="state.options.showOverlayMinimap">
      <MiniMap></MiniMap>
    </div>

    <div class="center-hud">
      <div class="top-center-hud">
        <div class="allies">
          <OverworldAllyVitals
            v-for="row in getAllies()"
            :key="row.entity.id"
            :entity="row.entity"
          >
          </OverworldAllyVitals>
        </div>

        <div class="affects">
          <div class="affect" v-for="affect in state.gameState.affects" :key="affect.name">
            <div class="name" v-html-safe="affect.longFlag ? ansiToHtml(ansi.reset + affect.longFlag) : ansiToHtml(ansi.reset + affect.name)"></div>

            <NProgress type="line" :show-indicator="false" :border-radius="0" :height="4"
            v-show="typeof affect.timeLeft == 'number'"
            :status="getTimeLeftPercentage(affect) >= 100 ? 'success' : 'warning'" :percentage="getTimeLeftPercentage(affect)" />

            <div class="desc" v-show="affect.desc" v-html-safe="ansiToHtml(ansi.reset + affect.desc)"></div>

            <div class="bonuses">

              <div class="bonus" v-for="bonus in affect.bonuses" :key="bonus.name">
                <div class="value">{{ (bonus.value > 0 ? '+' : '') + bonus.value }}</div>
                <div class="label">{{ bonus.name }}</div>
              </div>

              <div v-show="affect.charges" class="bonus">
                <div class="value">{{ affect.charges }}</div>
                <div class="label">charges</div>
              </div>
            </div>
          </div>
        </div>

        <div class="quests">
          <div class="quest" v-for="quest in state.gameState.quests" :key="quest.name">

            <div class="row">
              <div class="name" v-html-safe="getQuestName(quest)"></div>
              
              <div class="objectives" v-if="quest.extra || quest.objective">
                <div class="objective" v-if="quest.objective && quest.type != 'generated'" v-html-safe="ansiToHtml(ansi.reset + quest.objective)"></div>
                <div class="objective" v-if="quest.extra && !quest.activity.startsWith('kill')" v-html-safe="ansiToHtml(ansi.reset + quest.extra)"></div>
              </div>

              <NProgress
                v-if="quest.amount" 
                :status="quest.progress < quest.amount ? 'warning' : 'success'"
                type="line"
                :percentage="quest.progress / quest.amount * 100"
                :height="4"
                :border-radius="0"
              >
                <span class="progress-label" v-if="quest.progress < quest.amount">
                  {{ quest.progress }} of {{ quest.amount }}
                </span>
                <span class="progress-label bold-yellow" v-if="quest.progress >= quest.amount">
                  Done
                </span>
              </NProgress>

            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="movement-controls-container" v-if="state.options.hudMovementControls">
      <MobileMovement></MobileMovement>
    </div>
  </div>
</template>

<script setup>
import { NProgress } from 'naive-ui'

import { state } from '@/composables/state'
import { useHelpers } from '@/composables/helpers'

import MiniMap from '@/components/side-menu/MiniMap.vue'
import MobileMovement from '@/components/main-area/MobileMovement.vue'
import OverworldAllyVitals from '@/components/main-area/OverworldAllyVitals.vue'

const { ansiToHtml, ansi } = useHelpers()

function getAllies () {
  let entities = [{
    entity: state.gameState.player,
    name: state.gameState.player.name
  }]

  for (let charmie of state.gameState.charmies) {
    if (entities.find(e => e.entity.eid == charmie.stats.eid)) {
      continue
    }

    entities.push({
      entity: charmie.stats,
      name: charmie.stats.name
    })

    for (let subCharmie of charmie.charmies) {
      if (entities.find(e => e.entity.eid == subCharmie.stats.eid)) {
        continue
      }

      entities.push({
        entity: subCharmie.stats,
        name: subCharmie.stats.name
      })
    }
  }

  return entities
}

function getQuestName (quest) {
  return `L<span class="bold-white">${quest.level}</span> <span class="bold-yellow">${ansiToHtml(quest.name)}</span>`
}

function getTimeLeftPercentage (affect) {
  return Math.min(60, affect.timeLeft) / 60 * 100
}

</script>

<style scoped lang="less">
.bottom-hud {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  height: 140px;
  .minimap-container {
    margin-left: 10px;
  }
  .movement-controls-container {
    margin-right: 3px;
  }
  .center-hud {
    display: flex;
    flex-direction: row;
    height: 130px;
    padding-top: 5px;
    flex-basis: 100%;
    .top-center-hud {
      padding-left: 10px;
      padding-right: 10px;
      overflow-y: hidden;
      display: flex;
      flex-direction: row;
      height: 130px;
      width: 100%;
      justify-content: space-between;

      .allies {
        height: 130px;
        width: 200px;
        flex-basis: 200px;
        overflow-y: scroll;
        display: flex;
        flex-direction: column;
      }

      .affects {
        display: flex;
        flex-direction: column;
        flex-basis: 250px;
        width: 250px;
        height: 130px;
        overflow-y: scroll;

        .affect {
          display: flex;
          flex-direction: column;
          margin-bottom: 5px;
          padding-bottom: 5px;
          border-bottom: 1px solid #333;
          // line-height: 14px;
          &:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: 0;
          }
          .desc {
            font-size: 12px;
            line-height: 12px;
          }
          .bonuses {
            display: flex;
            flex-direction: row;
            .bonus {
              display: flex;
              flex-direction: row;
              align-items: center;
              margin-right: 10px;
              .value {
                margin-right: 5px;
              }
              .label {
                font-size: 12px;
              }
            }
          }
        }
      }

      .quests {
        height: 130px;
        overflow-y: scroll;
        flex-basis: 500px;
        width: 500px;
        .quest {
          display: flex;
          flex-direction: column;
          margin: 2px 0;
          border-bottom: 1px solid #333;
          &:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: 0;
          }
          .row {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            height: 24px;
            .name {
              font-size: 14px;
              line-height: 14px;
              min-width: 150px;
              margin-right: 5px;
            }
            .n-progress {
              max-width: 100px;
              font-size: 12px;
              margin-left: 5px;
              .progress-label {
                font-size: 14px;
                display: block;
                width: 50px;
                text-align: center;
              }
            }
            .objectives {
              display: flex;
              flex-direction: column;
              .objective {
                font-size: 12px;
                line-height: 12px;
              }
            }
          }
          .objective {
            font-size: 12px;
            line-height: 12px;
            text-align: right;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .bottom-hud {
    .center-hud {
      .top-center-hud {
        .affects {
          width: 200px;
          flex-basis: 200px;
        }
        .quests {
          width: 400px;
          flex-basis: 400px;
        }
      }
    }
  }
}

@media screen and (max-width: 1050px) {
  .bottom-hud {
    .center-hud {
      .top-center-hud {
        .affects {
          display: none;
        }

        .quests {
          width: 400px;
          flex-basis: 400px;
        }
      }
    }
  }
}

@media screen and (max-width: 850px) {
  .bottom-hud {
    .center-hud {
      .top-center-hud {
        .affects {
          width: 200px;
          flex-basis: 200px;
          display: initial;
        }
        .quests {
          display: none;
        }
      }
    }
  }
}

@media screen and (max-width: 650px) {
  .bottom-hud {
    .center-hud {
      .top-center-hud {
        .allies {
          flex-basis: 100%;
        }
        .affects {
          display: none;
        }
        .quests {
          display: none;
        }
      }
    }
  }
}

</style>