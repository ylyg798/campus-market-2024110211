<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/stores/marketStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useUserStore } from '@/stores/userStore'
import type { MarketInfo } from '@/types/market'
import { ShoppingCart, Search, Filter, SortAsc, SortDesc, Heart, Eye, MapPin } from '@lucide/vue'

const router = useRouter()
const marketStore = useMarketStore()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()

const searchKeyword = ref('')
const selectedCampus = ref<string>('all')
const selectedQuality = ref<string>('all')
const priceRange = ref<{ min: string; max: string }>({ min: '', max: '' })
const sortOrder = ref<'asc' | 'desc'>('desc')
const showFilterPanel = ref(false)

const campuses = ['全部', '东校区', '西校区', '南校区', '北校区']
const qualityOptions = [
  { value: 'all', label: '全部成色' },
  { value: 'new', label: '全新' },
  { value: 'like-new', label: '几乎全新' },
  { value: 'good', label: '成色良好' },
  { value: 'fair', label: '有使用痕迹' },
  { value: 'poor', label: '成色较差' },
]

const qualityLabels: Record<string, string> = {
  'new': '全新',
  'like-new': '几乎全新',
  'good': '成色良好',
  'fair': '有使用痕迹',
  'poor': '成色较差',
}

// 筛选后的二手交易列表
const filteredItems = computed(() => {
  let items = marketStore.marketList.filter(item => item.type === 'secondhand')

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    items = items.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  // 校区筛选
  if (selectedCampus.value && selectedCampus.value !== '全部') {
    items = items.filter(item => item.campus === selectedCampus.value)
  }

  // 成色筛选
  if (selectedQuality.value && selectedQuality.value !== 'all') {
    items = items.filter(item => item.quality === selectedQuality.value)
  }

  // 价格区间筛选
  if (priceRange.value.min) {
    items = items.filter(item => item.price && item.price >= parseFloat(priceRange.value.min))
  }
  if (priceRange.value.max) {
    items = items.filter(item => item.price && item.price <= parseFloat(priceRange.value.max))
  }

  // 排序
  items.sort((a, b) => {
    const priceA = a.price || 0
    const priceB = b.price || 0
    return sortOrder.value === 'asc' ? priceA - priceB : priceB - priceA
  })

  return items
})

function formatTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  return '刚刚'
}

function goToDetail(id: string) {
  router.push(`/detail/${id}`)
}

function goToPublish() {
  router.push('/publish?type=secondhand')
}

function toggleFavorite(info: MarketInfo) {
  if (!userStore.user) return
  favoriteStore.toggleFavorite(userStore.user.id, info.id, info.type, info.title)
}

function isFavorite(infoId: string) {
  return favoriteStore.favorites.some(f => f.infoId === infoId)
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

function clearFilters() {
  searchKeyword.value = ''
  selectedCampus.value = '全部'
  selectedQuality.value = 'all'
  priceRange.value = { min: '', max: '' }
}

async function fetchData() {
  await marketStore.fetchMarketList()
  if (userStore.user) {
    await favoriteStore.fetchFavorites(userStore.user.id)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="trade-page">
    <!-- 顶部搜索栏 -->
    <header class="search-header">
      <div class="search-bar">
        <Search :size="20" class="search-icon" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索商品名称、描述..."
          class="search-input"
        />
      </div>
      <button class="filter-btn" @click="showFilterPanel = !showFilterPanel">
        <Filter :size="20" />
        <span>筛选</span>
      </button>
    </header>

    <!-- 筛选面板 -->
    <div v-if="showFilterPanel" class="filter-panel">
      <div class="filter-section">
        <label>校区</label>
        <div class="filter-options">
          <button
            v-for="campus in campuses"
            :key="campus"
            :class="{ active: selectedCampus === campus }"
            @click="selectedCampus = campus"
          >
            {{ campus }}
          </button>
        </div>
      </div>

      <div class="filter-section">
        <label>成色</label>
        <div class="filter-options">
          <button
            v-for="opt in qualityOptions"
            :key="opt.value"
            :class="{ active: selectedQuality === opt.value }"
            @click="selectedQuality = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="filter-section">
        <label>价格区间</label>
        <div class="price-inputs">
          <input
            v-model="priceRange.min"
            type="number"
            placeholder="最低价格"
          />
          <span>-</span>
          <input
            v-model="priceRange.max"
            type="number"
            placeholder="最高价格"
          />
        </div>
      </div>

      <div class="filter-actions">
        <button class="clear-btn" @click="clearFilters()">清除筛选</button>
      </div>
    </div>

    <!-- 排序栏 -->
    <div class="sort-bar">
      <div class="result-count">
        共 {{ filteredItems.length }} 件商品
      </div>
      <button class="sort-btn" @click="toggleSortOrder()">
        <component :is="sortOrder === 'asc' ? SortAsc : SortDesc" :size="16" />
        <span>价格 {{ sortOrder === 'asc' ? '从低到高' : '从高到低' }}</span>
      </button>
    </div>

    <!-- 商品列表 -->
    <main class="trade-main">
      <div v-if="filteredItems.length === 0" class="empty-state">
        <ShoppingCart :size="48" />
        <p>暂无符合条件的商品</p>
        <button @click="goToPublish()">发布你的闲置</button>
      </div>

      <div v-else class="item-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item-card"
          @click="goToDetail(item.id)"
        >
          <div class="item-image">
            <img v-if="item.images.length > 0" :src="item.images[0]" :alt="item.title" />
            <div v-else class="no-image">
              <ShoppingCart :size="32" />
            </div>
            <button
              class="favorite-btn"
              :class="{ active: isFavorite(item.id) }"
              @click.stop="toggleFavorite(item)"
            >
              <Heart :size="16" />
            </button>
          </div>

          <div class="item-info">
            <h3 class="item-title">{{ item.title }}</h3>
            <div class="item-meta">
              <span class="quality-tag">{{ qualityLabels[item.quality || 'good'] }}</span>
              <span class="location">
                <MapPin :size="14" />
                {{ item.campus }}
              </span>
            </div>
            <div class="item-bottom">
              <span class="price">¥{{ item.price }}</span>
              <div class="stats">
                <Eye :size="14" />
                <span>{{ item.viewCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 发布按钮 -->
    <button class="publish-fab" @click="goToPublish()">
      <ShoppingCart :size="24" />
      <span>发布闲置</span>
    </button>
  </div>
</template>

<style scoped>
.trade-page {
  min-height: 100vh;
  background: #f8fafc;
}

/* 搜索栏 */
.search-header {
  background: #fff;
  padding: 16px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 8px 12px;
}

.search-icon {
  color: #64748b;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  outline: none;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}

/* 筛选面板 */
.filter-panel {
  background: #fff;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.filter-section {
  margin-bottom: 16px;
}

.filter-section label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
  display: block;
}

.filter-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-options button {
  padding: 6px 12px;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
}

.filter-options button.active {
  background: #3b82f6;
  color: #fff;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-inputs input {
  width: 100px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.price-inputs span {
  color: #64748b;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
}

.clear-btn {
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  color: #64748b;
}

/* 排序栏 */
.sort-bar {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.result-count {
  font-size: 13px;
  color: #64748b;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #475569;
}

/* 商品列表 */
.trade-main {
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
  margin: 16px 0;
}

.empty-state button {
  padding: 12px 24px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.item-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
}

.item-image {
  position: relative;
  height: 160px;
  background: #f1f5f9;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.favorite-btn.active {
  background: #fef2f2;
  color: #dc2626;
}

.item-info {
  padding: 12px;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.quality-tag {
  padding: 2px 8px;
  background: #eef2ff;
  color: #6366f1;
  border-radius: 4px;
  font-size: 12px;
}

.location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
}

/* 发布按钮 */
.publish-fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
</style>
