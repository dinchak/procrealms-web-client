<template>
  <div v-if="state.showMoreOptions" class="options-container">
    <div class="options-category" v-for="(options, title) in configurableOptions" :key="title">
      <h3 class="title">{{ title }}</h3>
      <div class="option" v-for="(option, label) in options" :key="label">
        <NSwitch :id="'option-' + option" v-model:value="state.options[option]" aria-label="{{ label }}"/>
        <label :for="'option-' + option">{{ label }}</label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NSwitch } from 'naive-ui'
import { state, configurableOptions } from '@/static/state'
</script>

<style lang="less" scoped>
.options-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-width: 460px;
  gap: 10px;
  @media (max-width: 750px) {
    flex-direction: column;
  }

  .options-category {
    display: flex;
    flex-direction: column;
    min-width: 220px;

    .title {
      margin: 0;
      padding: 0;
      font-size: 0.9em;
    }

    .option {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin: 5px 0 0 0;
      font-size: 0.9em;

      label {
        margin-left: 5px;
        font-size: 0.9em;
      }
    }
  }
}
</style>