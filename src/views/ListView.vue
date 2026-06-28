<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/stores/marketStore'
import { useUserStore } from '@/stores/userStore'
import type { InfoType } from '@/types/market'

const router = useRouter()
const marketStore = useMarketStore()
const userStore = useUserStore()

const selectedType = ref<InfoType | 'all'>('all')
const searchKeyword = ref('')

const infoTypes = [
  { type: 'all', label: '全部', icon: '📋' },
  { type: 'secondhand', label: '二手交易', icon: '🛒' },
  { type: 'lostfound', label: '失物招领', icon: '🔍' },
  { type: 'groupbuy', label: '拼单搭子', icon: '🤝' },
  { type: 'errand', label: '跑腿委托', icon: '🚶' },
]

const filteredList = computed(() => {
  if (!marketStore.marketList) return []
  
  let list = [...marketStore.marketList]
  
  // 按类型过滤
  if (selectedType.value !== 'all') {
    list = list.filter(item => item.type === selectedType.value)
  }
  
  // 搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }
  
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

function goToDetail(id: string) {
  router.push(`/detail/${id}`)
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getTypeName(type: InfoType) {
  return infoTypes.find(t => t.type === type)?.label || type
}

function getTypeIcon(type: InfoType) {
  return infoTypes.find(t => t.type === type)?.icon || '📋'
}

onMounted(() => {
  marketStore.fetchMarketList()
})
</script>

<template>
  <div class="list-page">
    <header class="list-header">
      <div class="header-content">
        <button class="back-btn" @click="router.back()">
          <span>←</span>
        </button>
        <h1>信息列表</h1>
        <button class="publish-btn" @click="router.push('/publish')">
          <span>+</span>
        </button>
      </div>
    </header>

    <main class="list-main">
      <!-- 搜索栏 -->
      <div class="search-section">
        <div class="search-bar">
          <input 
            v-model="searchKeyword"
            type="text"
            placeholder="搜索信息..."
            class="search-input"
          />
        </div>
      </div>

      <!-- 类型筛选 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <button 
            v-for="item in infoTypes"
            :key="item.type"
            class="filter-tab"
            :class="{ active: selectedType === item.type }"
            @click="selectedType = item.type"
          >
            <span class="filter-icon">{{ item.icon }}</span>
            <span class="filter-label">{{ item.label }}</span>
          </button>
        </div>
      </div>

      <!-- 信息列表 -->
      <div class="items-section">
        <div v-if="filteredList.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>暂无信息</p>
          <button class="empty-btn" @click="router.push('/publish')">发布信息</button>
        </div>

        <div 
          v-for="item in filteredList"
          :key="item.id"
          class="list-item"
          @click="goToDetail(item.id)"
        >
          <div class="item-header">
            <div class="item-type-badge">
              <span class="type-icon">{{ getTypeIcon(item.type) }}</span>
              <span class="type-name">{{ getTypeName(item.type) }}</span>
            </div>
            <div class="item-status" :class="item.status">
              {{ item.status === 'active' ? '进行中' : item.status === 'completed' ? '已完成' : '已关闭' }}
            </div>
          </div>

          <h3 class="item-title">{{ item.title }}</h3>

          <div class="item-meta">
            <div class="meta-item">
              <span class="meta-icon">📍</span>
              <span>{{ item.campus }} · {{ item.location }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">🕐</span>
              <span>{{ formatTime(item.createdAt) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">👁️</span>
              <span>{{ item.viewCount }} 次浏览</span>
            </div>
          </div>

          <!-- 特殊信息 -->
          <div v-if="item.price" class="price-tag">
            ¥{{ item.price }}
          </div>

          <div v-if="item.reward" class="reward-tag">
            酬劳: ¥{{ item.reward }}
          </div>

          <div class="item-footer">
            <div class="publisher-info">
              <span class="publisher-icon">👤</span>
              <span class="publisher-name">{{ item.publisher.nickname }}</span>
            </div>
            <button class="detail-btn">查看详情 →</button>
          </div>
        </div>
      </div>
    </main>

    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/home')">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">首页</span>
      </button>
      <button class="nav-item active" @click="router.push('/list')">
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
.list-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%);
  padding-bottom: 80px;
}

.list-header {
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

.list-header h1 {
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

.list-main {
  padding: 20px;
}

.search-section {
  margin-bottom: 16px;
}

.search-bar {
  background: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-input {
  width: 100%;
  border: none;
  font-size: 15px;
  outline: none;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-tab.active {
  border-color: #10b981;
  color: #10b981;
  background: #f0fdf4;
  font-weight: 600;
}

.filter-icon {
  font-size: 16px;
}

.filter-label {
  font-size: 13px;
}

.items-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-type-badge {
  display: flex;
  align-items:: center;
  gap: 6px;
  padding: 4px 12px;
  background: #f0fdf4;
  border-radius: 8px;
}

.type-icon {
  font-size: 14px;
}

.type-name {
  font-size: 13px;
  font-weight: 500;
  color: #059669;
}

.item-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.item-status.active {
  background: #dbeafe;
  color: #1e40af;
}

.item-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.item-status.closed {
  background: #f1f5f9;
  color: #475569;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #64748b;
}

.meta-icon {
  font-size: 14px;
}

.price-tag {
  padding: 6px 16px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 8px;
  color: #92400e;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  display: inline-block;
}

.reward-tag {
  padding: 6px 16px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 8px;
  color: #065f46;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  display: inline-block;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.publisher-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.publisher-icon {
  font-size: 16px;
}

.publisher-name {
  font-size: 13px;
  color: #64748b;
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
  padding: 48px 24px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.6;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 16px;
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

.nav-item.active {
  color: #10b981;
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