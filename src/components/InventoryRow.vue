<template>
  <div>
    <div v-html="props.amount + 'x ' + ansiSpan(props.colorName)"></div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { ansiSpan } from 'ansi-to-span'

const props = defineProps(['colorName', 'amount'])
</script>