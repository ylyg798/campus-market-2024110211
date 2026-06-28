<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useMarketStore } from '@/stores/marketStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useMessageStore } from '@/stores/messageStore'
import type { MarketInfo, InfoType } from '@/types/market'

const router = useRouter()
const userStore = useUserStore()
const marketStore = useMarketStore()
const favoriteStore = useFavoriteStore()
const messageStore = useMessageStore()

const isLoading = ref(true)

const infoTypes: { type: InfoType; label: string; icon: string; color: string; gradient: string }[] = [
  { type: 'secondhand', label: '二手交易', icon: '🛒', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { type: 'lostfound', label: '失物招领', icon: '🔍', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  { type: 'groupbuy', label: '拼单搭子', icon: '🤝', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  { type: 'errand', label: '跑腿委托', icon: '🚶', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
]

const latestInfos = computed(() => marketStore.filteredList.slice(0, 5))
const hotInfos = computed(() => {
  return [...marketStore.filteredList]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5)
})

const favoriteCount = computed(() => favoriteStore?.favorites?.length || 0)
const unreadCount = computed(() => messageStore?.totalUnread || 0)

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

function getTypeName(type: InfoType) {
  return infoTypes.find(t => t.type === type)?.label || type
}

function getTypeIcon(type: InfoType) {
  return infoTypes.find(t => t.type === type)?.icon || '📋'
}

function goToMarket(type?: InfoType) {
  if (type) {
    router.push({ name: 'market', query: { type } })
  } else {
    router.push('/market')
  }
}

function goToDetail(id: string) {
  router.push(`/detail/${id}`)
}

async function fetchData() {
  isLoading.value = true
  await marketStore.fetchMarketList()
  if (userStore.user) {
    await favoriteStore.fetchFavorites(userStore.user.id)
    await messageStore.fetchConversations(userStore.user.id)
  }
  isLoading.value = false
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="home-page">
    <header class="home-header">
      <div class="header-bg-pattern"></div>
      <div class="header-content">
        <div class="welcome-section">
          <div class="logo-badge">🏫</div>
          <h1>今日集市</h1>
          <p v-if="userStore.user">
            <span class="user-info">你好，{{ userStore.user.nickname }}</span>
            <span class="user-detail">{{ userStore.user.college }} · {{ userStore.user.campus }}</span>
          </p>
        </div>
        <div class="credit-badge">
          <div class="credit-score-circle">
            <span class="credit-icon">⭐</span>
            <span class="credit-score">{{ userStore.user?.creditScore || 100 }}</span>
          </div>
          <span class="credit-label">信用分</span>
        </div>
      </div>
      <div class="header-stats">
        <div class="header-stat">
          <span class="stat-num">{{ marketStore.filteredList.length }}</span>
          <span class="stat-text">今日信息</span>
        </div>
        <div class="header-stat">
          <span class="stat-num">{{ favoriteCount }}</span>
          <span class="stat-text">我的收藏</span>
        </div>
        <div class="header-stat">
          <span class="stat-num">{{ unreadCount }}</span>
          <span class="stat-text">未读消息</span>
        </div>
      </div>
    </header>

    <main class="home-main">
      <section class="quick-entries">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">🎯</span>
            快捷入口
          </h2>
        </div>
        <div class="entries-grid">
          <div
            v-for="item in infoTypes"
            :key="item.type"
            class="entry-card"
            :style="{ '--gradient': item.gradient }"
            @click="goToMarket(item.type)"
          >
            <div class="entry-icon-wrapper">
              <span class="entry-icon">{{ item.icon }}</span>
            </div>
            <span class="entry-label">{{ item.label }}</span>
            <div class="entry-badge">{{ marketStore.filteredList.filter(i => i.type === item.type).length }}</div>
          </div>
        </div>
      </section>

      <section class="stats-row">
        <div class="stat-card" @click="router.push('/profile')">
          <div class="stat-bg"></div>
          <span class="stat-icon">❤️</span>
          <div class="stat-info">
            <span class="stat-value">{{ favoriteCount }}</span>
            <span class="stat-label">我的收藏</span>
          </div>
        </div>
        <div class="stat-card message-card" @click="router.push('/messages')">
          <div class="stat-bg"></div>
          <span class="stat-icon">💬</span>
          <div class="stat-info">
            <span class="stat-value">{{ unreadCount }}</span>
            <span class="stat-label">未读消息</span>
          </div>
          <span v-if="unreadCount > 0" class="unread-badge pulse">{{ unreadCount }}</span>
        </div>
      </section>

      <section class="info-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">🆕</span>
            最新发布
          </h2>
          <button class="view-all-btn" @click="goToMarket()">
            <span>查看全部</span>
            <span class="arrow">→</span>
          </button>
        </div>
        <div v-if="isLoading" class="loading-skeleton">
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
        </div>
        <div v-else class="info-list">
          <div
            v-for="(info, index) in latestInfos"
            :key="info.id"
            class="info-item"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="goToDetail(info.id)"
          >
            <div class="info-type-badge" :style="{ '--gradient': infoTypes.find(t => t.type === info.type)?.gradient }">
              <span class="badge-icon">{{ getTypeIcon(info.type) }}</span>
            </div>
            <div class="info-content">
              <h3 class="info-title">{{ info.title }}</h3>
              <div class="info-tags">
                <span class="tag">{{ getTypeName(info.type) }}</span>
                <span class="tag">{{ info.campus }}</span>
                <span class="tag time">{{ formatTime(info.createdAt) }}</span>
              </div>
            </div>
            <div class="info-price">
              <span v-if="info.price" class="price-badge">¥{{ info.price }}</span>
              <span v-else-if="info.reward" class="price-badge reward">¥{{ info.reward }}</span>
              <span v-else-if="info.currentCount" class="count-badge">{{ info.currentCount }}/{{ info.targetCount }}</span>
            </div>
          </div>
        </div>
        <div v-if="latestInfos.length === 0 && !isLoading" class="empty-state">
          <span class="empty-icon">📭</span>
          <p>暂无最新信息</p>
          <button class="empty-btn" @click="router.push('/publish')">发布第一条信息</button>
        </div>
      </section>

      <section class="info-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">🔥</span>
            热门关注
          </h2>
          <button class="view-all-btn" @click="goToMarket()">
            <span>查看全部</span>
            <span class="arrow">→</span>
          </button>
        </div>
        <div v-if="isLoading" class="loading-skeleton">
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
        </div>
        <div v-else class="info-list hot-list">
          <div
            v-for="(info, index) in hotInfos"
            :key="info.id"
            class="info-item hot-item"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="goToDetail(info.id)"
          >
            <div class="hot-rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
            <div class="info-type-badge" :style="{ '--gradient': infoTypes.find(t => t.type === info.type)?.gradient }">
              <span class="badge-icon">{{ getTypeIcon(info.type) }}</span>
            </div>
            <div class="info-content">
              <h3 class="info-title">{{ info.title }}</h3>
              <div class="info-tags">
                <span class="tag view-count">👁️ {{ info.viewCount }}</span>
                <span class="tag">{{ info.campus }}</span>
              </div>
            </div>
            <div class="info-price">
              <span v-if="info.price" class="price-badge">¥{{ info.price }}</span>
              <span v-else-if="info.reward" class="price-badge reward">¥{{ info.reward }}</span>
              <span v-else-if="info.currentCount" class="count-badge">{{ info.currentCount }}/{{ info.targetCount }}</span>
            </div>
          </div>
        </div>
        <div v-if="hotInfos.length === 0 && !isLoading" class="empty-state">
          <span class="empty-icon">🔥</span>
          <p>暂无热门信息</p>
        </div>
      </section>

      <section class="safety-tips">
        <div class="tips-header">
          <div class="tips-icon-wrapper">
            <span class="tips-icon">⚠️</span>
          </div>
          <h3>交易安全提醒</h3>
        </div>
        <div class="tips-grid">
          <div class="tip-item">
            <span class="tip-icon">📍</span>
            <span class="tip-text">尽量选择公共地点交易</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🔍</span>
            <span class="tip-text">贵重物品注意验真</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🔒</span>
            <span class="tip-text">保护个人隐私信息</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🚫</span>
            <span class="tip-text">警惕异常低价陷阱</span>
          </div>
        </div>
      </section>
    </main>

    <nav class="bottom-nav">
      <button
        class="nav-item active"
        @click="router.push('/')"
      >
        <span class="nav-icon">🏠</span>
        <span class="nav-label">首页</span>
      </button>
      <button
        class="nav-item"
        @click="router.push('/market')"
      >
        <span class="nav-icon">🛒</span>
        <span class="nav-label">集市</span>
      </button>
      <button
        class="nav-item publish-btn"
        @click="router.push('/publish')"
      >
        <span class="nav-icon">+</span>
      </button>
      <button
        class="nav-item"
        @click="router.push('/messages')"
      >
        <span class="nav-icon">💬</span>
        <span class="nav-label">消息</span>
        <span v-if="unreadCount > 0" class="nav-badge pulse">{{ unreadCount }}</span>
      </button>
      <button
        class="nav-item"
        @click="router.push('/profile')"
      >
        <span class="nav-icon">👤</span>
        <span class="nav-label">我的</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%);
  padding-bottom: 80px;
}

/* Header Styles */
.home-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 32px 20px 24px;
  color: #fff;
  border-radius: 0 0 32px 32px;
  position: relative;
  overflow: hidden;
}

.header-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  opacity: 0.6;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.welcome-section {
  flex: 1;
}

.logo-badge {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 12px;
  animation: bounce 2s infinite;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
}

.welcome-section p {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-info {
  font-size: 16px;
  font-weight: 600;
}

.user-detail {
  font-size: 13px;
  opacity: 0.85;
}

.credit-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 16px 20px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.credit-score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.credit-icon {
  font-size: 18px;
  animation: rotate 3s linear infinite;
}

.credit-score {
  font-size: 24px;
  font-weight: 700;
}

.credit-label {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.header-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 20px;
  position: relative;
  z-index: 1;
}

.header-stat {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  backdrop-filter: blur(5px);
}

.stat-num {
  font-size: 20px;
  font-weight: 700;
  display: block;
}

.stat-text {
  font-size: 12px;
  opacity: 0.85;
  display: block;
}

/* Main Content */
.home-main {
  padding: 24px 20px;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 18px;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #10b981;
  border: none;
  background: none;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.1);
  transition: all 0.3s;
}

.view-all-btn:hover {
  background: rgba(16, 185, 129, 0.2);
  transform: translateX(2px);
}

.arrow {
  transition: transform 0.3s;
}

.view-all-btn:hover .arrow {
  transform: translateX(4px);
}

/* Quick Entries */
.quick-entries {
  margin-bottom: 32px;
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.entry-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.entry-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient);
}

.entry-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.entry-icon-wrapper {
  width: 56px;
  height: 56px;
  background: var(--gradient);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.entry-card:hover .entry-icon-wrapper {
  transform: scale(1.1);
}

.entry-icon {
  font-size: 28px;
}

.entry-label {
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}

.entry-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--gradient);
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.stat-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 32px;
  z-index: 1;
}

.stat-info {
  flex: 1;
  z-index: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
  display: block;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  display: block;
}

.unread-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

/* Loading Skeleton */
.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-item {
  height: 80px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  border-radius: 16px;
  animation: skeleton-loading 1.5s infinite;
}

/* Info List */
.info-section {
  margin-bottom: 32px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  animation: slideIn 0.3s ease-out;
}

.info-item:hover {
  transform: translateX(4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.info-type-badge {
  width: 48px;
  height: 48px;
  background: var(--gradient);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.badge-icon {
  font-size: 24px;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 8px;
  white-space: nowrap;
}

.tag.time {
  color: #94a3b8;
}

.tag.view-count {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.info-price {
  display: flex;
  align-items: center;
}

.price-badge {
  font-size: 16px;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  white-space: nowrap;
}

.price-badge.reward {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.count-badge {
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
}

/* Hot List */
.hot-list .info-item {
  padding-left: 60px;
}

.hot-item {
  position: relative;
}

.hot-rank {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.hot-rank.top {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #94a3b8;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 16px 0;
}

.empty-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.empty-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

/* Safety Tips */
.safety-tips {
  background: linear-gradient(135deg, #fff8f0 0%, #fff 100%);
  border: 2px solid #fed7aa;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.tips-icon-wrapper {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tips-icon {
  font-size: 20px;
}

.tips-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #d97706;
  margin: 0;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  padding: 12px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.1);
}

.tip-icon {
  font-size: 20px;
}

.tip-text {
  font-size: 13px;
  color: #92400e;
  font-weight: 500;
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.nav-item.active {
  color: #10b981;
}

.nav-item:hover {
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 24px;
}

.nav-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.nav-item.active .nav-label {
  color: #10b981;
}

.publish-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  width: 60px;
  height: 60px;
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

.nav-badge {
  position: absolute;
  top: 4px;
  right: 12px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 10px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

/* Animations */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.pulse {
  animation: pulse 2s infinite;
}
</style>
