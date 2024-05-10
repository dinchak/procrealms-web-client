<template>
  <div class="game-modal-shortcuts">

    <div class="shortcut" @click="openGameModal('score')">
      <div class="icon">
        <img src="@/assets/icons/character.svg">
      </div>
    </div>

    <div class="shortcut" @click="openGameModal('skills')">
      <div class="icon">
        <img src="@/assets/icons/skills.svg">
      </div>
    </div>

    <div class="shortcut" @click="openGameModal('quests')">
      <div class="icon">
        <img src="@/assets/icons/trophy.svg">
      </div>
    </div>

    <div class="shortcut" @click="openGameModal('inventory')">
      <div class="icon">
        <img src="@/assets/icons/backpack.svg">
      </div>
    </div>

    <div class="shortcut" @click="openGameModal('equipment')">
      <div class="icon">
        <img src="@/assets/icons/battle-gear.svg">
      </div>
    </div>

    <div class="shortcut" @click="openGameModal('options')">
      <div class="icon">
        <img src="@/assets/icons/toggles.svg">
      </div>
    </div>

  </div>
</template>

<script setup>
import { state, setMode } from '@/static/state'

function openGameModal (pane) {
  state.gamepadTab = pane
  state.modals.gameModal = true
  setMode('modal')
}

</script>
<style lang="less">
.game-modal-shortcuts {
  display: flex;
  flex-direction: column;
  margin-top: 2px;
  .shortcut {
    cursor: pointer;
    height: 34px;
    width: 34px;
    user-select: none;
    border: 1px solid rgba(255, 255, 255, 0.24);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
    transition: all 0.3s;
    background: rgb(16, 16, 20);
    &:last-child {
      margin-right: 0;
    }
    &:hover {
      border: 1px solid #0cc6c6;
    }
    .icon {
      width: 24px;
      height: 24px;
    }
  }
}
</style>