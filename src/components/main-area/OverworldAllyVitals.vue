<template>
  <div class="overworld-ally-vitals">
    <h3>{{ name }}</h3>
    <AllyVitals
      :entity="entity"
      :hide-rage-combo="true"
    >
    </AllyVitals>
  </div>

</template>

<script setup>
import AllyVitals from '@/components/main-area/battle-items/AllyVitals.vue'
import { defineProps, toRefs } from 'vue'

const props = defineProps({
  entity: Object,
  name: String
})

const { entity, name } = toRefs(props)
</script>

<style scoped lang="less">
.overworld-ally-vitals {
  width: 250px;
  height: 32px;
  margin-bottom: 10px;
  h3 {
    font-size: 14px;
    margin: 0;
    line-height: 10px;
  }
}

@media screen and (max-width: 500px) {
  .overworld-ally-vitals {
    width: 150px;
  }
}

</style>