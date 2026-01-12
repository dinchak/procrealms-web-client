<template>
  <GameModal
    v-model="state.modals.craftingModal"
    title="Crafting"
    modal-class="crafting-modal"
    modal-key="craftingModal"
    @opened="onModalOpened"
    @closed="onModalClosed"
  >
    <div class="crafting-container">
      <h3>Crafting</h3>
      <NGrid class="crafting-summary" cols="1 600:2 1200:3" x-gap="10px" y-gap="10px">
        <NGi>
          <NSelect
            class="skill-selector"
            v-model:value="state.crafting.selectedSkill"
            placeholder="Select Skill"
            :options="getCraftingSkills()"
            aria-label="Select Skill"
            @update:value="runCommand(buildRecipeCommand(), 'the_void')"
          />
        </NGi>
        <NGi>
          <NInput
            v-model:value="state.crafting.levelFilter"
            placeholder="Level Filter, ie. 10, 5-15, 20+"
            @update:value="runCommand(buildRecipeCommand(), 'the_void')"
          />
        </NGi>
        <NGi>
          <NInput
            placeholder="Search by recipe name"
            v-model:value="search"
            clearable
            @update:value="runCommand(buildRecipeCommand(), 'the_void')"
          ></NInput>
        </NGi>
        <NGi>
          <NInput
            placeholder="Search by ingredient name"
            v-model:value="ingredient"
            clearable
            @update:value="runCommand(buildRecipeCommand(), 'the_void')"
          ></NInput>
        </NGi>
        <NGi>
          <div class="checkbox-container">
            <NRadioGroup v-model:value="state.crafting.filterType" name="filter-type">
              <NRadio
                v-for="option in filterTypeOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
                @change="runCommand(buildRecipeCommand(), 'the_void')"
              />
            </NRadioGroup>
          </div>
        </NGi>
      </NGrid>

      <div class="no-recipes" v-if="state.crafting.recipes.length == 0">No recipes found.</div>
      <div class="recipe-table">
        <div class="recipes" v-for="i in columns" :key="i">
          <div v-for="recipe in getColumnRecipes(i - 1)" :key="recipe.name" class="recipe-row">
            <div :class="recipeClass(recipe.name)">
              <div v-html-safe="ansiToHtml(recipe.fullName)" :class="getRecipeNameClass(recipe)" @click="selectRecipe(recipe)"></div>
              <ItemDetails :item="recipe" :actions="getActions(recipe)" v-if="selectedRecipe == recipe.name"></ItemDetails>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GameModal>
</template>
<script setup>
import { ref } from 'vue'
import { state } from '@/static/state'
import { NGrid, NGi, NInput, NSelect, NRadio, NRadioGroup } from 'naive-ui'

import GameModal from '@/components/modals/GameModal.vue'
import ItemDetails from '@/components/game-modal/ItemDetails.vue'

import { useHelpers } from '@/composables/helpers'
const { ansiToHtml } = useHelpers()

import { useWebSocket } from '@/composables/web_socket'
const { runCommand } = useWebSocket()

const selectedRecipe = ref('')
const columns = ref(1)
const search = ref('')
const ingredient = ref('')

const filterTypeOptions = [
  { label: 'All', value: 'all' },
  { label: 'Known', value: 'known' },
  { label: 'Learned', value: 'learned' }
]

function getCraftingSkills () {
  const { skills } = state.gameState
  let craftingSkills = Object.values(skills)
    .filter(skill => skill.type && skill.type.includes('crafting'))
    .map(skill => ({
      label: skill.name,
      value: skill.name
    }))
  craftingSkills.sort((a, b) => a.label.localeCompare(b.label))

  return [{ label: 'All Skills', value: '' }, ...craftingSkills]
}

function recipeClass (name) {
  return selectedRecipe.value === name ? 'recipe border selected-recipe' : 'recipe'
}

function getRecipeNameClass (item) {
  let classes = ['name', 'selectable']
  if (selectedRecipe.value == item.name) {
    classes.push('selected')
  }
  return classes.join(' ')
}

function selectRecipe (recipe) {
  if (selectedRecipe.value == recipe.name) {
    selectedRecipe.value = {}
    return
  }
  selectedRecipe.value = recipe.name
}

function getActions (recipe) {
  let actions = []
  if (recipe.canCraft === true) {
    actions.push({
      label: 'Craft',
      class: 'bold-yellow',
      onClick: () => {
        let outputId = `inventory-output-${recipe.iid}`
        runCommand(`craft '${recipe.name}'`, outputId)
      }
    })
  }

  return actions
}

function getColumnRecipes (colIndex) {
  const recipes = state.crafting.recipes

  if (!recipes || recipes.length === 0) {
    return []
  }

  const perCol = Math.ceil(recipes.length / columns.value) || 1
  const start = colIndex * perCol
  return recipes.slice(start, start + perCol)
}

function onWidthChange () {
  if (window.innerWidth < 600) {
    columns.value = 1
  } else if (window.innerWidth < 1200) {
    columns.value = 2
  } else {
    columns.value = 3
  }
}

function buildRecipeCommand () {
  let cmd = 'recipes'

  if (state.crafting.filterType) {
    cmd += ` ${state.crafting.filterType}`
  }

  if (state.crafting.selectedSkill) {
    cmd += ` '${state.crafting.selectedSkill}'`
  }

  if (ingredient.value) {
    cmd += ` ingredient '${ingredient.value}'`
  }

  if (search.value) {
    cmd += ` '${search.value}'`
  }

  if (state.crafting.levelFilter) {
    cmd += ` ${state.crafting.levelFilter}`
  }

  return cmd
}

function onModalOpened () {
  onWidthChange()
  window.addEventListener('resize', onWidthChange)
  runCommand(buildRecipeCommand(), 'the_void')
}

function onModalClosed () {
  window.removeEventListener('resize', onWidthChange)
}
</script>
<style lang="less" scoped>
.checkbox-container {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 34px;
}

.level-filter {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 34px;

  .n-input {
    width: 100px;
  }
}

.crafting-container {
  max-width: 1200px;
  margin: 0 auto;

  .n-select, .n-input {
    max-width: 300px;
  }

  .no-recipes {
    margin-top: 10px;
  }

  .recipe-table {
    display: flex;
    width: 100%;
    margin-top: 10px;

    .recipes {
      width: 33%;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      flex-direction: column;
      flex-grow: 1;

      .recipe-row {
        width: 100%;

        .recipe {
          width: 100%;

          .name {
            padding: 5px 10px;
            cursor: pointer;

            &.selected {
              background: #121;
            }

            &:hover, &.selected {
              background: #121;
            }
          }
        }
      }
    }
  }
}
</style>