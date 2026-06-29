<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/stores/marketStore'
import { useUserStore } from '@/stores/userStore'
import type { MarketInfo } from '@/types/market'
import { ArrowLeft, Package, Eye, MapPin, Edit, Trash2, Search, Gift, Users, HandHelping, Plus, Clock } from '@lucide/vue'

const router = useRouter()
const marketStore = useMarketStore()
const userStore = useUserStore()

const selectedType = ref<string>('all')
const selectedStatus = ref<string>('all')

const typeOptions = [
  { value: 'all', label: '全部类型', icon: Package },
  { value: 'secondhand', label: '二手交易', icon: Package },
  { value: 'lostfound', label: '失物招领', icon: Search },
  { value: 'groupbuy', label: '拼单搭子', icon: Users },
  { value: 'errand', label: '跑腿委托', icon: HandHelping },
]

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'closed', label: '已关闭' },
]

const typeLabels: Record<string, string> = {
  'secondhand': '二手交易',
  'lostfound': '失物招领',
  'groupbuy': '拼单搭子',
  'errand': '跑腿委托',
}

const statusLabels: Record<string, string> = {
  'active': '进行中',
  'claimed': '已接取',
  'in-progress': '进行中',
  'completed': '已完成',
  'closed': '已关闭',
}

const typeColors: Record<string, string> = {
  'secondhand': '#3b82f6',
  'lostfound': '#8b5cf6',
  'groupbuy': '#ec4899',
  'errand': '#f59e0b',
}

const user = computed(() => userStore.user)

const myPosts = computed(() => {
  if (!user.value) return []
  return marketStore.marketList.filter(item => item.publisher?.id === user.value?.id)
})

const filteredPosts = computed(() => {
  let posts = myPosts.value
  
  if (selectedType.value !== 'all') {
    posts = posts.filter(p => p.type === selectedType.value)
  }
  
  if (selectedStatus.value !== 'all') {
    posts = posts.filter(p => p.status === selectedStatus.value)
  }
  
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

function goBack() {
  router.back()
}

function goToDetail(id: string) {
  router.push(`/detail/${id}`)
}

function goToPublish() {
  router.push('/publish')
}

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

async function fetchData() {
  await marketStore.fetchMarketList()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="my-posts-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <button class="back-btn" @click="goBack()">
        <ArrowLeft :size="20" />
      </button>
      <h1 class="page-title">我的发布</h1>
      <button class="publish-btn" @click="goToPublish()">
        <Plus :size="20" />
      </button>
    </header>

    <!-- 类型筛选 -->
    <div class="filters-section">
      <div class="type-filter">
        <button 
          v-for="opt in typeOptions"
          :key="opt.value"
          class="filter-btn"
          :class="{ active: selectedType === opt.value }"
          @click="selectedType = opt.value"
        >
          <component :is="opt.icon" :size="16" />
          <span>{{ opt.label }}</span>
        </button>
      </div>

      <div class="status-filter">
        <button 
          v-for="opt in statusOptions"
          :key="opt.value"
          class="status-btn"
          :class="{ active: selectedStatus === opt.value }"
          @click="selectedStatus = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <span class="stats-count">共 {{ filteredPosts.length }} 条发布</span>
    </div>

    <!-- 发布列表 -->
    <main class="posts-main">
      <div v-if="filteredPosts.length === 0" class="empty-state">
        <Package :size="48" />
        <p>暂无发布内容</p>
        <button class="empty-publish-btn" @click="goToPublish()">发布第一条信息</button>
      </div>

      <div v-else class="posts-list">
        <div 
          v-for="item in filteredPosts" 
          :key="item.id"
          class="post-card"
          @click="goToDetail(item.id)"
        >
          <div class="card-header">
            <div class="type-badge" :style="{ background: typeColors[item.type] || '#3b82f6' }">
              {{ typeLabels[item.type] || '未知' }}
            </div>
            <div class="status-badge" :class="item.status">
              {{ statusLabels[item.status] || '进行中' }}
            </div>
          </div>

          <div class="card-content">
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-desc">{{ item.description }}</p>
            
            <div class="card-meta">
              <span class="meta-item">
                <MapPin :size="14" />
                {{ item.campus }} · {{ item.location }}
              </span>
              <span class="meta-item">
                <Clock :size="14" />
                {{ formatTime(item.createdAt) }}
              </span>
              <span class="meta-item">
                <Eye :size="14" />
                {{ item.viewCount }} 次浏览
              </span>
            </div>
          </div>

          <div class="card-actions">
            <button class="action-btn edit" @click.stop="goToDetail(item.id)">
              <Edit :size="16" />
              <span>编辑</span>
            </button>
            <button class="action-btn delete">
              <Trash2 :size="16" />
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.my-posts-page {
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
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.publish-btn {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
}

/* 筛选区域 */
.filters-section {
  background: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.type-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
}

.filter-btn.active {
  background: #3b82f6;
  color: #fff;
}

.status-filter {
  display: flex;
  gap: 8px;
}

.status-btn {
  padding: 6px 12px;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
}

.status-btn.active {
  background: #1e293b;
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

/* 发布列表 */
.posts-main {
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
  font-size: 16px;
}

.empty-publish-btn {
  padding: 12px 24px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.type-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #fff;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.status-badge.active, .status-badge.in-progress {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.completed {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.closed {
  background: #f1f5f9;
  color: #64748b;
}

.card-content {
  margin-bottom: 12px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.item-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.card-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.action-btn.edit {
  background: #dbeafe;
  color: #2563eb;
}

.action-btn.delete {
  background: #fef2f2;
  color: #dc2626;
}
</style>