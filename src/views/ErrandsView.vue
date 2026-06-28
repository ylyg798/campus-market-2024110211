<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/stores/marketStore'
import { useUserStore } from '@/stores/userStore'
import type { InfoStatus } from '@/types/market'
import {
  ArrowLeft,
  Plus,
  Upload,
  Download,
  MapPin,
  Clock,
  DollarSign,
  Eye,
  User,
  Package,
  Search
} from '@lucide/vue'

const router = useRouter()
const marketStore = useMarketStore()
const userStore = useUserStore()

const activeTab = ref<'published' | 'accepted'>('published')
const statusFilter = ref<InfoStatus | 'all'>('all')

const statusLabels: Record<string, string> = {
  'active': '待接取',
  'claimed': '已接取',
  'in-progress': '进行中',
  'completed': '已完成',
  'closed': '已关闭',
}

const myPublishedTasks = computed(() => {
  if (!userStore.user || !marketStore.marketList) return []
  return marketStore.marketList
    .filter(item =>
      item.type === 'errand' &&
      item.publisher.id === userStore.user!.id
    )
    .filter(item => {
      if (statusFilter.value === 'all') return true
      return item.status === statusFilter.value
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const myAcceptedTasks = computed(() => {
  if (!userStore.user || !marketStore.marketList) return []
  return marketStore.marketList
    .filter(item =>
      item.type === 'errand' &&
      item.assignee?.id === userStore.user!.id
    )
    .filter(item => {
      if (statusFilter.value === 'all') return true
      return item.status === statusFilter.value
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

function formatTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function goToDetail(taskId: string) {
  router.push(`/detail/${taskId}`)
}

function goToPublish() {
  router.push('/publish')
}

function changeTab(tab: 'published' | 'accepted') {
  activeTab.value = tab
  statusFilter.value = 'all'
}

onMounted(() => {
  marketStore.fetchMarketList()
})
</script>

<template>
  <div class="errands-page">
    <header class="errands-header">
      <div class="header-content">
        <button class="back-btn" @click="router.back()">
          <ArrowLeft :size="20" />
        </button>
        <h1>我的跑腿任务</h1>
        <button class="publish-btn" @click="goToPublish()">
          <Plus :size="20" />
        </button>
      </div>
    </header>

    <main class="errands-main">
      <!-- 标签切换 -->
      <div class="tabs-section">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'published' }"
          @click="changeTab('published')"
        >
          <Upload :size="18" />
          我发布的任务
          <span class="tab-count">{{ myPublishedTasks.length }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'accepted' }"
          @click="changeTab('accepted')"
        >
          <Download :size="18" />
          我接取的任务
          <span class="tab-count">{{ myAcceptedTasks.length }}</span>
        </button>
      </div>

      <!-- 状态筛选 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <button
            v-for="(label, status) in { 'all': '全部', ...statusLabels }"
            :key="status"
            class="filter-tab"
            :class="{ active: statusFilter === status }"
            @click="statusFilter = status === 'all' ? 'all' : status as InfoStatus"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="tasks-section">
        <!-- 我发布的任务 -->
        <div v-if="activeTab === 'published'" class="tasks-list">
          <div
            v-for="task in myPublishedTasks"
            :key="task.id"
            class="task-card"
            @click="goToDetail(task.id)"
          >
            <div class="task-header">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-status" :class="task.status">
                {{ statusLabels[task.status] || task.status }}
              </div>
            </div>

            <div class="task-info">
              <div class="info-item">
                <MapPin :size="14" class="info-icon" />
                <span>{{ task.campus }} · {{ task.location }}</span>
              </div>
              <div class="info-item">
                <Clock :size="14" class="info-icon" />
                <span>{{ formatTime(task.createdAt) }}</span>
              </div>
              <div class="info-item" v-if="task.reward">
                <DollarSign :size="14" class="info-icon" />
                <span class="reward-text">¥{{ task.reward }}</span>
              </div>
            </div>

            <!-- 接取者信息 -->
            <div v-if="task.assignee" class="assignee-info">
              <div class="assignee-label">已由 {{ task.assignee.nickname }} 接取</div>
              <div class="assignee-time">{{ formatTime(task.assignee.acceptedAt) }}</div>
            </div>

            <!-- 任务进度 -->
            <div v-if="task.taskProgress" class="progress-info">
              <div class="progress-label">任务进度：</div>
              <div class="progress-text">{{ task.taskProgress }}</div>
            </div>

            <div class="task-footer">
              <div class="view-count">
                <Eye :size="14" />
                {{ task.viewCount }} 次浏览
              </div>
              <button class="detail-btn">查看详情 →</button>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="myPublishedTasks.length === 0" class="empty-state">
            <Package :size="48" class="empty-icon" />
            <div class="empty-text">暂无发布的任务</div>
            <button class="create-btn" @click="goToPublish()">发布新任务</button>
          </div>
        </div>

        <!-- 我接取的任务 -->
        <div v-if="activeTab === 'accepted'" class="tasks-list">
          <div
            v-for="task in myAcceptedTasks"
            :key="task.id"
            class="task-card"
            @click="goToDetail(task.id)"
          >
            <div class="task-header">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-status" :class="task.status">
                {{ statusLabels[task.status] || task.status }}
              </div>
            </div>

            <div class="task-info">
              <div class="info-item">
                <MapPin :size="14" class="info-icon" />
                <span>{{ task.campus }} · {{ task.location }}</span>
              </div>
              <div class="info-item">
                <User :size="14" class="info-icon" />
                <span>发布者：{{ task.publisher.nickname }}</span>
              </div>
              <div class="info-item" v-if="task.reward">
                <DollarSign :size="14" class="info-icon" />
                <span class="reward-text">¥{{ task.reward }}</span>
              </div>
              <div class="info-item" v-if="task.expectedTime">
                <Clock :size="14" class="info-icon" />
                <span>期望完成：{{ formatTime(task.expectedTime) }}</span>
              </div>
            </div>

            <!-- 任务进度 -->
            <div v-if="task.taskProgress" class="progress-info">
              <div class="progress-label">任务进度：</div>
              <div class="progress-text">{{ task.taskProgress }}</div>
            </div>

            <div class="task-footer">
              <div class="accepted-time">接取时间：{{ formatTime(task.assignee!.acceptedAt) }}</div>
              <button class="detail-btn">查看详情 →</button>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="myAcceptedTasks.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <div class="empty-text">暂无接取的任务</div>
            <button class="create-btn" @click="router.push('/market')">去集市寻找任务</button>
          </div>
        </div>
      </div>
    </main>

    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/')">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">首页</span>
      </button>
      <button class="nav-item" @click="router.push('/market')">
        <span class="nav-icon">🛒</span>
        <span class="nav-label">集市</span>
      </button>
      <button class="nav-item publish-btn" @click="router.push('/publish')">
        <span class="nav-icon">+</span>
      </button>
      <button class="nav-item" @click="router.push('/messages')">
        <span class="nav-icon">💬</span>
        <span class="nav-label">消息</span>
      </button>
      <button class="nav-item" @click="router.push('/profile')">
        <span class="nav-icon">👤</span>
        <span class="nav-label">我的</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.errands-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%);
  padding-bottom: 80px;
}

.errands-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 16px 20px;
  color: #fff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  color: #fff;
}

.errands-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.publish-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  font-size: 24px;
  cursor: pointer;
  color: #fff;
}

.errands-main {
  padding: 20px;
}

.tabs-section {
  background: #fff;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
}

.tab-count {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 12px;
}

.tab-btn:not(.active) .tab-count {
  background: #e2e8f0;
}

.filter-section {
  margin-bottom: 16px;
}

.filter-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab.active {
  border-color: #10b981;
  color: #10b981;
  background: #f0fdf4;
  font-weight: 600;
}

.tasks-section {
  margin-top: 20px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.task-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.task-status.active {
  background: #dbeafe;
  color: #1e40af;
}

.task-status.claimed {
  background: #fef3c7;
  color: #92400e;
}

.task-status.in-progress {
  background: #fce7f3;
  color: #9f1239;
}

.task-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.task-status.closed {
  background: #f1f5f9;
  color: #475569;
}

.task-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #64748b;
}

.info-icon {
  font-size: 14px;
}

.reward-text {
  color: #10b981;
  font-weight: 600;
}

.assignee-info {
  margin-top: 12px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #86efac;
}

.assignee-label {
  font-size: 13px;
  font-weight: 600;
  color: #059669;
}

.assignee-time {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.progress-info {
  margin-top: 12px;
  padding: 12px;
  background: #fef3c7;
  border-radius: 8px;
  border: 1px solid #fcd34d;
}

.progress-label {
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
}

.progress-text {
  font-size: 13px;
  color: #78350f;
  margin-top: 4px;
  line-height: 1.5;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.view-count, .accepted-time {
  font-size: 12px;
  color: #94a3b8;
}

.detail-btn {
  font-size: 13px;
  color: #10b981;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 20px;
}

.create-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 20px;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f1f5f9;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-icon {
  font-size: 20px;
}

.nav-label {
  font-size: 12px;
  color: #64748b;
}

.nav-item:hover .nav-label {
  color: #10b981;
}

.publish-btn {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  margin-top: -20px;
}

.publish-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}
</style>
