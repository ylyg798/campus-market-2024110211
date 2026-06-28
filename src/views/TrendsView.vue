<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/stores/marketStore'

const router = useRouter()
const marketStore = useMarketStore()

const trends = ref<any[]>([])

onMounted(() => {
  marketStore.fetchMarketList()
})

function goToDetail(id: string) {
  router.push(`/detail/${id}`)
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
</script>

<template>
  <div class="trends-page">
    <header class="trends-header">
      <div class="header-content">
        <button class="back-btn" @click="router.back()">
          <span>←</span>
        </button>
        <h1>校园动态</h1>
        <div class="header-actions"></div>
      </div>
    </header>

    <main class="trends-main">
      <div class="trends-list">
        <div
          v-for="trend in marketStore.marketList"
          :key="trend.id"
          class="trend-card"
          @click="goToDetail(trend.id)"
        >
          <div class="trend-header">
            <div class="trend-avatar">
              <span>👤</span>
            </div>
            <div class="trend-info">
              <span class="trend-author">{{ trend.publisher.nickname }}</span>
              <span class="trend-time">{{ formatTime(trend.createdAt) }}</span>
            </div>
          </div>
          <div class="trend-content">
            <p>{{ trend.description }}</p>
          </div>
          <div v-if="trend.images && trend.images.length > 0" class="trend-images">
            <img v-for="(img, index) in trend.images.slice(0, 3)" :key="index" :src="img" :alt="trend.title" />
          </div>
          <div class="trend-footer">
            <span class="trend-likes">👍 {{ Math.floor(Math.random() * 100) }}</span>
            <span class="trend-comments">💬 {{ trend.replyCount || 0 }}</span>
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
.trends-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
}

.trends-header {
  background: #fff;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
}

.trends-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.trends-main {
  padding: 16px;
}

.trends-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trend-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
}

.trend-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.trend-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.trend-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.trend-author {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.trend-time {
  font-size: 12px;
  color: #94a3b8;
}

.trend-content {
  margin-bottom: 12px;
}

.trend-content p {
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.trend-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.trend-images img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
}

.trend-footer {
  display: flex;
  gap: 20px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.trend-likes,
.trend-comments {
  font-size: 14px;
  color: #64748b;
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
}

.nav-item.active {
  color: #10b981;
}

.nav-icon {
  font-size: 22px;
}

.nav-label {
  font-size: 11px;
  color: #64748b;
}

.publish-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -20px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.publish-btn .nav-icon {
  font-size: 28px;
}
</style>
