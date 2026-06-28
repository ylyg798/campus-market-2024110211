<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useMarketStore } from '@/stores/marketStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useMessageStore } from '@/stores/messageStore'
import type { MarketInfo, InfoType } from '@/types/market'
import type { Component } from 'vue'
import {
  ShoppingCart,
  Search,
  Users,
  PersonStanding,
  MessageCircle,
  Heart,
  Plus,
  Home,
  List,
  BarChart2,
  User,
  Star,
  Eye,
  MapPin,
  Lock
} from '@lucide/vue'

const router = useRouter()
const userStore = useUserStore()
const marketStore = useMarketStore()
const favoriteStore = useFavoriteStore()
const messageStore = useMessageStore()

const isLoading = ref(true)

const infoTypes: { type: InfoType; label: string; icon: Component }[] = [
  { type: 'secondhand', label: '二手交易', icon: ShoppingCart },
  { type: 'lostfound', label: '失物招领', icon: Search },
  { type: 'groupbuy', label: '拼单搭子', icon: Users },
  { type: 'errand', label: '跑腿委托', icon: PersonStanding },
]

const latestInfos = computed(() => marketStore.filteredList.slice(0, 5))
const hotInfos = computed(() => {
  return [...marketStore.filteredList]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5)
})

const favoriteCount = computed(() => favoriteStore?.favorites?.length || 0)
const unreadCount = computed(() => 0)

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

function getTypeIcon(type: InfoType): Component {
  return infoTypes.find(t => t.type === type)?.icon || List
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
      <div class="header-left">
        <h1>校园轻集市</h1>
        <p v-if="userStore.user" class="user-greeting">
          你好，{{ userStore.user.nickname }}
        </p>
      </div>
      <div class="header-right">
        <div class="credit-badge">
          <Star :size="14" class="credit-icon" />
          <span>{{ userStore.user?.creditScore || 100 }}</span>
        </div>
      </div>
    </header>

    <main class="home-main">
      <!-- 快捷入口 -->
      <section class="quick-entries">
        <div class="entries-grid">
          <div
            v-for="item in infoTypes"
            :key="item.type"
            class="entry-card"
            @click="goToMarket(item.type)"
          >
            <component :is="item.icon" :size="24" class="entry-icon" />
            <span class="entry-label">{{ item.label }}</span>
          </div>
        </div>
      </section>

      <!-- 快捷操作 -->
      <section class="quick-actions">
        <button class="action-btn" @click="router.push('/messages')">
          <MessageCircle :size="16" />
          消息
          <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
        </button>
        <button class="action-btn" @click="router.push('/profile')">
          <Heart :size="16" />
          收藏 {{ favoriteCount }}
        </button>
        <button class="action-btn primary" @click="router.push('/publish')">
          <Plus :size="16" />
          发布信息
        </button>
      </section>

      <!-- 最新发布 -->
      <section class="info-section">
        <div class="section-header">
          <h2>最新发布</h2>
          <button class="more-btn" @click="goToMarket()">更多 →</button>
        </div>
        <div v-if="isLoading" class="loading">加载中...</div>
        <div v-else class="info-list">
          <div
            v-for="info in latestInfos"
            :key="info.id"
            class="info-item"
            @click="goToDetail(info.id)"
          >
            <div class="info-left">
              <component :is="getTypeIcon(info.type)" :size="20" class="type-icon" />
              <div class="info-content">
                <h3>{{ info.title }}</h3>
                <p class="info-meta">
                  {{ getTypeName(info.type) }} · {{ info.campus }} · {{ formatTime(info.createdAt) }}
                </p>
              </div>
            </div>
            <div class="info-right">
              <span v-if="info.price" class="price">¥{{ info.price }}</span>
              <span v-else-if="info.reward" class="price">¥{{ info.reward }}</span>
            </div>
          </div>
        </div>
        <div v-if="latestInfos.length === 0 && !isLoading" class="empty-state">
          暂无信息，<button @click="router.push('/publish')">发布第一条</button>
        </div>
      </section>

      <!-- 热门关注 -->
      <section class="info-section">
        <div class="section-header">
          <h2>热门关注</h2>
          <button class="more-btn" @click="goToMarket()">更多 →</button>
        </div>
        <div v-if="isLoading" class="loading">加载中...</div>
        <div v-else class="info-list">
          <div
            v-for="(info, index) in hotInfos"
            :key="info.id"
            class="info-item"
            @click="goToDetail(info.id)"
          >
            <div class="info-left">
              <span class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <component :is="getTypeIcon(info.type)" :size="20" class="type-icon" />
              <div class="info-content">
                <h3>{{ info.title }}</h3>
                <p class="info-meta">
                  <Eye :size="12" /> {{ info.viewCount }}次浏览 · {{ info.campus }}
                </p>
              </div>
            </div>
            <div class="info-right">
              <span v-if="info.price" class="price">¥{{ info.price }}</span>
              <span v-else-if="info.reward" class="price">¥{{ info.reward }}</span>
            </div>
          </div>
        </div>
        <div v-if="hotInfos.length === 0 && !isLoading" class="empty-state">
          暂无热门信息
        </div>
      </section>

      <!-- 安全提示 -->
      <section class="safety-tips">
        <h3>安全提示</h3>
        <ul>
          <li><MapPin :size="14" /> 选择公共地点交易</li>
          <li><Search :size="14" /> 贵重物品当面验真</li>
          <li><Lock :size="14" /> 保护个人隐私信息</li>
        </ul>
      </section>
    </main>

    <nav class="bottom-nav">
      <button class="nav-item active" @click="router.push('/')">
        <Home :size="20" />
        <span>首页</span>
      </button>
      <button class="nav-item" @click="router.push('/list')">
        <List :size="20" />
        <span>列表</span>
      </button>
      <button class="nav-item" @click="router.push('/board')">
        <BarChart2 :size="20" />
        <span>看板</span>
      </button>
      <button class="nav-item" @click="router.push('/message')">
        <MessageCircle :size="20" />
        <span>消息</span>
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </button>
      <button class="nav-item" @click="router.push('/profile')">
        <User :size="20" />
        <span>我的</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.home-header {
  background: #fff;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.home-header h1 {
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.user-greeting {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.credit-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f0fdf4;
  border-radius: 16px;
  font-size: 14px;
  color: #10b981;
}

.credit-icon {
  display: inline-flex;
}

.home-main {
  padding: 16px;
}

.quick-entries {
  margin-bottom: 16px;
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.entry-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #eee;
}

.entry-card:hover {
  border-color: #10b981;
}

.entry-card:active {
  transform: scale(0.98);
}

.entry-icon {
  display: inline-flex;
  margin-bottom: 8px;
}

.entry-label {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn.primary {
  background: #10b981;
  color: #fff;
  border: none;
}

.action-btn .badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.info-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h2 {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.more-btn {
  font-size: 13px;
  color: #10b981;
  background: none;
  border: none;
  cursor: pointer;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item:hover {
  background: #fafafa;
  margin: 0 -8px;
  padding: 12px 8px;
}

.info-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.type-icon {
  display: inline-flex;
}

.rank {
  width: 20px;
  height: 20px;
  background: #eee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
}

.rank.top {
  background: #fef3c7;
  color: #d97706;
}

.info-content h3 {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.info-meta {
  font-size: 12px;
  color: #999;
}

.info-right .price {
  font-size: 14px;
  color: #10b981;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.empty-state button {
  color: #10b981;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.safety-tips {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.safety-tips h3 {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.safety-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.safety-tips li {
  font-size: 13px;
  color: #666;
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.safety-tips li:last-child {
  border-bottom: none;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 8px 0;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #eee;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 12px;
  font-size: 10px;
  color: #666;
  position: relative;
}

.nav-item.active {
  color: #10b981;
}

.nav-item span:first-child {
  font-size: 20px;
}

.nav-item .badge {
  position: absolute;
  top: 0;
  right: 8px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 8px;
}
</style>
