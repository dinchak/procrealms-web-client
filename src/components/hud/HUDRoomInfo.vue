<template>
  <div class="room-info">
    <div class="room-title" v-html-safe="getRoomTitle()"></div>
    <div class="area-title yellow">{{ state.gameState.room.area }}</div>
    <div class="entities">
      <div
        class="entity"
        v-for="entity in getRoomEntities()"
        v-bind:key="entity.eid"
        v-html-safe="ansiToHtml(entity.name)"
      ></div>
    </div>
    <div class="items">
      <template v-if="useFixedItemPopup">
        <div
          v-for="item in getRoomItems()"
          v-bind:key="item.iid"
          :ref="el => setItemElement(item.iid, el)"
          :class="getItemClass(item)"
          role="button"
          tabindex="0"
          v-html-safe="ansiToHtml(item.name)"
          @mouseenter="showItemPopup(item, $event)"
          @mouseleave="hideItemPopup(item)"
          @click.stop="toggleItemPopup(item, $event)"
          @keydown.enter.prevent="toggleItemPopup(item, $event)"
          @keydown.space.prevent="toggleItemPopup(item, $event)"
        ></div>
      </template>

      <template v-else>
        <NPopover
          v-for="item in getRoomItems()"
          v-bind:key="item.iid"
          class="hud-room-item-popover"
          trigger="manual"
          placement="top-start"
          :show="isItemPopupVisible(item)"
          :show-arrow="false"
          :style="{ '--n-padding': '0' }"
          :content-style="{ padding: '0' }"
          :z-index="20"
        >
          <template #trigger>
            <div
              :ref="el => setItemElement(item.iid, el)"
              :class="getItemClass(item)"
              role="button"
              tabindex="0"
              v-html-safe="ansiToHtml(item.name)"
              @mouseenter="showItemPopup(item, $event)"
              @mouseleave="hideItemPopup(item)"
              @click.stop="toggleItemPopup(item, $event)"
              @keydown.enter.prevent="toggleItemPopup(item, $event)"
              @keydown.space.prevent="toggleItemPopup(item, $event)"
            ></div>
          </template>

          <div class="item-detail-popup">
            <ItemDetails
              v-if="getItemDetail(item)"
              :item="getItemDetail(item)"
              :item-output-id="item.iid"
            ></ItemDetails>
            <div class="item-detail-loading" v-else>Loading item...</div>
          </div>
        </NPopover>
      </template>
    </div>

    <Teleport to="body">
      <div
        class="fixed-item-detail-panel"
        v-if="useFixedItemPopup && getActivePopupItem()"
        :style="getFixedPanelStyle()"
      >
        <ItemDetails
          v-if="getItemDetail(getActivePopupItem())"
          :item="getItemDetail(getActivePopupItem())"
          :item-output-id="getActivePopupItem().iid"
        ></ItemDetails>
        <div class="item-detail-loading" v-else>Loading item...</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { NPopover } from 'naive-ui'

import ItemDetails from '@/components/game-modal/ItemDetails.vue'

import { prevMode, setMode, state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { ANSI } from '@/static/constants'

const { ansiToHtml } = useHelpers()
const { fetchItem } = useWebSocket()

const hoveredIid = ref('')
const pinnedIid = ref('')
const itemDetailsByIid = ref({})
const useFixedItemPopup = ref(false)
const activeItemTarget = ref(null)
const fixedPanelBottom = ref(0)
const fixedPanelMaxHeight = ref('55vh')
const itemPopupModalModePushed = ref(false)
const itemElementsByIid = new Map()
const loadingIids = new Set()

function getRoomEntities () {
  return state.gameState.room.entities.filter(en =>
    !Object.keys(state.gameState.party).find(eid => eid == en.eid)
  )
}

function getRoomItems () {
  return state.gameState.room.items
}

function getItemClass (item) {
  return {
    item: true,
    selectable: true,
    'popup-open': isItemPopupVisible(item),
    pinned: pinnedIid.value === item.iid
  }
}

function getItemDetail (item) {
  return itemDetailsByIid.value[item.iid]
}

function getActivePopupIid () {
  return pinnedIid.value || hoveredIid.value
}

function getActivePopupItem () {
  const activeIid = getActivePopupIid()
  return getRoomItems().find(item => item.iid === activeIid)
}

function getFixedPanelStyle () {
  return {
    bottom: `${fixedPanelBottom.value}px`,
    maxHeight: fixedPanelMaxHeight.value
  }
}

function isItemPopupVisible (item) {
  return getActivePopupIid() === item.iid
}

async function loadItemDetail (item) {
  const iid = item && item.iid
  if (!iid || itemDetailsByIid.value[iid] || loadingIids.has(iid)) {
    return
  }

  loadingIids.add(iid)
  const detail = await fetchItem(iid)
  loadingIids.delete(iid)

  if (!detail || detail.removed || !detail.iid) {
    return
  }

  itemDetailsByIid.value = {
    ...itemDetailsByIid.value,
    [iid]: detail
  }
}

function setItemElement (iid, el) {
  if (el) {
    itemElementsByIid.set(iid, el)

    if (iid === getActivePopupIid()) {
      updateFixedPanelPosition(el)
    }
    return
  }

  nextTick(() => {
    const current = itemElementsByIid.get(iid)
    if (current && !current.isConnected) {
      itemElementsByIid.delete(iid)
    }
  })
}

function updateFixedPanelPosition (target) {
  if (!target || !target.getBoundingClientRect) {
    return
  }

  activeItemTarget.value = target
  const rect = target.getBoundingClientRect()
  const gap = 6
  const topInset = 8
  const bottom = Math.max(0, window.innerHeight - rect.top + gap)
  const availableHeight = Math.max(120, rect.top - gap - topInset)

  fixedPanelBottom.value = bottom
  fixedPanelMaxHeight.value = `${Math.min(420, availableHeight)}px`
}

function updateFixedPanelPositionForActiveItem () {
  const activeIid = getActivePopupIid()
  const target = itemElementsByIid.get(activeIid) || activeItemTarget.value
  updateFixedPanelPosition(target)
}

function getEventTarget (event) {
  return event && event.currentTarget ? event.currentTarget : null
}

function hasBlockingModalOpen () {
  return Object.entries(state.modals).some(([key, value]) => {
    if (key === 'inventoryModals') {
      return Object.values(value).some(modalRef => Boolean(modalRef && modalRef.value))
    }

    return Boolean(value)
  })
}

function pushItemPopupModalMode () {
  if (itemPopupModalModePushed.value) {
    return
  }

  setMode('modal')
  itemPopupModalModePushed.value = true
}

function restoreItemPopupMode () {
  if (!itemPopupModalModePushed.value) {
    return
  }

  itemPopupModalModePushed.value = false
  prevMode()
}

function closePinnedItemPopup () {
  if (!pinnedIid.value) {
    return
  }

  pinnedIid.value = ''
  hoveredIid.value = ''
  activeItemTarget.value = null
  restoreItemPopupMode()
}

function onCloseModal () {
  if (!pinnedIid.value || hasBlockingModalOpen()) {
    return
  }

  closePinnedItemPopup()
}

function showItemPopup (item, event) {
  if (pinnedIid.value) {
    return
  }

  hoveredIid.value = item.iid
  updateFixedPanelPosition(getEventTarget(event))
  loadItemDetail(item)
}

function hideItemPopup (item) {
  if (hoveredIid.value === item.iid && pinnedIid.value !== item.iid) {
    hoveredIid.value = ''
  }
}

function toggleItemPopup (item, event) {
  if (pinnedIid.value === item.iid) {
    closePinnedItemPopup()
    return
  }

  pushItemPopupModalMode()
  pinnedIid.value = item.iid
  hoveredIid.value = ''
  updateFixedPanelPosition(getEventTarget(event))
  loadItemDetail(item)
}

function getRoomTitle () {
  const { room } = state.gameState
  return ansiToHtml(`${ANSI.reset}L${ANSI.boldWhite}${room.level} ${ANSI.boldMagenta}${room.x}${ANSI.reset}, ${ANSI.boldMagenta}${room.y} ${ANSI.boldBlack}| ${room.name}`)
}

async function updatePopupMode () {
  const nextUseFixedItemPopup = window.innerWidth <= 600
  const activeIid = getActivePopupIid()
  const modeChanged = useFixedItemPopup.value !== nextUseFixedItemPopup

  useFixedItemPopup.value = nextUseFixedItemPopup

  if (modeChanged) {
    await nextTick()

    if (activeIid && !pinnedIid.value && !hoveredIid.value) {
      hoveredIid.value = activeIid
    }
  }

  updateFixedPanelPositionForActiveItem()
}

onMounted(() => {
  updatePopupMode()
  window.addEventListener('resize', updatePopupMode)
  state.inputEmitter.on('closeModal', onCloseModal)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePopupMode)
  state.inputEmitter.off('closeModal', onCloseModal)
  restoreItemPopupMode()
})

watch(() => getRoomItems().map(item => item.iid), roomIids => {
  const currentIids = new Set(roomIids)

  if (pinnedIid.value && !currentIids.has(pinnedIid.value)) {
    closePinnedItemPopup()
  }

  if (hoveredIid.value && !currentIids.has(hoveredIid.value)) {
    hoveredIid.value = ''
  }
})

</script>

<style lang="less" scoped>
.room-info {
  display: flex;
  flex-direction: column;
  flex-basis: 200px;
  height: 110px;
  font-size: 0.8rem;
}

.items {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.item {
  cursor: pointer;
  display: block;
  max-width: 100%;
  min-height: 1.2em;
  outline: none;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover,
  &:focus-visible,
  &.popup-open {
    text-decoration: underline;
  }

  &.pinned {
    background: rgba(41, 185, 55, 0.2);
  }
}

.item-detail-popup,
.fixed-item-detail-panel {
  box-sizing: border-box;
  max-height: min(420px, calc(100vh - 24px));
  max-width: calc(100vw - 24px);
  overflow-y: auto;
  width: min(500px, calc(100vw - 24px));

  :deep(.details) {
    box-sizing: border-box;
    max-width: 100%;
    min-width: 0;
    width: 100%;
  }

  :deep(.actions:empty) {
    display: none;
  }

  :deep(.details .tags) {
    flex-wrap: wrap;
    gap: 4px 8px;
  }

  :deep(.details .tags .tag) {
    margin-right: 0;
  }

  :deep(.details .base-stats) {
    display: grid;
    gap: 4px 12px;
    grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
    max-width: none;
  }

  :deep(.details .base-stats .stat) {
    flex-wrap: wrap;
    min-width: 0;
    width: auto;
  }

  :deep(.details .total-bonuses) {
    gap: 4px 12px;
  }

  :deep(.details .total-bonuses .bonus),
  :deep(.details .bonuses .bonus),
  :deep(.details .gemslots .gem),
  :deep(.details .crafting .row) {
    flex-wrap: wrap;
    min-width: 0;
  }

  :deep(.details .crafting .row),
  :deep(.details .bonuses .bonus) {
    margin-left: 0;
  }
}

.item-detail-loading {
  background: rgb(16, 18, 22);
  padding: 10px 12px;
}

.fixed-item-detail-panel {
  background: rgb(16, 18, 22);
  bottom: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  left: 0;
  max-height: min(420px, 55vh);
  max-width: 100vw;
  position: fixed;
  right: 0;
  width: 100vw;
  z-index: 20;
}

@media screen and (max-width: 420px) {
  .item-detail-popup,
  .fixed-item-detail-panel {
    max-height: min(360px, calc(100vh - 16px));
    max-width: 100%;
    width: 100%;

    :deep(.details) {
      font-size: 0.75rem;
    }

    :deep(.details .actions),
    :deep(.details .tags),
    :deep(.details .desc),
    :deep(.details .base-stats),
    :deep(.details .gemslots),
    :deep(.details .bonuses),
    :deep(.details .instant-restoration),
    :deep(.details .crafting) {
      padding-left: 8px;
      padding-right: 8px;
    }

    :deep(.details .base-stats) {
      grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    }

    :deep(.details .crafting .row) {
      flex-direction: column;
      margin-left: 0;
    }
  }
}
</style>
