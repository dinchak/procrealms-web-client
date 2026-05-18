<template>
  <div ref="roomInfoElement" class="room-info">
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
    </div>

    <Teleport to="body">
      <div
        class="hud-popup-panel item-detail-panel"
        v-if="getActivePopupItem()"
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
import { ref } from 'vue'

import ItemDetails from '@/components/game-modal/ItemDetails.vue'

import { state } from '@/static/state'
import { useHelpers } from '@/composables/helpers'
import { useWebSocket } from '@/composables/web_socket'
import { ANSI } from '@/static/constants'
import { useHudPopup } from '@/composables/hud_popup'

const { ansiToHtml } = useHelpers()
const { fetchItem } = useWebSocket()

const roomInfoElement = ref(null)
const {
  pinnedKey: pinnedIid,
  getActiveKey: getActivePopupIid,
  getFixedPanelStyle,
  setPopupElement: setItemElement,
  showPopup,
  hidePopup,
  togglePopup
} = useHudPopup(roomInfoElement, () => getRoomItems().map(item => item.iid))

const itemDetailsByIid = ref({})
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
    'popup-open': getActivePopupIid() === item.iid,
    pinned: pinnedIid.value === item.iid
  }
}

function getItemDetail (item) {
  if (!item) {
    return null
  }

  return itemDetailsByIid.value[item.iid]
}

function getActivePopupItem () {
  const activeIid = getActivePopupIid()
  return getRoomItems().find(item => item.iid === activeIid)
}

async function loadItemDetail (item) {
  const iid = item && item.iid
  if (iid === null || iid === undefined || itemDetailsByIid.value[iid] || loadingIids.has(iid)) {
    return
  }

  loadingIids.add(iid)
  let detail = null

  try {
    detail = await fetchItem(iid)
  } catch {
    return
  } finally {
    loadingIids.delete(iid)
  }

  if (!detail || detail.removed || !detail.iid) {
    return
  }

  itemDetailsByIid.value = {
    ...itemDetailsByIid.value,
    [iid]: detail
  }
}

function showItemPopup (item, event) {
  if (showPopup(item.iid, event)) {
    loadItemDetail(item)
  }
}

function hideItemPopup (item) {
  hidePopup(item.iid)
}

function toggleItemPopup (item, event) {
  if (togglePopup(item.iid, event)) {
    loadItemDetail(item)
  }
}

function getRoomTitle () {
  const { room } = state.gameState
  return ansiToHtml(`${ANSI.reset}L${ANSI.boldWhite}${room.level} ${ANSI.boldMagenta}${room.x}${ANSI.reset}, ${ANSI.boldMagenta}${room.y} ${ANSI.boldBlack}| ${room.name}`)
}

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

.item-detail-panel {
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

@media screen and (max-width: 420px) {
  .item-detail-panel {
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
