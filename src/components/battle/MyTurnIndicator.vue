<template>
  <div class="my-turn">
    <TransitionGroup appear name="my-turn">
      <div key="myTurn" class="my-turn-icon">
        <NIconWrapper :size="28" :border-radius="4" class="active">
          <NIcon :size="24" color="#f5f500">
            <PriorityHighFilled />
          </NIcon>
        </NIconWrapper>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { NIcon, NIconWrapper } from 'naive-ui'
import { PriorityHighFilled } from '@vicons/material'
</script>

<style lang="less" scoped>
.my-turn {
  width: 28px;
  height: 28px;
  display: flex;
  background-color: #18181b;

  .my-turn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    transform-origin: center;

    .n-icon-wrapper.active {
      background-color: #18181b;
      animation: myturn-glow 2000ms ease-in-out infinite;
    }
  }
}

.my-turn-enter-active,
.my-turn-appear-active {
  animation: myturn-in 700ms cubic-bezier(.2,.9,.2,1) both;
}
.my-turn-leave-active {
  animation: myturn-out 350ms ease both;
}

@keyframes myturn-in {
  0% {
    transform: scale(0) rotate(-25deg);
    opacity: 0;
    filter: drop-shadow(0 0 0 rgba(245,245,0,0));
  }
  60% {
    transform: scale(1.2) rotate(12deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
    filter: drop-shadow(0 0 12px rgba(245,245,0,0.95));
  }
}

@keyframes myturn-out {
  0% {
    transform: scale(1);
    opacity: 1;
    filter: drop-shadow(0 0 12px rgba(245,245,0,0.95));
  }
  100% {
    transform: scale(0.6) rotate(10deg);
    opacity: 0;
    filter: drop-shadow(0 0 0 rgba(0,0,0,0));
  }
}

@keyframes myturn-glow {
  0% {
    box-shadow: 0 0 0 rgba(245,245,0,0.30);
    transform: translateY(0);
  }
  50% {
    box-shadow: 0 0 14px rgba(245,245,0,0.95);
    transform: translateY(-2px);
  }
  100% {
    box-shadow: 0 0 0 rgba(245,245,0,0.30);
    transform: translateY(0);
  }
}
</style>
