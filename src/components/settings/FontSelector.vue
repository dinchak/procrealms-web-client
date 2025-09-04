<template>
  <div class="font-selector-container">
    <h3>Font Settings</h3>
    <NSelect
      class="font-selector"
      v-model:value="selectedFontFamily"
      placeholder="Select Font"
      :options="FONT_OPTIONS"
      aria-label="Select Font"
      @update:value="onSetFontFamily"
    />

    <NRadioGroup v-model:value="selectedFontSize" name="radiobuttongroup1" class="font-size-selector">
      <NRadioButton
        v-for="fontSize in FONT_SIZES"
        :key="fontSize.value"
        :value="fontSize.value"
        :label="fontSize.label"
        @change="onSetFontSize"
        class="selectable"
      />
    </NRadioGroup>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { NSelect, NRadioGroup, NRadioButton } from 'naive-ui'

import { state } from '@/static/state'
import { useWindowHandler } from '@/composables/window_handler'
import { FONT_OPTIONS, FONT_SIZES } from '@/static/constants'

const { setFontFamily, setFontSize } = useWindowHandler()

const selectedFontSize = ref(state.options.fontSize)
const selectedFontFamily = ref(state.options.fontFamily)

function onSetFontFamily () {
  setFontFamily(selectedFontFamily.value)
}

function onSetFontSize () {
  setFontSize(selectedFontSize.value)
}

</script>
<style lang="less" scoped>
.font-selector-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;

  h3 {
    padding: 0;
    margin-top: 5px;
    margin-bottom: 16px;
    font-weight: normal;
    font-size: 16px;
    color: #fff;
  }

  .n-select {
    margin-bottom: 5px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>