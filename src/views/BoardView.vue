<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/stores/marketStore'
import { useUserStore } from '@/stores/userStore'
import {
  User,
  Star,
  BarChart2,
  List,
  TrendingUp,
  Home,
  ProfileIcon,
  RefreshCw,
  ArrowLeft
} from '@lucide/vue'

const router = useRouter()
const marketStore = useMarketStore()
const userStore = useUserStore()

// 统计数据
const stats = computed(() => {
  if (!marketStore.marketList) {
    return {
      total: 0,
      active: 0,
      completed: 0,
      secondhand: 0,
      lostfound: 0,
      groupbuy: 0,
      errand: 0,
      totalViews: 0,
      avgViews: 0,
    }
  }

  const list = marketStore.marketList

  const total = list.length
  const active = list.filter(item => item.status === 'active').length
  const completed = list.filter(item => item.status === 'completed').length
  const secondhand = list.filter(item => item.type === 'secondhand').length
  const lostfound = list.filter(item => item.type === 'lostfound').length
  const groupbuy = list.filter(item => item.type === 'groupbuy').length
  const errand = list.filter(item => item.type === 'errand').length
  const totalViews = list.reduce((sum, item) => sum + item.viewCount, 0)
  const avgViews = total > 0 ? Math.round(totalViews / total) : 0

  return {
    total,
    active,
    completed,
    secondhand,
    lostfound,
    groupbuy,
    errand,
    totalViews,
    avgViews,
  }
})

function goToPublish() {
  router.push('/publish')
}

function goToList() {
  router.push('/list')
}

onMounted(() => {
  marketStore.fetchMarketList()
})
</script>

<template>
  <div class="board-page">
    <header class="board-header">
      <div class="header-content">
        <button class="back-btn" @click="router.back()">
          <span>←</span>
        </button>
        <h1>数据看板</h1>
        <button class="refresh-btn" @click="marketStore.fetchMarketList()">
          <span>🔄</span>
        </button>
      </div>
    </header>

    <main class="board-main">
      <!-- 用户信息卡片 -->
      <div v-if="userStore.user" class="user-card">
        <div class="user-avatar">
          <span>👤</span>
        </div>
        <div class="user-info">
          <div class="user-name">{{ userStore.user.nickname }}</div>
          <div class="user-detail">{{ userStore.user.college }} · {{ userStore.user.campus }}</div>
        </div>
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <span class="stat-value">{{ userStore.user.creditScore }}</span>
            <span class="stat-label">信用分</span>
          </div>
        </div>
      </div>

      <!-- 总览统计 -->
      <div class="overview-section">
        <h2 class="section-title">📊 总览统计</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">📋</span>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">信息总数</div>
            </div>
          </div>

          <div class="stat-card active">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">🔥</span>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.active }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </div>

          <div class="stat-card completed">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">✅</span>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">👁️</span>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalViews }}</div>
              <div class="stat-label">总浏览量</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">📈</span>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.avgViews }}</div>
              <div class="stat-label">平均浏览</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 类型分布 -->
      <div class="distribution-section">
        <h2 class="section-title">📈 类型分布</h2>
        <div class="distribution-list">
          <div class="distribution-item">
            <div class="dist-icon">🛒</div>
            <div class="dist-info">
              <div class="dist-label">二手交易</div>
              <div class="dist-bar-wrapper">
                <div class="dist-bar" :style="{ width: `${(stats.secondhand / stats.total) * 100}%` }"></div>
              </div>
              <div class="dist-value">{{ stats.secondhand }} 条</div>
            </div>
          </div>

          <div class="distribution-item">
            <div class="dist-icon">🔍</div>
            <div class="dist-info">
              <div class="dist-label">失物招领</div>
              <div class="dist-bar-wrapper">
                <div class="dist-bar lostfound" :style="{ width: `${(stats.lostfound / stats.total) * 100}%` }"></div>
              </div>
              <div class="dist-value">{{ stats.lostfound }} 条</div>
            </div>
          </div>

          <div class="distribution-item">
            <div class="dist-icon">🤝</div>
            <div class="dist-info">
              <div class="dist-label">拼单搭子</div>
              <div class="dist-bar-wrapper">
                <div class="dist-bar groupbuy" :style="{ width: `${(stats.groupbuy / stats.total) * 100}%` }"></div>
              </div>
              <div class="dist-value">{{ stats.groupbuy }} 条</div>
            </div>
          </div>

          <div class="distribution-item">
            <div class="dist-icon">🚶</div>
            <div class="dist-info">
              <div class="dist-label">跑腿委托</div>
              <div class="dist-bar-wrapper">
                <div class="dist-bar errand" :style="{ width: `${(stats.errand / stats.total) * 100}%` }"></div>
              </div>
              <div class="dist-value">{{ stats.errand }} 条</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="actions-section">
        <h2 class="section-title">⚡ 快捷操作</h2>
        <div class="actions-grid">
          <button class="action-btn primary" @click="goToPublish()">
            <span class="action-icon">✏️</span>
            <span class="action-label">发布信息</span>
          </button>
          <button class="action-btn secondary" @click="goToList()">
            <span class="action-icon">📋</span>
            <span class="action-label">查看列表</span>
          </button>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="tips-section">
        <div class="tip-card">
          <div class="tip-icon">💡</div>
          <div class="tip-content">
            <div class="tip-title">小提示</div>
            <div class="tip-text">
              数据看板显示当前系统的实时统计数据，刷新按钮可以获取最新数据。
            </div>
          </div>
        </div>
      </div>
    </main>

    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/home')">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">首页</span>
      </button>
      <button class="nav-item" @click="router.push('/list')">
        <span class="nav-icon">📋</span>
        <span class="nav-label">列表</span>
      </button>
      <button class="nav-item publish-btn" @click="router.push('/publish')">
        <span class="nav-icon">+</span>
      </button>
      <button class="nav-item" @click="router.push('/message')">
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
.board-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%);
  padding-bottom: 80px;
}

.board-header {
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

.back-btn, .refresh-btn {
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

.board-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.board-main {
  padding: 20px;
}

.user-card {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fff;
}

.user-avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-detail {
  font-size: 14px;
  opacity: 0.9;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.stat-icon {
  font-size: 16px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.overview-section {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  background: #f0fdf4;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.stat-card.active .stat-icon-wrapper {
  background: #fef3c7;
}

.stat-card.completed .stat-icon-wrapper {
  background: #d1fae5;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.distribution-section {
  margin-bottom: 24px;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
}

.dist-icon {
  width: 48px;
  height: 48px;
  background: #f0fdf4;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.dist-info {
  flex: 1;
}

.dist-label {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.dist-bar-wrapper {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.dist-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
  transition: width 0.5s;
}

.dist-bar.lostfound {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.dist-bar.groupbuy {
  background: linear-gradient(90deg, #ec4899 0%, #db2777 100%);
}

.dist-bar.errand {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.dist-value {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.actions-section {
  margin-bottom: 24px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.primary {
  border-color: #10b981;
}

.action-btn.primary:hover {
  background: #f0fdf4;
}

.action-btn.secondary {
  border-color: #64748b;
}

.action-btn.secondary:hover {
  background: #f8fafc;
}

.action-icon {
  font-size: 28px;
}

.action-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.tips-section {
  margin-bottom: 24px;
}

.tip-card {
  background: linear-gradient(135deg, #fff8f0 0%, #fff 100%);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid #fed7aa;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.tip-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 16px;
  font-weight: 600;
  color: #d97706;
  margin-bottom: 8px;
}

.tip-text {
  font-size: 13px;
  color: #92400e;
  line-height: 1.6;
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
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-icon {
  font-size: 24px;
}

.nav-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.publish-btn {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -24px;
  box-shadow: 0 6px 24px rgba(16, 185, 129, 0.5);
  transition: all 0.3s;
}

.publish-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.6);
}

.publish-btn .nav-icon {
  font-size: 32px;
  font-weight: 300;
}
</style>
