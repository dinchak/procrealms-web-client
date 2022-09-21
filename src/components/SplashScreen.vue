<template>
  <div ref="picture" class="picture" v-html="state.picture"></div>
  <div class="login-controls" v-if="state.connected">
    <n-button type="success" size="large" @click="state.showLogin = true">Login</n-button>
    <n-button type="warning" size="large" @click="state.showNewPlayer = true">New Player</n-button>
  </div>
  <div class="login-controls" v-if="!state.connected">
    Connecting...
  </div>
</template>

<script setup>
import { state } from '@/composables/state'
import { NButton } from 'naive-ui'
</script>

<style scoped lang="less">
.picture {
  user-select: none;
  min-height: 300px;
  font-size: 20px;
  line-height: 20px;
  white-space: pre;
  text-align: center;
}

.login-controls {
  position: relative;
  top: -225px;
  background-color: rgba(23,23,23,0.6);
  padding: 10px;
  margin: 0 auto;
  width: 250px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

@media screen and (max-width: 1000px) {
  .picture {
    font-size: 16px;
    line-height: 16px;
  }
  .login-controls {
    top: -175px;
  }
}

@media screen and (max-width: 800px) {
  .picture {
    font-size: 12px;
    line-height: 12px;
  }
  .login-controls {
    top: -125px;
  }
}

</style>
