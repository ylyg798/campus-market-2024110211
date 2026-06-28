<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useMarketStore } from '@/stores/marketStore'
import { useUserStore } from '@/stores/userStore'
import type { Favorite, MarketInfo } from '@/types/market'
import { ArrowLeft, Heart, Eye, MapPin, Trash2, Package, Search, Gift, Users, HandHelping } from '@lucide/vue'

const router = useRouter()
const favoriteStore = useFavoriteStore()
const marketStore = useMarketStore()
const userStore = useUserStore()

const selectedType = ref<string>('all')

const typeOptions = [
  { value: 'all', label: '全部', icon: Heart },
  { value: 'secondhand', label: '二手交易', icon: Package },
  { value: 'lostfound', label: '失物招领', icon: Search },
  { value: 'groupbuy', label: '拼单搭子', icon: Users },
  { value: 'errand', label: '跑腿委托', icon: HandHelping },
]

const typeLabels: Record<string, string> = {
  'secondhand': '二手交易',
  'lostfound': '失物招领',
  'groupbuy': '拼单搭子',
  'errand': '跑腿委托',
}

const typeColors: Record<string, string> = {
  'secondhand': '#3b82f6',
  'lostfound': '#8b5cf6',
  'groupbuy': '#ec4899',
  'errand': '#f59e0b',
}

const favorites = computed(() => favoriteStore.favorites)

const filteredFavorites = computed(() => {
  if (selectedType.value === 'all') {
    return favorites.value
  }
  return favorites.value.filter(f => f.infoType === selectedType.value)
})

function goBack() {
  router.back()
}

function goToDetail(id: string) {
  router.push(`/detail/${id}`)
}

async function removeFavorite(favorite: Favorite) {
  if (!userStore.user) return
  await favoriteStore.toggleFavorite(userStore.user.id, favorite.infoId, favorite.infoType, favorite.infoTitle)
}

async function fetchData() {
  if (userStore.user) {
    await favoriteStore.fetchFavorites(userStore.user.id)
    await marketStore.fetchMarketList()
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="favorites-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <button class="back-btn" @click="goBack()">
        <ArrowLeft :size="20" />
      </button>
      <h1 class="page-title">我的收藏</h1>
    </header>

    <!-- 类型筛选 -->
    <div class="type-filter">
      <button 
        v-for="opt in typeOptions"
        :key="opt.value"
        class="filter-btn"
        :class="{ active: selectedType === opt.value }"
        @click="selectedType = opt.value"
      >
        <component :is="opt.icon" :size="18" />
        <span>{{ opt.label }}</span>
      </button>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <span class="stats-count">共 {{ filteredFavorites.length }} 个收藏</span>
    </div>

    <!-- 收藏列表 -->
    <main class="favorites-main">
      <div v-if="filteredFavorites.length === 0" class="empty-state">
        <Heart :size="48" />
        <p>暂无收藏内容</p>
        <span>在浏览商品或信息时点击收藏按钮即可添加</span>
      </div>

      <div v-else class="favorites-list">
        <div 
          v-for="item in filteredFavorites" 
          :key="item.id"
          class="favorite-card"
          @click="goToDetail(item.infoId)"
        >
          <div class="type-badge" :style="{ background: typeColors[item.infoType] || '#3b82f6' }">
            {{ typeLabels[item.infoType] || '未知' }}
          </div>

          <div class="card-content">
            <h3 class="item-title">{{ item.infoTitle }}</h3>
            <div class="card-footer">
              <span class="favorite-time">{{ item.createdAt }}</span>
              <button class="remove-btn" @click.stop="removeFavorite(item)">
                <Trash2 :size="16" />
                <span>移除</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background: #f8fafc;
}

/* 顶部导航 */
.page-header {
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* 类型筛选 */
.type-filter {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-bottom: 1px solid #e5e7eb;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
}

.filter-btn.active {
  background: #ec4899;
  color: #fff;
}

/* 统计信息 */
.stats-bar {
  background: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.stats-count {
  font-size: 13px;
  color: #64748b;
}

/* 收藏列表 */
.favorites-main {
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #64748b;
}

.empty-state p {
  margin: 16px 0 8px 0;
  font-size: 16px;
}

.empty-state span {
  font-size: 13px;
  color: #94a3b8;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.favorite-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.favorite-card:hover {
  transform: translateY(-2px);
}

.type-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #fff;
  display: inline-block;
  margin-bottom: 12px;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorite-time {
  font-size: 12px;
  color: #94a3b8;
}

.remove-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #fef2f2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}
</style>