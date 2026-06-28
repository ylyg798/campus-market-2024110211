<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/stores/marketStore'
import { useUserStore } from '@/stores/userStore'
import type { MarketInfo } from '@/types/market'
import { Search, Filter, MapPin, Clock, Gift, Eye, AlertTriangle, CheckCircle } from '@lucide/vue'

const router = useRouter()
const marketStore = useMarketStore()
const userStore = useUserStore()

const searchKeyword = ref('')
const selectedType = ref<'all' | 'lost' | 'found'>('all')
const selectedCampus = ref<string>('全部')
const showFilterPanel = ref(false)

const campuses = ['全部', '东校区', '西校区', '南校区', '北校区']

const typeLabels = {
  'lost': '丢失物品',
  'found': '拾获物品',
}

const statusLabels: Record<string, string> = {
  'active': '寻找中',
  'found': '已找到',
  'completed': '已归还',
  'closed': '已关闭',
}

// 筛选后的失物招领列表
const filteredItems = computed(() => {
  let items = marketStore.marketList.filter(item => item.type === 'lostfound')

  // 类型筛选
  if (selectedType.value !== 'all') {
    items = items.filter(item => item.lostFoundType === selectedType.value)
  }

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    items = items.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      (item.itemFeatures && item.itemFeatures.toLowerCase().includes(keyword))
    )
  }

  // 校区筛选
  if (selectedCampus.value && selectedCampus.value !== '全部') {
    items = items.filter(item => item.campus === selectedCampus.value)
  }

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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

function goToPublish(type: 'lost' | 'found') {
  router.push(`/publish?type=lostfound&subtype=${type}`)
}

function clearFilters() {
  searchKeyword.value = ''
  selectedType.value = 'all'
  selectedCampus.value = '全部'
}

async function fetchData() {
  await marketStore.fetchMarketList()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="lostfound-page">
    <!-- 顶部搜索栏 -->
    <header class="search-header">
      <div class="search-bar">
        <Search :size="20" class="search-icon" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索物品名称、特征..."
          class="search-input"
        />
      </div>
      <button class="filter-btn" @click="showFilterPanel = !showFilterPanel">
        <Filter :size="20" />
        <span>筛选</span>
      </button>
    </header>

    <!-- 类型切换标签 -->
    <div class="type-tabs">
      <button
        :class="{ active: selectedType === 'all' }"
        @click="selectedType = 'all'"
      >
        全部
      </button>
      <button
        :class="{ active: selectedType === 'lost' }"
        @click="selectedType = 'lost'"
      >
        <AlertTriangle :size="16" />
        丢失物品
      </button>
      <button
        :class="{ active: selectedType === 'found' }"
        @click="selectedType = 'found'"
      >
        <CheckCircle :size="16" />
        拾获物品
      </button>
    </div>

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

      <div class="filter-actions">
        <button class="clear-btn" @click="clearFilters()">清除筛选</button>
      </div>
    </div>

    <!-- 结果统计 -->
    <div class="result-bar">
      <div class="result-count">
        共 {{ filteredItems.length }} 条记录
      </div>
    </div>

    <!-- 物品列表 -->
    <main class="lostfound-main">
      <div v-if="filteredItems.length === 0" class="empty-state">
        <Search :size="48" />
        <p>暂无符合条件的记录</p>
        <div class="empty-actions">
          <button @click="goToPublish('lost')">我丢了东西</button>
          <button @click="goToPublish('found')">我捡到东西</button>
        </div>
      </div>

      <div v-else class="item-list">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item-card"
          :class="item.lostFoundType"
          @click="goToDetail(item.id)"
        >
          <div class="type-indicator">
            <component :is="item.lostFoundType === 'lost' ? AlertTriangle : CheckCircle" :size="20" />
            <span>{{ typeLabels[item.lostFoundType || 'lost'] }}</span>
          </div>

          <div class="item-content">
            <h3 class="item-title">{{ item.title }}</h3>

            <div class="item-features" v-if="item.itemFeatures">
              <span class="features-label">特征：</span>
              <span>{{ item.itemFeatures }}</span>
            </div>

            <div class="item-meta">
              <span class="location">
                <MapPin :size="14" />
                {{ item.campus }} · {{ item.location }}
              </span>
              <span class="time">
                <Clock :size="14" />
                {{ formatTime(item.createdAt) }}
              </span>
            </div>

            <div class="item-bottom">
              <div class="status-badge" :class="item.status">
                {{ statusLabels[item.status] || '进行中' }}
              </div>
              <div class="reward-info" v-if="item.reward">
                <Gift :size="14" />
                <span>酬劳 ¥{{ item.reward }}</span>
              </div>
              <div class="stats">
                <Eye :size="14" />
                <span>{{ item.viewCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 快捷发布按钮 -->
    <div class="publish-buttons">
      <button class="publish-btn lost" @click="goToPublish('lost')">
        <AlertTriangle :size="20" />
        <span>我丢了东西</span>
      </button>
      <button class="publish-btn found" @click="goToPublish('found')">
        <CheckCircle :size="20" />
        <span>我捡到东西</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.lostfound-page {
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
  background: #8b5cf6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}

/* 类型切换标签 */
.type-tabs {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.type-tabs button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
}

.type-tabs button.active {
  background: #8b5cf6;
  color: #fff;
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
  background: #8b5cf6;
  color: #fff;
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

/* 结果统计 */
.result-bar {
  background: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.result-count {
  font-size: 13px;
  color: #64748b;
}

/* 物品列表 */
.lostfound-main {
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

.empty-actions {
  display: flex;
  gap: 12px;
}

.empty-actions button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}

.empty-actions button:first-child {
  background: #fef2f2;
  color: #dc2626;
}

.empty-actions button:last-child {
  background: #dcfce7;
  color: #16a34a;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.item-card.lost {
  border-left: 4px solid #dc2626;
}

.item-card.found {
  border-left: 4px solid #16a34a;
}

.type-indicator {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}

.item-card.lost .type-indicator {
  background: #fef2f2;
  color: #dc2626;
}

.item-card.found .type-indicator {
  background: #dcfce7;
  color: #16a34a;
}

.item-content {
  padding: 12px 16px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.item-features {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.features-label {
  color: #94a3b8;
}

.item-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.location, .time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.item-bottom {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.status-badge.active {
  background: #fef2f2;
  color: #dc2626;
}

.status-badge.found, .status-badge.completed {
  background: #dcfce7;
  color: #16a34a;
}

.reward-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #f59e0b;
  font-weight: 500;
}

.stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
}

/* 发布按钮 */
.publish-buttons {
  position: fixed;
  bottom: 80px;
  left: 16px;
  right: 16px;
  display: flex;
  gap: 12px;
}

.publish-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.publish-btn.lost {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #fff;
}

.publish-btn.found {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: #fff;
}
</style>
