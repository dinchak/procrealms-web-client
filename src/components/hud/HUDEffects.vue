<template>
  <div ref="effectsElement" class="hud-effects">
    <div
      v-for="(effect, index) in getEffects()"
      :key="getEffectKey(effect, index)"
      class="effect"
    >
      <div class="row">
        <div
          :ref="el => setEffectElement(getEffectKey(effect, index), el)"
          :class="getEffectNameClass(effect, index)"
          role="button"
          tabindex="0"
          v-html-safe="getEffectName(effect)"
          @mouseenter="showEffectDetail(effect, index, $event)"
          @mouseleave="hideEffectDetail(effect, index)"
          @click.stop="toggleEffectDetail(effect, index, $event)"
          @keydown.enter.prevent="toggleEffectDetail(effect, index, $event)"
          @keydown.space.prevent="toggleEffectDetail(effect, index, $event)"
        ></div>

        <NProgress
          v-if="hasTimeRemaining(effect)"
          type="line"
          :show-indicator="false"
          :border-radius="0"
          :height="4"
          :status="progressStatus(getTimeLeftPercentage(effect))"
          :percentage="getTimeLeftPercentage(effect)"
        />
      </div>
    </div>

    <Teleport to="body">
      <div
        class="hud-popup-panel"
        v-if="getActiveEffect()"
        :style="getFixedPanelStyle()"
      >
        <EffectDetails :effect="getActiveEffect()"></EffectDetails>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NProgress } from 'naive-ui'

import EffectDetails from '@/components/hud/EffectDetails.vue'

import { ANSI } from '@/static/constants'
import { useHelpers } from '@/composables/helpers'
import { useHudPopup } from '@/composables/hud_popup'

const props = defineProps({
  effects: {
    type: [Array, Object],
    default: () => []
  }
})

const { ansiToHtml, progressStatus } = useHelpers()

const effectsElement = ref(null)
const {
  pinnedKey: pinnedEffectKey,
  getActiveKey: getActiveEffectKey,
  getFixedPanelStyle,
  setPopupElement: setEffectElement,
  showPopup,
  hidePopup,
  togglePopup
} = useHudPopup(effectsElement, () => getEffects().map((effect, index) => getEffectKey(effect, index)))

function getEffects () {
  return Array.isArray(props.effects)
    ? props.effects
    : Object.values(props.effects || {})
}

function getEffectKey (effect, index) {
  return effect.name || effect.longFlag || String(index)
}

function getEffectName (effect) {
  if (!effect.longFlag && !effect.name) {
    return ansiToHtml(ANSI.reset + 'Effect')
  }

  return effect.longFlag
    ? ansiToHtml(ANSI.reset + effect.longFlag)
    : ansiToHtml(ANSI.reset + effect.name)
}

function getEffectNameClass (effect, index) {
  return {
    'effect-name': true,
    selectable: true,
    'popup-open': getActiveEffectKey() === getEffectKey(effect, index),
    pinned: pinnedEffectKey.value === getEffectKey(effect, index)
  }
}

function hasTimeRemaining (effect) {
  return typeof effect.timeLeft === 'number' && effect.timeLeft > 0 && effect.totalTimeLeft > 0
}

function getTimeLeftPercentage (effect) {
  if (!hasTimeRemaining(effect)) {
    return 0
  }

  return Math.min(100, Math.max(0, effect.timeLeft / effect.totalTimeLeft * 100))
}

function getActiveEffect () {
  const activeKey = getActiveEffectKey()
  return getEffects().find((effect, index) => getEffectKey(effect, index) === activeKey)
}

function showEffectDetail (effect, index, event) {
  showPopup(getEffectKey(effect, index), event)
}

function hideEffectDetail (effect, index) {
  hidePopup(getEffectKey(effect, index))
}

function toggleEffectDetail (effect, index, event) {
  togglePopup(getEffectKey(effect, index), event)
}
</script>

<style lang="less" scoped>
.hud-effects {
  display: flex;
  flex-basis: 200px;
  flex-direction: column;
  font-size: 0.8rem;
  height: 110px;

  .effect {
    display: flex;
    flex-direction: column;

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: 0;
    }

    .row {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-bottom: 5px;

      .effect-name {
        align-self: flex-start;
        box-sizing: border-box;
        cursor: pointer;
        display: block;
        max-width: 100%;
        min-height: 1.2em;
        outline: none;
        overflow: hidden;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:hover,
        &:focus-visible,
        &.popup-open {
          background: rgba(41, 185, 55, 0.12);
          text-decoration: underline;
        }

        &.pinned {
          background: rgba(41, 185, 55, 0.2);
        }
      }

      .n-progress {
        width: 90px;
      }
    }
  }
}

</style>
