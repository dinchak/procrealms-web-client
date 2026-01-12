<template>
  <div class="auction-browse-container">

    <div class="auction-header">
      <h3>Browse Auctions</h3>
      <div v-html-safe="'You have ' + copperToMoneyString(state.gameState.player.money, true)"></div>
    </div>

    <NGrid class="auction-filters" cols="1 900:2" x-gap="10px" y-gap="10px">
      <NGi>
        <NSelect
          class="type-selector"
          v-model:value="state.auction.search.type"
          placeholder="Select Item Type"
          :options="getItemTypes()"
          aria-label="Select Item Type"
          @update:value="updateAuctionSearch()"
        />
      </NGi>

      <NGi v-if="state.auction.search.type">
        <NSelect
          class="subtype-selector"
          v-model:value="state.auction.search.subtype"
          placeholder="Select Item Subtype"
          :options="getItemSubtypes()"
          aria-label="Select Item Subtype"
          @update:value="updateAuctionSearch()"
        />
      </NGi>

      <NGi v-if="state.auction.search.type == 'armor'">
        <NSelect
          class="slot-selector"
          v-model:value="state.auction.search.slot"
          placeholder="Select Armor Slot"
          :options="getArmorSlots()"
          aria-label="Select Armor Slot"
          @update:value="updateAuctionSearch()"
        />
      </NGi>

      <NGi>
        <NInput
          placeholder="Search by name"
          v-model:value="state.auction.search.name"
          clearable
          @update:value="updateAuctionSearch()"
        ></NInput>
      </NGi>

      <NGi class="level-range-inputs">
        <NInputNumber
          placeholder="Minimum Level"
          :min="1"
          :max="100"
          v-model:value="state.auction.search.minLevel"
          clearable
          @update:value="updateAuctionSearch()"
        ></NInputNumber>
        <NIcon>
          <RemoveFilled></RemoveFilled>
        </NIcon>
        <NInputNumber
          placeholder="Maximum Level"
          :min="1"
          :max="100"
          v-model:value="state.auction.search.maxLevel"
          clearable
          @update:value="updateAuctionSearch()"
        ></NInputNumber>
      </NGi>
      <NGi>
        <div class="auction-params">
          <div class="auction-check-param">
            <NCheckbox v-model:checked="myAuctionsOnly" @update:checked="updateAuctionSearch()">
              My Listed Items
            </NCheckbox>
          </div>
          <div class="auction-sort-param">
            <span>Sort by </span>
            <NPopselect v-model:value="sort" :options="sortOptions" @update:value="doSetSort()">
              <span class="dropdown">{{ getSortLabel() }}</span>
            </NPopselect>
          </div>

          <div class="auction-sort-param">
            <span>Sort direction </span>
            <NPopselect v-model:value="sortDir" :options="sortDirOptions" @update:value="doSetSort()">
              <span class="dropdown">{{ getSortDirLabel() }}</span>
            </NPopselect>
          </div>
        </div>
      </NGi>
    </NGrid>

    <div class="auction-table">
      <div class="auctions" v-for="i in columns" :key="i">
        <div class="auction-header">
          <div>Name</div>
          <div>Ends</div>
          <div>Bid</div>
          <div>Buy</div>
        </div>
        <div
          v-for="auction in getColumnAuctions(i - 1)"
          :key="auction.id"
          class="auction-row"
        >
          <div
            class="auction"
            :class="{ selected: state.auction.selectedAuctionId == auction.id }"
            @click="selectAuction(auction)"
          >
            <div class="item-name" v-html-safe="ansiToHtml(auction.item)"></div>
            <div>{{ getRelativeTime(auction.endTime) }}</div>
            <div v-if="auction.bids == 0" class="price" v-html-safe="copperToMoneyString(auction.minimum, true)"></div>
            <div v-if="auction.bids > 0" class="price" v-html-safe="copperToMoneyString(auction.bid, true)">{{ auction.bid }}</div>
            <div class="price">
              <span v-if="auction.price" v-html-safe="copperToMoneyString(auction.price, true)"></span>
              <span v-else></span>
            </div>
          </div>

          <div class="auction-overview" v-if="state.auction.selectedAuctionId == auction.id">
            <div class="auction-actions">
              <div class="auction-actions-row space-between">
                <div v-if="auction.bids == 0">
                  <span>Starting Bid: </span>
                  <span v-html-safe="copperToMoneyString(auction.minimum, true)"></span>
                </div>
                <div v-if="auction.bids > 0">
                  <span>Current Bid: </span>
                  <span v-html-safe="copperToMoneyString(auction.bid, true)"></span>
                  <span>({{ auction.bids }} bid{{ auction.bids > 1 ? 's' : '' }})</span>
                </div>
                <div v-if="auction.bids > 0">
                  <span>High Bidder: {{ auction.bidder }}</span>
                </div>
              </div>
              <div class="auction-actions-row">
                <NInput
                  placeholder="Bid Amount"
                  style="width: 100px;"
                  v-model:value="bidAmount"
                ></NInput>

                <NButton ghost @click="doBid(auction)" type="success">
                  <span class="bold-green">Bid</span>
                </NButton>

                <NButton v-if="auction.price" ghost @click="doBuyNow(auction)" type="warning">
                  <span
                    class="bold-yellow"
                    v-html-safe="'Buy Now ' + copperToMoneyString(auction.price, true)"
                  ></span>
                </NButton>

                <NButton ghost type="info"
                  v-if="['armor', 'weapon'].includes(state.auction.item.type)"
                  @click="doCompareAuctionItem(auction)"
                >Compare</NButton>

                <NButton ghost type="error"
                  v-if="auction.seller == state.gameState.player.name && auction.bids == 0"
                  @click="doCancelAuction(auction)"
                >Cancel Auction</NButton>

              </div>
              <div class="auction-actions-row space-between">
                <div>
                  Ends in {{ getRelativeTime(auction.endTime) }}
                </div>
                <div>
                  Seller: {{ auction.seller }}
                </div>
              </div>
            </div>
          </div>

          <ItemDetails
            :item="state.auction.item || {}"
            :item-output-id="'auction-' + auction.id"
            v-if="state.auction.selectedAuctionId == auction.id"
          ></ItemDetails>
        </div>
      </div>

    </div>
      <div class="auction-pagination">
        <NPagination
          simple
          v-model:page="page"
          :page-count="state.auction.numPages"
          @update:page="updateAuctionList()"
        ></NPagination>
        <div class="auction-total">{{ state.auction.totalNumAuctions }} Auctions match your search</div>
      </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { state } from '@/static/state'
import { NGrid, NGi, NInput, NSelect, NInputNumber, NIcon, NButton, NCheckbox, NPagination, NPopselect } from 'naive-ui'

import ItemDetails from '@/components/game-modal/ItemDetails.vue'
import RemoveFilled from '@vicons/material/RemoveFilled'

import { ITEM_TYPES, ITEM_SUBTYPES, ARMOR_SLOTS } from '@/static/constants'

import { useHelpers } from '@/composables/helpers'
const { ansiToHtml, copperToMoneyString, getRelativeTime } = useHelpers()

import { useWebSocket } from '@/composables/web_socket'
const { runCommand, fetchAuction } = useWebSocket()

const sortOptions = [
  {
    label: 'Ends',
    value: 'ends'
  },
  {
    label: 'Name',
    value: 'name'
  },
  {
    label: 'Level',
    value: 'level'
  },
  {
    label: 'Price',
    value: 'price'
  },
  {
    label: 'Bids',
    value: 'bids'
  },
]

const sortDirOptions = [
  {
    label: 'Ascending',
    value: 'asc'
  },
  {
    label: 'Descending',
    value: 'desc'
  },
]

const sort = ref('name')
const sortDir = ref('asc')

const columns = ref(1)
const bidAmount = ref('')
const myAuctionsOnly = ref(false)
const page = ref(1)

let searchUpdater = null

async function doBid (auction) {
  let cmd = `auction bid ${auction.id} ${bidAmount.value}`
  await runCommand(cmd, `inventory-output-auction-${auction.id}`)
  updateAuctionList()
}

async function doBuyNow (auction) {
  let cmd = `auction buy ${auction.id}`
  await runCommand(cmd, `inventory-output-auction-${auction.id}`)
  updateAuctionList()
}

async function doSetSort () {
  let cmd = `auction sort ${sort.value} ${sortDir.value}`
  await runCommand(cmd, 'the_void')
  updateAuctionList()
}

async function doCompareAuctionItem (auction) {
  let cmd = `auction compare ${auction.id}`
  await runCommand(cmd, `inventory-output-auction-${auction.id}`)
}

async function doCancelAuction (auction) {
  let cmd = `auction cancel ${auction.id}`
  await runCommand(cmd, `inventory-output-auction-${auction.id}`)
  updateAuctionList()
}

function updateAuctionList () {
  let cmd = `auction list ${page.value}`
  runCommand(cmd, 'the_void')
}

function updateAuctionSearch () {
  const { search } = state.auction
  let cmd = `auction search`

  if (myAuctionsOnly.value === true) {
    cmd += ` "seller=${state.gameState.player.name}"`
  }

  if (search.type) {
    cmd += ` "type=${search.type}"`
  }

  if (
    !ITEM_SUBTYPES[search.type] ||
    !ITEM_SUBTYPES[search.type].includes(search.subtype)
  ) {
    search.subtype = ''
  }

  if (search.subtype) {
    cmd += ` "subtype=${search.subtype}"`
  }

  if (search.type != 'armor') {
    search.slot = ''
  }

  if (search.type == 'armor' && search.slot) {
    cmd += ` "slot=${search.slot}"`
  }

  if (search.name) {
    cmd += ` "${search.name}"`
  }

  let minLevel = parseInt(search.minLevel, 10) || 0
  let maxLevel = parseInt(search.maxLevel, 10) || 100
  if (
    typeof minLevel === 'number' &&
    typeof maxLevel === 'number' &&
    minLevel < maxLevel
  ) {
    cmd += ` ${search.minLevel}-${search.maxLevel}`
  }

  if (searchUpdater) {
    clearTimeout(searchUpdater)
  }

  searchUpdater = setTimeout(() => {
    updateAuctionList()
    searchUpdater = null
  }, 300)

  runCommand(cmd, 'the_void')
}

async function selectAuction (auction) {
  if (state.auction.selectedAuctionId == auction.id) {
    state.auction.selectedAuctionId = null
  } else {
    state.auction.selectedAuctionId = auction.id
    let fetchedAuction = await fetchAuction(auction.id)
    state.auction.item = fetchedAuction.item || {}
  }
}

function getItemTypes () {
  let types = ITEM_TYPES.map(t => ({ label: t, value: t }))
  types.unshift({ label: 'All Types', value: '' })
  return types
}

function getItemSubtypes () {
  const { search } = state.auction
  if (!search.type || !ITEM_SUBTYPES[search.type]) {
    return [{ label: 'All Subtypes', value: '' }]
  }

  let subtypes = ITEM_SUBTYPES[search.type].map(st => ({ label: st, value: st }))
  subtypes.unshift({ label: 'All Subtypes', value: '' })
  return subtypes
}

function getArmorSlots () {
  let slots = ARMOR_SLOTS.map(s => ({ label: s, value: s }))
  slots.unshift({ label: 'All Slots', value: '' })
  return slots
}

function onWidthChange () {
  if (window.innerWidth < 1200) {
    columns.value = 1
  } else {
    columns.value = 2
  }
}

function getColumnAuctions (colIndex) {
  const auctions = state.auction.auctions

  if (!auctions || auctions.length === 0) {
    return []
  }

  const perCol = Math.ceil(auctions.length / columns.value) || 1
  const start = colIndex * perCol
  return auctions.slice(start, start + perCol)
}

function getSortLabel () {
  const option = sortOptions.find(o => o.value === sort.value)
  return option ? option.label : sort.value
}

function getSortDirLabel () {
  const option = sortDirOptions.find(o => o.value === sortDir.value)
  return option ? option.label : sortDir.value
}

onMounted(() => {
  updateAuctionList()
  window.addEventListener('resize', onWidthChange)
  onWidthChange()
})

onBeforeUnmount(() => {
  state.inventoryOutput = {}
  window.removeEventListener('resize', onWidthChange)
})

</script>
<style lang="less" scoped>
.auction-browse-container {
  max-width: 1200px;
  margin: 0 auto;

  .auction-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    h3 {
      margin: 0;
    }
  }

  .auction-filters {
    .level-range-inputs {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-direction: row;
      .n-input-number {
        flex-grow: 1;
      }
    }

    .auction-params {
      height: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      font-size: 0.9rem;
      gap: 20px;
      .auction-sort-param {
        .dropdown {
          cursor: pointer;
          border: 1px solid #444;
          padding: 5px;
          display: inline-block;
          text-align: center;
          &:hover {
            background-color: #222;
          }
        }
      }
    }
  }

  .auction-pagination {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 10px;
    gap: 5px;
    .auction-total {
      color: #aaa;
      font-size: 0.8rem;
    }
  }

  .auction-table {
    display: flex;
    flex-direction: row;
    width: calc(100% - 10px);
    margin-top: 10px;
    gap: 20px;

    .auctions {
      display: flex;
      flex-direction: column;
      width: 100%;

      .auction-header {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid #444;
        color: #aaa;
        font-size: 0.8rem;

        > div:nth-child(1) {
          flex: 1 1 auto;
          min-width: 0;
          text-align: left;
        }
        > div:nth-child(2) {
          flex: 0 0 60px;
          width: 60px;
          text-align: right;
        }
        > div:nth-child(3) {
          flex: 0 0 90px;
          width: 90px;
          text-align: right;
        }
        > div:nth-child(4) {
          flex: 0 0 90px;
          width: 90px;
          text-align: right;
        }
      }

      .auction-row {
        width: 100%;
        display: block;
        cursor: pointer;

        .auction {
          display: flex;
          flex-direction: row;
          align-items: center;
          width: 100%;
          padding: 5px 0;

          &.selected, &:hover {
            background: #121;
          }

          > div:nth-child(1) {
            flex: 1 1 auto;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: left;
          }
          > div:nth-child(2) {
            flex: 0 0 60px;
            width: 60px;
            text-align: right;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 0.8rem;
          }
          > div:nth-child(3) {
            flex: 0 0 90px;
            width: 90px;
            text-align: right;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          > div:nth-child(4) {
            flex: 0 0 90px;
            width: 90px;
            text-align: right;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .auction-overview {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          background-color: #101216;
          padding-right: 10px;
          .auction-actions {
            padding: 10px 10px 0 10px;
            display: flex;
            gap: 10px;
            flex-direction: column;
            width: 100%;
            .auction-actions-row {
              width: 100%;
              flex-basis: 100%;
              flex-wrap: wrap;
              display: flex;
              flex-direction: row;
              gap: 10px;
              &.space-between {
                justify-content: space-between;
              }
            }
          }
          .auction-details {
            padding-top: 5px;
            display: flex;
            flex-direction: row;
            gap: 5px;
            .auction-details-column {
              display: flex;
              flex-direction: column;
              .auction-details-row {
                display: flex;
                flex-direction: row;
                gap: 5px;
                padding: 0 0 5px 0;
                div {
                  &:first-child {
                    font-size: 0.8rem;
                    text-align: right;
                    width: 78px;
                    color: #aaa;
                    align-self: flex-end;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>