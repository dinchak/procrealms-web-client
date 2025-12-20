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
  top: 40px;
  right: 40px;
  z-index: 3;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  flex-wrap: nowrap;

  @media screen and (max-width: 650px) {
    top: 0;
    flex-wrap: wrap;
    gap: 5px;
  }
}
</style>