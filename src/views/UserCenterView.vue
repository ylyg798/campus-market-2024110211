<template>
  <section class="page">
    <div class="profile-card">
      <div class="avatar">
        {{ userStore.displayName.slice(0, 1) }}
      </div>

      <div>
        <h1>{{ userStore.displayName }}</h1>
        <p>{{ userStore.userDescription }}</p>
        <p>{{ userStore.currentUser.bio }}</p>
      </div>
    </div>

    <div class="panel">
      <h2>我的收藏</h2>

      <EmptyState
        v-if="favoriteStore.favorites.length === 0"
        text="暂无收藏内容"
      />

      <div v-else class="favorite-list">
        <ItemCard
          v-for="item in favoriteStore.favorites"
          :key="`${item.type}-${item.id}`"
          :title="item.title"
          :description="item.description"
          :tag="getTypeLabel(item.type)"
          :location="item.location"
        >
          <template #footer>
            <button class="remove-btn" @click="favoriteStore.removeFavorite(item.type, item.id)">
              取消收藏
            </button>
          </template>
        </ItemCard>
      </div>
    </div>

    <div class="panel">
      <h2>我的发布</h2>

      <EmptyState
        v-if="myPublishes.length === 0"
        text="暂无发布内容"
      />

      <div v-else class="publish-list">
        <ItemCard
          v-for="item in myPublishes"
          :key="`${item.type}-${item.id}`"
          :title="item.title"
          :description="item.description"
          :tag="getTypeLabel(item.type)"
          :location="item.location"
          :time="item.time"
        >
          <template #footer>
            <span class="status" :class="item.statusClass">{{ item.statusText }}</span>
          </template>
        </ItemCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import ItemCard from '../components/ItemCard.vue'
import { useFavoriteStore } from '../stores/favorite'
import { useUserStore } from '../stores/user'
import { getTrades, type TradeItem } from '../api/trade'
import { getLostFounds, type LostFoundItem } from '../api/lostFound'
import { getGroupBuys, type GroupBuyItem } from '../api/groupBuy'
import { getErrands, type ErrandItem } from '../api/errand'

const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

const trades = ref<TradeItem[]>([])
const lostFounds = ref<LostFoundItem[]>([])
const groupBuys = ref<GroupBuyItem[]>([])
const errands = ref<ErrandItem[]>([])

const loading = ref(true)

interface PublishItem {
  id: number
  type: string
  title: string
  description: string
  location: string
  time: string
  statusText: string
  statusClass: string
}

const myPublishes = computed<PublishItem[]>(() => {
  const publisherName = userStore.displayName
  const result: PublishItem[] = []

  // 二手交易
  trades.value
    .filter((item) => item.publisher === publisherName)
    .forEach((item) => {
      result.push({
        id: item.id!,
        type: 'trade',
        title: item.title,
        description: item.description,
        location: item.location,
        time: item.publishTime,
        statusText: item.status === 'open' ? '进行中' : '已结束',
        statusClass: item.status === 'open' ? 'active' : 'closed',
      })
    })

  // 失物招领
  lostFounds.value
    .filter((item) => item.contact === publisherName)
    .forEach((item) => {
      result.push({
        id: item.id!,
        type: 'lostFound',
        title: item.title,
        description: item.description,
        location: item.location,
        time: item.eventTime,
        statusText: item.status === 'open' ? '进行中' : '已结束',
        statusClass: item.status === 'open' ? 'active' : 'closed',
      })
    })

  // 拼单搭子
  groupBuys.value
    .filter((item) => item.publisher === publisherName)
    .forEach((item) => {
      result.push({
        id: item.id!,
        type: 'groupBuy',
        title: item.title,
        description: item.description,
        location: item.location,
        time: item.deadline,
        statusText: item.status === 'open' ? '进行中' : '已结束',
        statusClass: item.status === 'open' ? 'active' : 'closed',
      })
    })

  // 跑腿委托
  errands.value
    .filter((item) => item.publisher === publisherName)
    .forEach((item) => {
      result.push({
        id: item.id!,
        type: 'errand',
        title: item.title,
        description: item.description,
        location: item.from + ' → ' + item.to,
        time: item.deadline,
        statusText: item.status === 'open' ? '进行中' : '已结束',
        statusClass: item.status === 'open' ? 'active' : 'closed',
      })
    })

  return result
})

function getTypeLabel(type: string) {
  const map: Record<string, string> = {
    trade: '二手交易',
    lostFound: '失物招领',
    groupBuy: '拼单搭子',
    errand: '跑腿委托',
  }

  return map[type] || '校园信息'
}

onMounted(async () => {
  try {
    const [tradesRes, lostFoundsRes, groupBuysRes, errandsRes] = await Promise.all([
      getTrades(),
      getLostFounds(),
      getGroupBuys(),
      getErrands(),
    ])
    trades.value = tradesRes.data
    lostFounds.value = lostFoundsRes.data
    groupBuys.value = groupBuysRes.data
    errands.value = errandsRes.data
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card,
.panel {
  padding: 24px;
  border-radius: 16px;
  background: #fff;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #eff6ff;
  color: #2563eb;
  font-size: 28px;
  font-weight: 700;
}

.profile-card h1,
.panel h2 {
  margin: 0 0 8px;
}

.profile-card p,
.hint {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.favorite-list,
.publish-list {
  display: grid;
  gap: 16px;
}

.remove-btn {
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
  background: #f3f4f6;
  color: #374151;
}

.status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
}

.status.active {
  background: #dcfce7;
  color: #16a34a;
}

.status.closed {
  background: #f3f4f6;
  color: #6b7280;
}
</style>
