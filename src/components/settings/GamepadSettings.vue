<template>
  <div class="gamepad-settings">
    <h3 class="gamepad-title" v-if="Object.values(state.gamepads).length > 0">Gamepads Detected</h3>
    <ul v-bind:key="idx" v-for="(gamepad, idx) in state.gamepads">
      <li>{{ gamepad }}</li>
    </ul>
  </div>
</template>
<script setup>
import { state } from '@/static/state'
</script>
<style lang="less" scoped>
.gamepad-settings {
  .gamepad-title {
    font-size: 0.9em;
    margin: 0;
  }
  ul {
    margin: 0;
    padding: 0;
    font-size: 0.9em;
    li {
      margin: 2px 0;
      padding: 0;

    }
  }
}

</style>