<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMarketStore } from '@/stores/marketStore'
import type { InfoType, MarketInfo } from '@/types/market'

const router = useRouter()
const route = useRoute()
const marketStore = useMarketStore()

const searchKeyword = ref('')
const selectedType = ref<InfoType | ''>('')
const selectedCampus = ref('')
const selectedStatus = ref('')

const infoTypes: { type: InfoType; label: string; icon: string }[] = [
  { type: 'secondhand', label: '二手交易', icon: '🛒' },
  { type: 'lostfound', label: '失物招领', icon: '🔍' },
  { type: 'groupbuy', label: '拼单搭子', icon: '🤝' },
  { type: 'errand', label: '跑腿委托', icon: '🚶' },
]

const campuses = ['东校区', '西校区', '南校区', '北校区']

const filteredList = computed(() => marketStore.filteredList)

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

function goToDetail(id: string) {
  router.push(`/detail/${id}`)
}

function applyFilters() {
  marketStore.setFilter({
    type: selectedType.value || undefined,
    campus: selectedCampus.value || undefined,
    keyword: searchKeyword.value || undefined,
  })
}

function clearFilters() {
  searchKeyword.value = ''
  selectedType.value = ''
  selectedCampus.value = ''
  marketStore.setFilter({})
}

onMounted(() => {
  marketStore.fetchMarketList()
  
  const type = route.query.type as InfoType
  if (type) {
    selectedType.value = type
    applyFilters()
  }
})
</script>

<template>
  <div class="market-page">
    <header class="market-header">
      <div class="header-content">
        <button class="back-btn" @click="router.back()">
          <span>←</span>
        </button>
        <h1>集市浏览</h1>
        <div class="header-actions">
          <button class="publish-btn" @click="router.push('/publish')">
            <span>+</span>
          </button>
        </div>
      </div>
    </header>

    <div class="search-section">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索商品、服务..."
          class="search-input"
          @keyup.enter="applyFilters()"
        />
        <button v-if="searchKeyword" class="clear-search" @click="searchKeyword = ''; applyFilters()">✕</button>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>类型</label>
          <div class="filter-options">
            <button
              class="filter-option"
              :class="{ active: !selectedType }"
              @click="selectedType = ''; applyFilters()"
            >
              全部
            </button>
            <button
              v-for="item in infoTypes"
              :key="item.type"
              class="filter-option"
              :class="{ active: selectedType === item.type }"
              @click="selectedType = item.type; applyFilters()"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <label>校区</label>
          <select v-model="selectedCampus" class="filter-select" @change="applyFilters()">
            <option value="">全部校区</option>
            <option v-for="campus in campuses" :key="campus" :value="campus">
              {{ campus }}
            </option>
          </select>
        </div>
      </div>

      <button class="clear-filter-btn" @click="clearFilters()" v-if="selectedType || selectedCampus || searchKeyword">
        清除筛选
      </button>
    </div>

    <main class="market-main">
      <div v-if="marketStore.isLoading" class="loading-state">
        <p>加载中...</p>
      </div>

      <div v-else-if="filteredList.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无相关信息</p>
      </div>

      <div v-else class="info-grid">
        <div
          v-for="info in filteredList"
          :key="info.id"
          class="info-card"
          @click="goToDetail(info.id)"
        >
          <div class="card-image">
            <img v-if="info.images.length > 0" :src="info.images[0]" :alt="info.title" />
            <div v-else class="no-image">
              <span>{{ getTypeIcon(info.type) }}</span>
            </div>
          </div>
          <div class="card-content">
            <div class="card-header">
              <span class="type-tag">{{ getTypeName(info.type) }}</span>
              <span class="campus-tag">{{ info.campus }}</span>
            </div>
            <h3 class="card-title">{{ info.title }}</h3>
            <p class="card-desc">{{ info.description }}</p>
            <div class="card-footer">
              <span class="price">
                <span v-if="info.price">¥{{ info.price }}</span>
                <span v-else-if="info.reward">¥{{ info.reward }}</span>
                <span v-else-if="info.currentCount">{{ info.currentCount }}/{{ info.targetCount }}人</span>
                <span v-else>免费</span>
              </span>
              <span class="time">{{ formatTime(info.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/')">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">首页</span>
      </button>
      <button class="nav-item active" @click="router.push('/market')">
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
.market-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
}

.market-header {
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

.market-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.publish-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
}

.search-section {
  padding: 16px 20px;
  background: #fff;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 10px 16px;
}

.search-icon {
  font-size: 16px;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 15px;
  outline: none;
}

.clear-search {
  border: none;
  background: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
}

.filter-section {
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
}

.filter-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.filter-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-option {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 13px;
  color: #64748b;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-option.active {
  background: #667eea;
  color: #fff;
  border-color: #667eea;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
}

.clear-filter-btn {
  margin-top: 12px;
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  color: #667eea;
  background: #fff;
  cursor: pointer;
}

.market-main {
  padding: 16px 20px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.card-image {
  width: 100%;
  height: 180px;
  position: relative;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  font-size: 48px;
}

.card-content {
  padding: 16px;
}

.card-header {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.type-tag,
.campus-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.type-tag {
  background: #eef2ff;
  color: #6366f1;
}

.campus-tag {
  background: #f1f5f9;
  color: #64748b;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.card-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
}

.time {
  font-size: 12px;
  color: #94a3b8;
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
</style>
