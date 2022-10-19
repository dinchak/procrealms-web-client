<template>
	<n-card>
		<p class="close" v-on:click="closeModal()">x</p>
	</n-card>
</template>

<script setup>
import { watch } from 'vue'
import { NCard } from 'naive-ui'
import { state } from '@/composables/state'

watch(() => state.gameState.party, function() {
	console.log("updated")
})

function closeModal() {	
  state.modals.mercModal = false
}
</script>

<style scoped>

.n-card {
  position: absolute;
  max-width: 5vw;
  margin-top: 35px;
  z-index: 2;
}
</style>
