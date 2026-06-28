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
  Eye,
  MapPin,
  Clock,
  TrendingUp,
  ChevronRight,
  Star,
  Package,
  Gift,
  Sparkles,
  Bell
} from '@lucide/vue'

const router = useRouter()
const userStore = useUserStore()
const marketStore = useMarketStore()
const favoriteStore = useFavoriteStore()
const messageStore = useMessageStore()

const isLoading = ref(true)

const infoTypes: { type: InfoType; label: string; icon: Component; color: string; description: string }[] = [
  { type: 'secondhand', label: '二手交易', icon: ShoppingCart, color: '#3b82f6', description: '闲置好书、电子设备' },
  { type: 'lostfound', label: '失物招领', icon: Search, color: '#8b5cf6', description: '丢失物品、寻回失物' },
  { type: 'groupbuy', label: '拼单搭子', icon: Users, color: '#ec4899', description: '团购拼单、学习搭子' },
  { type: 'errand', label: '跑腿委托', icon: PersonStanding, color: '#f59e0b', description: '快递代取、外卖代买' },
]

const latestInfos = computed(() => marketStore.filteredList.slice(0, 8))
const hotInfos = computed(() => {
  return [...marketStore.filteredList]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 4)
})

const stats = computed(() => {
  const list = marketStore.marketList || []
  return {
    total: list.length,
    secondhand: list.filter(i => i.type === 'secondhand').length,
    lostfound: list.filter(i => i.type === 'lostfound').length,
    groupbuy: list.filter(i => i.type === 'groupbuy').length,
    errand: list.filter(i => i.type === 'errand').length,
  }
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

function goToMarket(type?: InfoType) {
  if (type === 'secondhand') router.push('/trade')
  else if (type === 'lostfound') router.push('/lost-found')
  else if (type === 'groupbuy') router.push('/group-buy')
  else if (type === 'errand') router.push('/errand')
  else router.push('/market')
}

function goToDetail(id: string) {
  router.push(`/detail/${id}`)
}

function goToPublish() {
  router.push('/publish')
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
    <!-- Hero Banner -->
    <section class="hero-banner">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">校园轻集市</h1>
          <p class="hero-subtitle">轻量 · 可信 · 面向校园生活</p>
          <div class="hero-actions">
            <button class="el-button el-button--primary el-button--large" @click="goToPublish()">
              <Plus :size="18" />
              发布信息
            </button>
            <button class="el-button el-button--default el-button--large" @click="goToMarket()">
              浏览全部
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=college%20students%20flea%20market%20at%20night%20with%20books%20and%20goods%20on%20ground%20warm%20lighting%20campus%20life&image_size=landscape_16_9" alt="校园跳蚤市场" />
        </div>
      </div>
    </section>

    <div class="page-container">
      <!-- 统计概览 -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
              <Package :size="20" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.secondhand }}</span>
              <span class="stat-label">二手商品</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6;">
              <Search :size="20" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.lostfound }}</span>
              <span class="stat-label">失物招领</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(236, 72, 153, 0.1); color: #ec4899;">
              <Users :size="20" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.groupbuy }}</span>
              <span class="stat-label">拼单搭子</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
              <PersonStanding :size="20" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.errand }}</span>
              <span class="stat-label">跑腿委托</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 分类入口 -->
      <section class="categories-section">
        <div class="section-header">
          <h2 class="section-title">
            <Sparkles :size="20" />
            快速入口
          </h2>
        </div>
        <div class="categories-grid">
          <div
            v-for="item in infoTypes"
            :key="item.type"
            class="category-card"
            @click="goToMarket(item.type)"
          >
            <div class="category-header" :style="{ background: item.color + '10' }">
              <component :is="item.icon" :size="32" :style="{ color: item.color }" />
            </div>
            <div class="category-body">
              <h3 class="category-title">{{ item.label }}</h3>
              <p class="category-desc">{{ item.description }}</p>
            </div>
            <div class="category-footer">
              <span class="category-count">{{ stats[item.type as keyof typeof stats] }} 条信息</span>
              <ChevronRight :size="16" class="category-arrow" />
            </div>
          </div>
        </div>
      </section>

      <!-- 最新发布 -->
      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">
            <Clock :size="20" />
            最新发布
          </h2>
          <button class="el-button el-button--text" @click="goToMarket()">
            查看全部
            <ChevronRight :size="16" />
          </button>
        </div>

        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="latestInfos.length === 0" class="el-empty">
          <div class="empty-content">
            <Package :size="48" class="empty-icon" />
            <p class="el-empty__description">暂无信息</p>
            <button class="el-button el-button--primary" @click="goToPublish()">发布第一条信息</button>
          </div>
        </div>

        <div v-else class="card-grid">
          <div
            v-for="info in latestInfos"
            :key="info.id"
            class="item-card"
            @click="goToDetail(info.id)"
          >
            <div class="item-image">
              <img
                :src="info.images?.[0] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'"
                alt="商品图片"
              />
              <div class="item-type-tag" :style="{ background: infoTypes.find(t => t.type === info.type)?.color }">
                {{ infoTypes.find(t => t.type === info.type)?.label }}
              </div>
            </div>
            <div class="item-body">
              <h3 class="item-title">{{ info.title }}</h3>
              <p class="item-description">{{ info.description }}</p>
              <div class="item-meta">
                <span class="meta-item">
                  <MapPin :size="14" />
                  {{ info.campus }}
                </span>
                <span class="meta-item">
                  <Clock :size="14" />
                  {{ formatTime(info.createdAt) }}
                </span>
              </div>
              <div class="item-footer">
                <div class="item-price">
                  <span v-if="info.price" class="price-value">¥{{ info.price }}</span>
                  <span v-else-if="info.reward" class="price-value">¥{{ info.reward }}</span>
                  <span v-else class="price-free">免费</span>
                </div>
                <div class="item-stats">
                  <span class="stat-item">
                    <Eye :size="14" />
                    {{ info.viewCount }}
                  </span>
                  <span class="stat-item">
                    <Heart :size="14" />
                    {{ info.favoriteCount || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 热门推荐 -->
      <section class="content-section hot-section">
        <div class="section-header">
          <h2 class="section-title">
            <TrendingUp :size="20" />
            热门推荐
          </h2>
        </div>

        <div v-if="hotInfos.length > 0" class="hot-list">
          <div
            v-for="(info, index) in hotInfos"
            :key="info.id"
            class="hot-item"
            @click="goToDetail(info.id)"
          >
            <div class="hot-rank" :class="{ top: index < 3 }">
              {{ index + 1 }}
            </div>
            <div class="hot-image">
              <img
                :src="info.images?.[0] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80'"
                alt="商品图片"
              />
            </div>
            <div class="hot-content">
              <h3 class="hot-title">{{ info.title }}</h3>
              <div class="hot-meta">
                <span class="el-tag el-tag--primary">{{ infoTypes.find(t => t.type === info.type)?.label }}</span>
                <span class="hot-views">
                  <Eye :size="12" />
                  {{ info.viewCount }} 次浏览
                </span>
              </div>
            </div>
            <div class="hot-price">
              <span v-if="info.price" class="price-value">¥{{ info.price }}</span>
              <span v-else-if="info.reward" class="price-value">¥{{ info.reward }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 安全提示 -->
      <section class="safety-section">
        <div class="safety-banner">
          <div class="safety-content">
            <h3>安全交易提示</h3>
            <div class="safety-list">
              <div class="safety-item">
                <MapPin :size="16" />
                <span>选择公共地点进行交易</span>
              </div>
              <div class="safety-item">
                <Eye :size="16" />
                <span>贵重物品当面查验真伪</span>
              </div>
              <div class="safety-item">
                <Bell :size="16" />
                <span>保护个人隐私信息安全</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--color-bg-base);
}

/* Hero Banner */
.hero-banner {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  padding: 48px 0;
  margin-bottom: 32px;
}

.hero-content {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: 0 var(--layout-content-padding);
  display: flex;
  align-items: center;
  gap: 48px;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  color: #fff;
  margin: 0 0 8px 0;
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 32px 0;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.hero-actions .el-button--primary {
  background: #fff;
  color: var(--color-primary);
  border: none;
}

.hero-actions .el-button--primary:hover {
  background: rgba(255, 255, 255, 0.9);
}

.hero-actions .el-button--default {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-actions .el-button--default:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hero-image {
  flex-shrink: 0;
}

.hero-image img {
  width: 480px;
  height: 320px;
  object-fit: cover;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

/* 统计概览 */
.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-card);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-card);
  transition: all var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: 4px;
}

/* 分类入口 */
.categories-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.category-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-card);
  padding: 24px;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-card);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.category-header {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.category-body {
  margin-bottom: 16px;
}

.category-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.category-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.category-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.category-arrow {
  color: var(--color-text-placeholder);
  transition: transform var(--transition-base);
}

.category-card:hover .category-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

/* 内容区域 */
.content-section {
  margin-bottom: 32px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  color: var(--color-text-placeholder);
}

/* 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.item-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-card);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-card);
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.item-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.item-card:hover .item-image img {
  transform: scale(1.05);
}

.item-type-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: var(--radius-tag);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: #fff;
}

.item-body {
  padding: 16px;
}

.item-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.price-free {
  font-size: var(--font-size-sm);
  color: var(--color-success);
}

.item-stats {
  display: flex;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

/* 热门列表 */
.hot-section {
  background: var(--color-bg-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.hot-item:hover {
  background: var(--color-bg-hover);
}

.hot-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-placeholder);
  background: var(--color-bg-base);
  border-radius: var(--radius-md);
}

.hot-rank.top {
  background: linear-gradient(135deg, #f59e0b 0%, #fb8c00 100%);
  color: #fff;
}

.hot-image {
  width: 80px;
  height: 60px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.hot-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-content {
  flex: 1;
}

.hot-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.hot-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hot-views {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.hot-price .price-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

/* 安全提示 */
.safety-section {
  margin-bottom: 32px;
}

.safety-banner {
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%);
  border: 1px solid rgba(46, 125, 50, 0.1);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.safety-content h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  margin: 0 0 16px 0;
}

.safety-list {
  display: flex;
  gap: 24px;
}

.safety-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.safety-item svg {
  color: var(--color-primary);
}
</style>
