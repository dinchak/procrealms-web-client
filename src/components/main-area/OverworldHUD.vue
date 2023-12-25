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
            <div class="name" v-html-safe="affect.longFlag ? ansiToHtml(affect.longFlag) : affect.name"></div>
            <NProgress v-show="typeof affect.timeLeft == 'number'" type="line" status="success" :percentage="Math.min(60, affect.timeLeft) / 60 * 100" :show-indicator="false" :border-radius="0" />
            <div class="desc" v-show="affect.desc" v-html-safe="ansiToHtml(affect.desc)"></div>
            <div class="bonuses">
              <div class="bonus" v-for="bonus in affect.bonuses" :key="bonus.name">
                <div class="value">{{ bonus.value }}</div>
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
            <div class="name" v-html-safe="getQuestName(quest)"></div>
            <div class="given" v-html-safe="getGivenBy(quest)"></div>
            <div class="objective" v-if="quest.objective" v-html-safe="ansiToHtml(quest.objective)"></div>
            <NProgress
              v-if="quest.amount" 
              :status="quest.progress < quest.amount ? 'default' : 'success'"
              type="line"
              :percentage="quest.progress / quest.amount * 100"
            >
              <span v-if="quest.progress < quest.amount">
                {{ quest.progress }} of {{ quest.amount }}
              </span>
              <span class="bold-yellow" v-if="quest.progress >= quest.amount">
                Complete
              </span>
            </NProgress>
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

const { ansiToHtml } = useHelpers()

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

function getGivenBy (quest) {
  return `Given by <span class="bold-yellow">${quest.giver.name}</span>`
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

      .allies {
        height: 130px;
        overflow-y: scroll;
        flex-basis: 220px;
        margin-right: 10px;
      }

      .affects {
        display: flex;
        flex-direction: column;
        flex-basis: 230px;
        width: 230px;
        height: 130px;
        margin-right: 10px;
        overflow-y: scroll;

        .affect {
          display: flex;
          flex-direction: column;
          margin-bottom: 5px;
          padding-bottom: 5px;
          border-bottom: 1px solid #333;
          &:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: 0;
          }
          .desc {
            font-size: 12px;
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
        flex-basis: calc(100% - 470px);

        .quest {
          display: flex;
          flex-direction: column;
          margin-bottom: 5px;
          padding-bottom: 5px;
          border-bottom: 1px solid #333;
          &:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: 0;
          }
          // .name {
          //   font-size: 12px;
          // }
          .given {
            font-size: 14px;
          }
          .objective {
            font-size: 14px;
            white-space: pre-line;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1000px) {
  .bottom-hud {
    .center-hud {
      .top-center-hud {
        .allies {
        }
        .affects {
        }
        .quests {
          display: none;
        }
      }
    }
  }
}

@media screen and (max-width: 750px) {
  .bottom-hud {
    .center-hud {
      .top-center-hud {
        .allies {
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

@media screen and (max-width: 500px) {
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