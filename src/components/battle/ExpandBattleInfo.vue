<template>
  <div class="expand-container">
    <div class="expand-btn">
      <NIconWrapper :size="28" :border-radius="4">
        <NIcon :size="24" color="#f5f5f5">
          <UnfoldMoreFilled v-if="!expandEntities" @click.stop="toggleInfo()"></UnfoldMoreFilled>
          <UnfoldLessFilled v-if="expandEntities" @click.stop="toggleInfo()"></UnfoldLessFilled>
        </NIcon>
      </NIconWrapper>
      <div class="expand-label">
        {{ expandEntities ? 'Less Info' : 'More Info' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { state } from '@/static/state'
import { NIcon, NIconWrapper } from 'naive-ui'
import { UnfoldMoreFilled, UnfoldLessFilled } from '@vicons/material'

const expandEntities = computed({
  get: () => state.options.battleExpanded,
  set: v => { state.options.battleExpanded = v }
})

function toggleInfo () {
  expandEntities.value = !expandEntities.value
}

</script>

<style lang="less" scoped>
.expand-container {
  display: flex;
  .expand-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transform-origin: center;
    flex-direction: column;
    cursor: pointer;

    .n-icon-wrapper {
      background-color: #18181b;
      &:hover {
        background-color: #333;
      }
    }
  }

  .expand-label {
    margin-top: 8px;
    font-size: 10px;
    color: #f5f500;
    text-shadow: 0 0 6px rgba(245,245,0,0.75);
  }
}

</style>