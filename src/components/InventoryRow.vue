<template>
  <div class="inventory-item">
    <div v-on:click="toggle()"
         v-html="chevron() + props.amount + 'x ' + ansiSpan(props.colorName)"
         class="item-name"></div>
    <div v-if="!hidden" class="actions">
      <n-button v-for="action in actions"
                size="medium"
                :disabled="action === 'drink' && isDrinkDisabled"
                @click="cmd(`${action} ${props.name}`) && toggle()"
                :key="action"
                class="action">
        {{action}}
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, reactive } from 'vue'
import { ansiSpan } from 'ansi-to-span'
import { NButton } from 'naive-ui'
import { useWebSocket } from '@/composables/web_socket'
import { helpers } from '@/composables/helpers'
import { state } from '@/composables/state'

const props = defineProps(['iid', 'colorName', 'amount', 'name', 'type', 'subtype', 'expanded', 'toggleExpand'])
const { getActions } = helpers()
const hidden = ref(!props.expanded)
const { cmd } = useWebSocket()
const emit = defineEmits(['toggled'])

function toggle() {
  hidden.value = !hidden.value
  emit('toggled', props.iid)
}

function chevron() {
  return hidden.value ? '- ' : '| '
}

let actions = reactive(getActions({
  name: props.name,
  type: props.type,
  subtype: props.subtype
}))

const isDrinkDisabled = ref(false)
watch(()=> state.gameState.affects, () => {
  isDrinkDisabled.value = !!(props.type === 'consumable' &&
      props.subtype === 'potion' &&
      state.gameState.affects.find(af => af.name === props.name));
})
</script>

<style scoped lang="less">
  .inventory-item {
    padding-bottom: 5px;
    .item-name {
      cursor: pointer;
    }
  }

  .actions {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 10px 0;
    .action {
      margin: 2px 2px;
      text-transform: capitalize;
    }
  }

</style>