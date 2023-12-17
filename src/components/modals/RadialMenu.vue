<template>
  <ul
    class="radial-menu"
    v-show="visible"
    :style="{ left: 'calc(50vw - 210px - ' + offsetLeft + 'px' }"
  >
    <li v-for="i in 12" :key="i" class="menu-item">
      <div class="text-container" :class="getTextContainerClass(i, items[i])">
        <span class="text">{{ items[i] || i }}</span>
      </div>
    </li>
  </ul>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps(['items', 'visible', 'selectedSlot', 'offsetLeft'])

function getTextContainerClass (slot, filled) {
  return {
    'active': slot == props.selectedSlot,
    'filled': typeof filled != 'undefined'
  }
}
</script>

<style scoped lang="less">
.radial-menu {
  position: relative;
  top: 0;
  margin-right: 420px;
  transition: all 0.3s;
  .menu-item {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    margin: auto;
    width: 420px;
    height: 420px;
    transition: all 0.3s;
    .text-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 60px;
      color: #aaa;
      border: 1px solid #333;
      word-wrap: break-word;
      text-align: center;
      font-size: 12px;
      line-height: 10px;
      transition: all 0.3s;
      border-radius: 4px;
      background-color: #000000;

      &.filled {
        color: #fff;
        background-color: #111511;
        border: 1px solid #16c60c;
      }

      &.active {
        color: #ff8;
        background-color: darken(#16c60c, 33%);
      }
    }

    &:nth-child(1) { transform: rotate(0deg); div { transform: rotate(0deg); } }
    &:nth-child(2) { transform: rotate(-30deg); div { transform: rotate(30deg); } }
    &:nth-child(3) { transform: rotate(-60deg); div { transform: rotate(60deg); } }
    &:nth-child(4) { transform: rotate(-90deg); div { transform: rotate(90deg); } }
    &:nth-child(5) { transform: rotate(-120deg); div { transform: rotate(120deg); } }
    &:nth-child(6) { transform: rotate(-150deg); div { transform: rotate(150deg); } }
    &:nth-child(7) { transform: rotate(-180deg); div { transform: rotate(180deg); } }
    &:nth-child(8) { transform: rotate(-210deg); div { transform: rotate(210deg); } }
    &:nth-child(9) { transform: rotate(-240deg); div { transform: rotate(240deg); } }
    &:nth-child(10) { transform: rotate(-270deg); div { transform: rotate(270deg); } }
    &:nth-child(11) { transform: rotate(-300deg); div { transform: rotate(300deg); } }
    &:nth-child(12) { transform: rotate(-330deg); div { transform: rotate(330deg); } }
  }
}
</style>