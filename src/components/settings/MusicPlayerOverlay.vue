<template>
  <div class="music-player-container">
    <MusicPlayer></MusicPlayer>
  </div>
</template>
<script setup>

import MusicPlayer from '@/components/common/MusicPlayer.vue'

</script>

<style scoped lang="less">
.music-player-container {
  position: absolute;
  right: 36px;
  z-index: 3;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  flex-wrap: nowrap;
  margin-left: 8px;
  margin-bottom: 4px;
  padding-top: 4px;
  background-color: rgba(0, 0, 0, 0.9);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.9);
}
</style>