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

const infoTypes: { type: InfoType; label: string; icon: string; color: string }[] = [
  { type: 'secondhand', label: '二手交易', icon: '🛒', color: '#4f46e5' },
  { type: 'lostfound', label: '失物招领', icon: '🔍', color: '#10b981' },
  { type: 'groupbuy', label: '拼单搭子', icon: '🤝', color: '#f59e0b' },
  { type: 'errand', label: '跑腿委托', icon: '🚶', color: '#ef4444' },
]

const latestInfos = computed(() => marketStore.filteredList.slice(0, 5))
const hotInfos = computed(() => {
  return [...marketStore.filteredList]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5)
})

const favoriteCount = computed(() => favoriteStore.favorites.length)
const unreadCount = computed(() => messageStore.totalUnread)

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
      <div class="header-content">
        <div class="welcome-section">
          <h1>今日集市</h1>
          <p v-if="userStore.user">
            你好，{{ userStore.user.nickname }} · {{ userStore.user.college }} · {{ userStore.user.campus }}
          </p>
        </div>
        <div class="credit-badge">
          <span class="credit-icon">⭐</span>
          <span class="credit-score">{{ userStore.user?.creditScore || 0 }}</span>
          <span class="credit-label">信用分</span>
        </div>
      </div>
    </header>

    <main class="home-main">
      <section class="quick-entries">
        <h2 class="section-title">快捷入口</h2>
        <div class="entries-grid">
          <div
            v-for="item in infoTypes"
            :key="item.type"
            class="entry-card"
            :style="{ '--color': item.color }"
            @click="goToMarket(item.type)"
          >
            <span class="entry-icon">{{ item.icon }}</span>
            <span class="entry-label">{{ item.label }}</span>
          </div>
        </div>
      </section>

      <section class="stats-row">
        <div class="stat-card" @click="router.push('/profile')">
          <span class="stat-icon">❤️</span>
          <div class="stat-info">
            <span class="stat-value">{{ favoriteCount }}</span>
            <span class="stat-label">我的收藏</span>
          </div>
        </div>
        <div class="stat-card" @click="router.push('/messages')">
          <span class="stat-icon">💬</span>
          <div class="stat-info">
            <span class="stat-value">{{ unreadCount }}</span>
            <span class="stat-label">未读消息</span>
          </div>
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
        </div>
      </section>

      <section class="info-section">
        <div class="section-header">
          <h2 class="section-title">最新发布</h2>
          <button class="view-all-btn" @click="goToMarket()">查看全部</button>
        </div>
        <div class="info-list">
          <div
            v-for="info in latestInfos"
            :key="info.id"
            class="info-item"
            @click="goToDetail(info.id)"
          >
            <div class="info-icon">{{ getTypeIcon(info.type) }}</div>
            <div class="info-content">
              <h3 class="info-title">{{ info.title }}</h3>
              <p class="info-meta">
                {{ getTypeName(info.type) }} · {{ info.campus }} · {{ formatTime(info.createdAt) }}
              </p>
            </div>
            <div class="info-price">
              <span v-if="info.price">¥{{ info.price }}</span>
              <span v-else-if="info.reward">¥{{ info.reward }}</span>
              <span v-else-if="info.currentCount">{{ info.currentCount }}/{{ info.targetCount }}</span>
            </div>
          </div>
        </div>
        <div v-if="latestInfos.length === 0 && !isLoading" class="empty-state">
          <p>暂无最新信息</p>
        </div>
      </section>

      <section class="info-section">
        <div class="section-header">
          <h2 class="section-title">热门关注</h2>
          <button class="view-all-btn" @click="goToMarket()">查看全部</button>
        </div>
        <div class="info-list">
          <div
            v-for="info in hotInfos"
            :key="info.id"
            class="info-item"
            @click="goToDetail(info.id)"
          >
            <div class="info-icon">{{ getTypeIcon(info.type) }}</div>
            <div class="info-content">
              <h3 class="info-title">{{ info.title }}</h3>
              <p class="info-meta">
                浏览 {{ info.viewCount }} 次 · {{ info.campus }}
              </p>
            </div>
            <div class="info-price">
              <span v-if="info.price">¥{{ info.price }}</span>
              <span v-else-if="info.reward">¥{{ info.reward }}</span>
              <span v-else-if="info.currentCount">{{ info.currentCount }}/{{ info.targetCount }}</span>
            </div>
          </div>
        </div>
        <div v-if="hotInfos.length === 0 && !isLoading" class="empty-state">
          <p>暂无热门信息</p>
        </div>
      </section>

      <section class="safety-tips">
        <div class="tips-header">
          <span class="tips-icon">⚠️</span>
          <h3>交易安全提醒</h3>
        </div>
        <ul class="tips-list">
          <li>📍 尽量选择公共地点交易</li>
          <li>🔍 贵重物品注意验真</li>
          <li>🔒 保护个人联系方式和隐私</li>
          <li>🚫 警惕异常低价和异常交易要求</li>
        </ul>
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
        <span v-if="unreadCount > 0" class="nav-badge">{{ unreadCount }}</span>
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
  background: #f8fafc;
  padding-bottom: 80px;
}

.home-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  color: #fff;
  border-radius: 0 0 24px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.welcome-section h1 {
  font-size: 24px;
  margin: 0 0 8px 0;
}

.welcome-section p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.credit-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 20px;
}

.credit-icon {
  font-size: 14px;
}

.credit-score {
  font-weight: 600;
  font-size: 16px;
}

.credit-label {
  font-size: 12px;
  opacity: 0.8;
}

.home-main {
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.view-all-btn {
  font-size: 14px;
  color: #667eea;
  border: none;
  background: none;
  cursor: pointer;
}

.quick-entries {
  margin-bottom: 24px;
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.entry-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
}

.entry-card:hover {
  transform: translateY(-4px);
}

.entry-icon {
  font-size: 28px;
}

.entry-label {
  font-size: 12px;
  color: #64748b;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  cursor: pointer;
}

.stat-icon {
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  display: block;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

.unread-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.info-section {
  margin-bottom: 24px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background 0.2s;
}

.info-item:hover {
  background: #f8fafc;
}

.info-icon {
  font-size: 24px;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-title {
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-meta {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.info-price {
  font-size: 15px;
  font-weight: 600;
  color: #667eea;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

.safety-tips {
  background: #fff8f0;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tips-icon {
  font-size: 16px;
}

.tips-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #d97706;
  margin: 0;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
}

.tips-list li {
  font-size: 13px;
  color: #92400e;
  margin-bottom: 4px;
}

.tips-list li:last-child {
  margin-bottom: 0;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
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
  transition: color 0.2s;
}

.nav-item.active {
  color: #667eea;
}

.nav-icon {
  font-size: 22px;
}

.nav-label {
  font-size: 11px;
  color: #64748b;
}

.nav-item.active .nav-label {
  color: #667eea;
}

.publish-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.publish-btn .nav-icon {
  font-size: 28px;
}

.nav-badge {
  position: absolute;
  top: 4px;
  right: 8px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 8px;
  min-width: 14px;
  text-align: center;
}
</style>
