<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/stores/marketStore'
import { useUserStore } from '@/stores/userStore'
import type { MarketInfo } from '@/types/market'
import { Search, Filter, Users, Clock, MapPin, Tag, Plus, Eye, Calendar, UserPlus, X } from '@lucide/vue'

const router = useRouter()
const marketStore = useMarketStore()
const userStore = useUserStore()

const searchKeyword = ref('')
const selectedCategory = ref<string>('all')
const selectedCampus = ref<string>('全部')
const showFilterPanel = ref(false)

const campuses = ['全部', '东校区', '西校区', '南校区', '北校区']

const categories = [
  { value: 'all', label: '全部类型' },
  { value: 'food', label: '美食拼单' },
  { value: 'shopping', label: '购物拼单' },
  { value: 'travel', label: '出行拼单' },
  { value: 'activity', label: '活动拼单' },
  { value: 'study', label: '学习搭子' },
  { value: 'hobby', label: '兴趣搭子' },
]

const categoryLabels: Record<string, string> = {
  'food': '美食拼单',
  'shopping': '购物拼单',
  'travel': '出行拼单',
  'activity': '活动拼单',
  'study': '学习搭子',
  'hobby': '兴趣搭子',
}

const statusLabels: Record<string, string> = {
  'active': '招募中',
  'in-progress': '进行中',
  'completed': '已完成',
  'closed': '已关闭',
}

// 筛选后的拼单列表
const filteredItems = computed(() => {
  let items = marketStore.marketList.filter(item => item.type === 'groupbuy')

  // 类型筛选
  if (selectedCategory.value !== 'all') {
    items = items.filter(item => item.groupCategory === selectedCategory.value)
  }

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

function formatDeadline(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (diff < 0) return '已过期'
  if (days > 0) return `${days}天后截止`
  if (hours > 0) return `${hours}小时后截止`
  return '即将截止'
}

function isExpired(deadline: string) {
  return new Date(deadline) < new Date()
}

function calculateProgress(item: MarketInfo) {
  const current = item.currentMembers || 0
  const target = item.targetMembers || 1
  return Math.min(100, Math.round((current / target) * 100))
}

function goToDetail(id: string) {
  router.push(`/detail/${id}`)
}

function goToPublish() {
  router.push('/publish?type=groupbuy')
}

function clearFilters() {
  searchKeyword.value = ''
  selectedCategory.value = 'all'
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
  <div class="groupbuy-page">
    <!-- 顶部搜索栏 -->
    <header class="search-header">
      <div class="search-bar">
        <Search :size="20" class="search-icon" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索拼单信息..."
          class="search-input"
        />
      </div>
      <button class="filter-btn" @click="showFilterPanel = !showFilterPanel">
        <Filter :size="20" />
        <span>筛选</span>
      </button>
    </header>

    <!-- 类型切换标签 -->
    <div class="category-tabs">
      <button
        v-for="cat in categories.slice(0, 4)"
        :key="cat.value"
        :class="{ active: selectedCategory === cat.value }"
        @click="selectedCategory = cat.value"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- 筛选面板 -->
    <div v-if="showFilterPanel" class="filter-panel">
      <div class="filter-section">
        <label>全部类型</label>
        <div class="filter-options">
          <button
            v-for="cat in categories"
            :key="cat.value"
            :class="{ active: selectedCategory === cat.value }"
            @click="selectedCategory = cat.value"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

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
        共 {{ filteredItems.length }} 个拼单
      </div>
    </div>

    <!-- 拼单列表 -->
    <main class="groupbuy-main">
      <div v-if="filteredItems.length === 0" class="empty-state">
        <Users :size="48" />
        <p>暂无符合条件的拼单</p>
        <button @click="goToPublish()">发起拼单</button>
      </div>

      <div v-else class="item-list">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item-card"
          :class="{ expired: item.deadline && isExpired(item.deadline) }"
          @click="goToDetail(item.id)"
        >
          <!-- 顶部标签 -->
          <div class="card-header">
            <div class="category-badge">
              <Tag :size="14" />
              {{ categoryLabels[item.groupCategory || 'food'] }}
            </div>
            <div class="status-badge" :class="item.status">
              {{ statusLabels[item.status] || '招募中' }}
            </div>
          </div>

          <!-- 标题和描述 -->
          <div class="card-content">
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-desc">{{ item.description }}</p>
          </div>

          <!-- 进度条 -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">
                <Users :size="14" />
                已有 {{ item.currentMembers || 0 }}/{{ item.targetMembers || 1 }} 人
              </span>
              <span class="progress-percent">{{ calculateProgress(item) }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${calculateProgress(item)}%` }"
                :class="{ full: calculateProgress(item) >= 100 }"
              ></div>
            </div>
          </div>

          <!-- 信息底部 -->
          <div class="card-footer">
            <div class="meta-info">
              <span class="location">
                <MapPin :size="14" />
                {{ item.campus }}
              </span>
              <span class="deadline" :class="{ urgent: item.deadline && formatDeadline(item.deadline).includes('小时') }">
                <Clock :size="14" />
                {{ item.deadline ? formatDeadline(item.deadline) : '长期有效' }}
              </span>
            </div>
            <div class="stats">
              <Eye :size="14" />
              <span>{{ item.viewCount }}</span>
            </div>
          </div>

          <!-- 价格信息 -->
          <div class="price-info" v-if="item.price">
            <span class="price-label">预计费用</span>
            <span class="price-value">¥{{ item.price }}/人</span>
          </div>

          <!-- 快捷加入按钮 -->
          <button class="join-btn" v-if="item.status === 'active' && !isExpired(item.deadline || '')">
            <UserPlus :size="16" />
            <span>加入拼单</span>
          </button>
        </div>
      </div>
    </main>

    <!-- 发布按钮 -->
    <button class="publish-fab" @click="goToPublish()">
      <Plus :size="24" />
      <span>发起拼单</span>
    </button>
  </div>
</template>

<style scoped>
.groupbuy-page {
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
  background: #ec4899;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}

/* 类型切换标签 */
.category-tabs {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.category-tabs button {
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
}

.category-tabs button.active {
  background: #ec4899;
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
  background: #ec4899;
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

/* 拼单列表 */
.groupbuy-main {
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
  background: #ec4899;
  color: #fff;
  border: none;
  border-radius: 8px;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-card.expired {
  opacity: 0.6;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #fce7f3;
  color: #ec4899;
  border-radius: 6px;
  font-size: 12px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.in-progress {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.completed, .status-badge.closed {
  background: #f1f5f9;
  color: #64748b;
}

/* 卡片内容 */
.card-content {
  margin-bottom: 16px;
}

.item-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.item-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* 进度条 */
.progress-section {
  margin-bottom: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.progress-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #475569;
}

.progress-percent {
  font-size: 13px;
  font-weight: 600;
  color: #ec4899;
}

.progress-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ec4899, #f472b6);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-fill.full {
  background: linear-gradient(90deg, #16a34a, #22c55e);
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.meta-info {
  display: flex;
  gap: 12px;
}

.location, .deadline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.deadline.urgent {
  color: #dc2626;
}

.stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
}

/* 价格信息 */
.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.price-label {
  font-size: 12px;
  color: #64748b;
}

.price-value {
  font-size: 16px;
  font-weight: 700;
  color: #ec4899;
}

/* 加入按钮 */
.join-btn {
  margin-top: 12px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
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
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);
}
</style>
