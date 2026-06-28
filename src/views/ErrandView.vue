<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/stores/marketStore'
import { useUserStore } from '@/stores/userStore'
import type { MarketInfo } from '@/types/market'
import { Search, Filter, MapPin, Clock, Wallet, User, Eye, Plus, HandHelping, CheckCircle2, Timer, XCircle } from '@lucide/vue'

const router = useRouter()
const marketStore = useMarketStore()
const userStore = useUserStore()

const searchKeyword = ref('')
const selectedStatus = ref<string>('all')
const selectedCampus = ref<string>('全部')
const showFilterPanel = ref(false)

const campuses = ['全部', '东校区', '西校区', '南校区', '北校区']

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '待接取' },
  { value: 'claimed', label: '已接取' },
  { value: 'in-progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'closed', label: '已关闭' },
]

const statusLabels: Record<string, string> = {
  'active': '待接取',
  'claimed': '已接取',
  'in-progress': '进行中',
  'completed': '已完成',
  'closed': '已关闭',
}

const statusIcons: Record<string, any> = {
  'active': HandHelping,
  'claimed': CheckCircle2,
  'in-progress': Timer,
  'completed': CheckCircle2,
  'closed': XCircle,
}

const statusColors: Record<string, string> = {
  'active': '#f59e0b',
  'claimed': '#3b82f6',
  'in-progress': '#8b5cf6',
  'completed': '#10b981',
  'closed': '#6b7280',
}

// 筛选后的跑腿任务列表
const filteredItems = computed(() => {
  let items = marketStore.marketList.filter(item => item.type === 'errand')

  // 状态筛选
  if (selectedStatus.value !== 'all') {
    items = items.filter(item => item.status === selectedStatus.value)
  }

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    items = items.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      (item.location && item.location.toLowerCase().includes(keyword))
    )
  }

  // 校区筛选
  if (selectedCampus.value && selectedCampus.value !== '全部') {
    items = items.filter(item => item.campus === selectedCampus.value)
  }

  return items.sort((a, b) => {
    // 待接取的任务优先显示
    if (a.status === 'active' && b.status !== 'active') return -1
    if (b.status === 'active' && a.status !== 'active') return 1
    // 然后按时间排序
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
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
  router.push('/publish?type=errand')
}

function clearFilters() {
  searchKeyword.value = ''
  selectedStatus.value = 'all'
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
  <div class="errand-page">
    <!-- 顶部搜索栏 -->
    <header class="search-header">
      <div class="search-bar">
        <Search :size="20" class="search-icon" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索任务内容、地点..."
          class="search-input"
        />
      </div>
      <button class="filter-btn" @click="showFilterPanel = !showFilterPanel">
        <Filter :size="20" />
        <span>筛选</span>
      </button>
    </header>

    <!-- 状态切换标签 -->
    <div class="status-tabs">
      <button
        v-for="opt in statusOptions.slice(0, 4)"
        :key="opt.value"
        :class="{ active: selectedStatus === opt.value }"
        @click="selectedStatus = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- 筛选面板 -->
    <div v-if="showFilterPanel" class="filter-panel">
      <div class="filter-section">
        <label>任务状态</label>
        <div class="filter-options">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            :class="{ active: selectedStatus === opt.value }"
            @click="selectedStatus = opt.value"
          >
            {{ opt.label }}
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
        共 {{ filteredItems.length }} 个任务
        <span v-if="filteredItems.filter(i => i.status === 'active').length > 0" class="active-count">
          ({{ filteredItems.filter(i => i.status === 'active').length }} 个待接取)
        </span>
      </div>
    </div>

    <!-- 任务列表 -->
    <main class="errand-main">
      <div v-if="filteredItems.length === 0" class="empty-state">
        <HandHelping :size="48" />
        <p>暂无符合条件的任务</p>
        <button @click="goToPublish()">发布委托</button>
      </div>

      <div v-else class="item-list">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item-card"
          :class="{ highlight: item.status === 'active' }"
          @click="goToDetail(item.id)"
        >
          <!-- 状态指示器 -->
          <div class="status-indicator" :style="{ background: statusColors[item.status] || '#6b7280' }">
            <component :is="statusIcons[item.status] || HandHelping" :size="18" />
            <span>{{ statusLabels[item.status] || '未知' }}</span>
          </div>

          <!-- 任务内容 -->
          <div class="item-content">
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-desc">{{ item.description }}</p>
          </div>

          <!-- 任务信息 -->
          <div class="item-info">
            <div class="info-row">
              <div class="info-item">
                <MapPin :size="14" />
                <span>{{ item.campus }} · {{ item.location }}</span>
              </div>
              <div class="info-item">
                <Clock :size="14" />
                <span>{{ formatTime(item.createdAt) }}</span>
              </div>
            </div>

            <!-- 时间要求 -->
            <div class="time-requirement" v-if="item.taskDeadline">
              <Timer :size="14" />
              <span>要求完成时间：{{ item.taskDeadline }}</span>
            </div>

            <!-- 接取人信息 -->
            <div class="assignee-info" v-if="item.assignee">
              <User :size="14" />
              <span>接取人：{{ item.assignee.nickname }}</span>
              <span class="accepted-time">{{ formatTime(item.assignee.acceptedAt) }}接取</span>
            </div>

            <!-- 进度信息 -->
            <div class="progress-info" v-if="item.taskProgress">
              {{ item.taskProgress }}
            </div>
          </div>

          <!-- 底部信息 -->
          <div class="item-footer">
            <!-- 酬劳信息 -->
            <div class="reward-section">
              <Wallet :size="16" />
              <span class="reward-label">酬劳</span>
              <span class="reward-value">¥{{ item.reward || item.price || '面议' }}</span>
            </div>

            <!-- 浏览量 -->
            <div class="stats">
              <Eye :size="14" />
              <span>{{ item.viewCount }}</span>
            </div>
          </div>

          <!-- 快捷接取按钮 -->
          <button
            class="accept-btn"
            v-if="item.status === 'active'"
            @click.stop="goToDetail(item.id)"
          >
            <HandHelping :size="16" />
            <span>接取任务</span>
          </button>
        </div>
      </div>
    </main>

    <!-- 发布按钮 -->
    <button class="publish-fab" @click="goToPublish()">
      <Plus :size="24" />
      <span>发布委托</span>
    </button>
  </div>
</template>

<style scoped>
.errand-page {
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
  background: #f59e0b;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}

/* 状态切换标签 */
.status-tabs {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.status-tabs button {
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
}

.status-tabs button.active {
  background: #f59e0b;
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
  background: #f59e0b;
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

.active-count {
  color: #f59e0b;
  font-weight: 500;
}

/* 任务列表 */
.errand-main {
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
  background: #f59e0b;
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
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-card.highlight {
  border: 2px solid #f59e0b;
}

/* 状态指示器 */
.status-indicator {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

/* 任务内容 */
.item-content {
  padding: 16px;
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

/* 任务信息 */
.item-info {
  padding: 0 16px 16px;
}

.info-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #64748b;
}

.time-requirement {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #dc2626;
  margin-bottom: 12px;
}

.assignee-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #3b82f6;
  margin-bottom: 12px;
}

.accepted-time {
  color: #64748b;
  font-size: 12px;
}

.progress-info {
  padding: 8px 12px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 13px;
  color: #475569;
}

/* 底部信息 */
.item-footer {
  padding: 12px 16px;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reward-section {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reward-label {
  font-size: 12px;
  color: #64748b;
}

.reward-value {
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

/* 接取按钮 */
.accept-btn {
  margin: 12px 16px;
  width: calc(100% - 32px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}
</style>
