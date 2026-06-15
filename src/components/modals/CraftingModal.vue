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
            v-model:value="state.recipeSearch.selectedSkill"
            placeholder="Select Skill"
            :options="getCraftingSkills()"
            aria-label="Select Skill"
            @update:value="runCommand(buildRecipeCommand(), 'the_void')"
          />
        </NGi>
        <NGi>
          <NInput
            placeholder="Search by recipe name"
            v-model:value="state.recipeSearch.name"
            clearable
            @update:value="runCommand(buildRecipeCommand(), 'the_void')"
          ></NInput>
        </NGi>
        <NGi>
          <NInput
            placeholder="Search by ingredient name"
            v-model:value="state.recipeSearch.ingredient"
            clearable
            @update:value="runCommand(buildRecipeCommand(), 'the_void')"
          ></NInput>
        </NGi>

        <NGi>
          <NSelect
            placeholder="Select Type"
            :options="getItemTypes()"
            v-model:value="state.recipeSearch.type"
            aria-label="Select Type"
            @update:value="runCommand(buildRecipeCommand(), 'the_void')"
          />
        </NGi>

        <NGi v-if="state.recipeSearch.type && ITEM_SUBTYPES[state.recipeSearch.type]">
          <NSelect
            :disabled="state.recipeSearch.type == ''"
            placeholder="Select Subtype"
            :options="getItemSubTypes()"
            v-model:value="state.recipeSearch.subtype"
            aria-label="Select Subtype"
            @update:value="runCommand(buildRecipeCommand(), 'the_void')"
          />
        </NGi>

        <NGi v-if="state.recipeSearch.type == 'armor'">
          <NSelect
            :disabled="state.recipeSearch.type != 'armor'"
            placeholder="Select Slot"
            :options="getArmorSlots()"
            v-model:value="state.recipeSearch.slot"
            aria-label="Select Slot"
            @update:value="runCommand(buildRecipeCommand(), 'the_void')"
          />
        </NGi>

        <NGi>
          <NInput
            v-model:value="state.recipeSearch.levelFilter"
            placeholder="Level Filter, ie. 10, 5-15, 20+"
            @update:value="runCommand(buildRecipeCommand(), 'the_void')"
          />
        </NGi>
        <NGi>
          <div class="pagination-options">
            <NPagination
              v-model:page="state.recipeSearch.page"
              :page-count="numPages()"
              simple
              @update:page="updatePage()"
            >
            </NPagination>
            <NInput
              class="page-size"
              placeholder="Page Limit"
              :value="state.recipeSearch.limit + ''"
              type="number"
              min="0"
              max="1000"
              @update:value="runCommand(buildRecipeCommand(), 'the_void')"
            />
          </div>
        </NGi>
        <NGi>
          <NRadioGroup
            v-model:value="state.recipeSearch.mode"
            @update:value="runCommand(buildRecipeCommand(), 'the_void')"
          >
            <NRadioButton name="mode" value="craftable" label="Craftable"></NRadioButton>
            <NRadioButton name="mode" value="unlocked" label="Unlocked"></NRadioButton>
            <NRadioButton name="mode" value="all" label="All"></NRadioButton>
          </NRadioGroup>
        </NGi>
      </NGrid>

      <div class="recipe-count" v-if="state.recipeResults.recipes.length == 0">
        <div>no recipes found</div>
      </div>

      <div class="recipe-count" v-if="state.recipeResults.recipes.length > 0">
        <div>{{ state.recipeResults.count }} results</div>
        <div>showing {{ resultStart() }}-{{ resultEnd() }}</div>
        <div>page {{ state.recipeSearch.page }} of {{ numPages() }}</div>
        <div>
          <NButton ghost type="warning" @click="resetSearch()" size="tiny">Reset Search</NButton>
        </div>
      </div>

      <div class="recipe-table">
        <div class="recipes" v-for="i in columns" :key="i">
          <div v-for="recipe in getColumnRecipes(i - 1)" :key="recipe.name" class="recipe-row">
            <div :class="recipeClass(recipe.name)">
              <div
                v-html-safe="ansiToHtml(recipe.fullName)"
                :class="getRecipeNameClass(recipe)"
                @click="selectRecipe(recipe)"
              ></div>
              <ItemDetails
                v-if="selectedRecipe == recipe.name"
                :item="recipe"
                :actions="getActions(recipe)"
              ></ItemDetails>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GameModal>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { state } from '@/static/state'
import { NGrid, NGi, NInput, NSelect, NPagination, NButton, NRadioGroup, NRadioButton } from 'naive-ui'

import GameModal from '@/components/modals/GameModal.vue'
import ItemDetails from '@/components/game-modal/ItemDetails.vue'

import { useHelpers } from '@/composables/helpers'
const { ansiToHtml } = useHelpers()

import { useWebSocket } from '@/composables/web_socket'
const { runCommand } = useWebSocket()

import { ITEM_TYPES, ITEM_SUBTYPES, ARMOR_SLOTS } from '@/static/constants'

const selectedRecipe = ref('')
const columns = ref(1)

let watchers = []

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

function getItemTypes () {
  let itemTypes = ITEM_TYPES.map(type => ({
    label: type,
    value: type
  }))

  return [{ label: 'All Types', value: '' }, ...itemTypes]
}

function getItemSubTypes () {
  const { type } = state.recipeSearch
  if (type == '' || !ITEM_SUBTYPES[type]) {
    return [{ label: 'Select Type', value: '' }]
  }

  let itemSubTypes = ITEM_SUBTYPES[type].map(subtype => ({
    label: subtype,
    value: subtype
  }))

  return [{ label: 'All Subtypes', value: '' }, ...itemSubTypes]
}

function getArmorSlots () {
  if (state.recipeSearch.type != 'armor') {
    return []
  }

  let armorSlots = ARMOR_SLOTS.map(slot => ({
    label: slot,
    value: slot
  }))

  return [{ label: 'All Slots', value: '' }, ...armorSlots]
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
    if (['building', 'station'].includes(recipe.type)) {
      actions.push({
        label: 'Build',
        class: 'bold-yellow',
        onClick: () => {
          let outputId = `inventory-output-${recipe.iid}`
          runCommand(`build '${recipe.name}'`, outputId)
        }
      })
    } else {
      actions.push({
        label: 'Craft',
        class: 'bold-yellow',
        onClick: () => {
          let outputId = `inventory-output-${recipe.iid}`
          runCommand(`craft '${recipe.name}'`, outputId)
        }
      })
    }
  }

  return actions
}

function getColumnRecipes (colIndex) {
  const { recipes } = state.recipeResults

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

function updatePage () {
  runCommand(buildRecipeCommand(), 'the_void')
}

function numPages () {
  const { count } = state.recipeResults
  if (count == 0) {
    return 1
  }
  return Math.ceil(count / state.recipeSearch.limit)
}

function resultStart () {
  if (state.recipeResults.count == 0) {
    return 1
  }
  const { page, limit } = state.recipeSearch
  return (page - 1) * limit + 1
}

function resultEnd () {
  const { count } = state.recipeResults
  if (count == 0) {
    return 0
  }
  const { page, limit } = state.recipeSearch
  return Math.min(page * limit, count)
}

function buildRecipeCommand () {
  let cmd = `recipes ${state.recipeSearch.mode}`
  cmd += ` skill='${state.recipeSearch.selectedSkill || ""}'`
  cmd += ` name='${state.recipeSearch.name || ""}'`
  cmd += ` ingredient='${state.recipeSearch.ingredient || ""}'`
  cmd += ` level='${state.recipeSearch.levelFilter || ""}'`
  cmd += ` type='${state.recipeSearch.type || ""}'`
  cmd += ` subtype='${state.recipeSearch.subtype || ""}'`
  cmd += ` slot='${state.recipeSearch.slot}'`
  cmd += ` limit=${state.recipeSearch.limit}`
  cmd += ` page=${state.recipeSearch.page}`
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

function resetSearch () {
  state.recipeSearch.page = 1
  state.recipeSearch.limit = 30
  state.recipeSearch.name = ''
  state.recipeSearch.ingredient = ''
  state.recipeSearch.selectedSkill = ''
  state.recipeSearch.levelFilter = ''
  state.recipeSearch.type = ''
  state.recipeSearch.subtype = ''
  state.recipeSearch.slot = ''
  state.recipeSearch.mode = 'craftable'
  runCommand(buildRecipeCommand(), 'the_void')
}

onMounted(() => {
   watchers.push(watch(() => state.recipeResults.count, () => {
    if (state.recipeSearch.page > numPages()) {
      state.recipeSearch.page = numPages()
      runCommand(buildRecipeCommand(), 'the_void')
    }
  }))
})

onBeforeUnmount(() => {
  watchers.forEach(w => w())
})
</script>
<style lang="less" scoped>
.checkbox-container {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 34px;
}

.pagination-options {
  max-width: 300px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.crafting-container {
  max-width: 1200px;
  margin: 0 auto;

  .n-select, .n-input {
    max-width: 300px;
  }

  .page-size {
    width: 75px;
  }

  .recipe-count {
    margin-top: 10px;
    font-size: 14px;
    line-height: 22px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    column-gap: 40px;
    padding: 5px 10px;
    background-color: #10292d;
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