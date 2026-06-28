<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useMarketStore } from '@/stores/marketStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useMessageStore } from '@/stores/messageStore'
import {
  User, Package, Heart, MessageCircle, Settings, LogOut, ChevronRight,
  Edit2, Bell, Shield, HelpCircle, Star, Clock, ShoppingBag
} from '@lucide/vue'

const router = useRouter()
const userStore = useUserStore()
const marketStore = useMarketStore()
const favoriteStore = useFavoriteStore()
const messageStore = useMessageStore()

const showLogoutConfirm = ref(false)

// 用户信息
const user = computed(() => userStore.user)

// 统计数据
const stats = computed(() => ({
  published: marketStore.marketList.filter(item => item.publisher?.id === user.value?.id).length,
  favorites: favoriteStore.favorites.length,
  messages: messageStore.conversations.length,
}))

// 菜单项
const menuItems = [
  { icon: Package, label: '我的发布', path: '/my-posts', color: '#3b82f6' },
  { icon: Heart, label: '我的收藏', path: '/my-favorites', color: '#ec4899' },
  { icon: MessageCircle, label: '消息中心', path: '/message', color: '#8b5cf6' },
  { icon: Clock, label: '浏览历史', path: '/history', color: '#f59e0b' },
]

const settingsItems = [
  { icon: User, label: '个人资料', path: '/settings/profile' },
  { icon: Bell, label: '通知设置', path: '/settings/notification' },
  { icon: Shield, label: '隐私设置', path: '/settings/privacy' },
  { icon: HelpCircle, label: '帮助中心', path: '/help' },
]

function goToProfileEdit() {
  router.push('/settings/profile')
}

function goToPath(path: string) {
  router.push(path)
}

function handleLogout() {
  userStore.logout()
  showLogoutConfirm.value = false
  router.push('/')
}

onMounted(async () => {
  if (user.value) {
    await favoriteStore.fetchFavorites(user.value.id)
    await messageStore.fetchConversations(user.value.id)
  }
})
</script>

<template>
  <div class="user-center-page">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-avatar">
        <img v-if="user?.avatar" :src="user.avatar" :alt="user.nickname" />
        <div v-else class="avatar-placeholder">
          <User :size="32" />
        </div>
      </div>

      <div class="user-info">
        <div class="user-name-row">
          <h2 class="user-name">{{ user?.nickname || '未登录' }}</h2>
          <button class="edit-btn" @click="goToProfileEdit()">
            <Edit2 :size="16" />
          </button>
        </div>
        <p class="user-id">ID: {{ user?.id || '---' }}</p>
        <p class="user-desc">{{ user?.bio || '这个人很懒，什么都没写' }}</p>
      </div>

      <!-- 统计数据 -->
      <div class="stats-grid">
        <div class="stat-item" @click="goToPath('/my-posts')">
          <span class="stat-value">{{ stats.published }}</span>
          <span class="stat-label">发布</span>
        </div>
        <div class="stat-item" @click="goToPath('/my-favorites')">
          <span class="stat-value">{{ stats.favorites }}</span>
          <span class="stat-label">收藏</span>
        </div>
        <div class="stat-item" @click="goToPath('/message')">
          <span class="stat-value">{{ stats.messages }}</span>
          <span class="stat-label">消息</span>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <h3 class="section-title">我的功能</h3>
      <div class="menu-list">
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="menu-item"
          @click="goToPath(item.path)"
        >
          <div class="menu-icon" :style="{ background: item.color }">
            <component :is="item.icon" :size="20" />
          </div>
          <span class="menu-label">{{ item.label }}</span>
          <ChevronRight :size="18" class="menu-arrow" />
        </div>
      </div>
    </div>

    <!-- 设置菜单 -->
    <div class="settings-section">
      <h3 class="section-title">设置</h3>
      <div class="settings-list">
        <div
          v-for="item in settingsItems"
          :key="item.path"
          class="settings-item"
          @click="goToPath(item.path)"
        >
          <component :is="item.icon" :size="20" class="settings-icon" />
          <span class="settings-label">{{ item.label }}</span>
          <ChevronRight :size="18" class="settings-arrow" />
        </div>
      </div>
    </div>

    <!-- 退出登录 -->
    <div class="logout-section">
      <button class="logout-btn" @click="showLogoutConfirm = true">
        <LogOut :size="18" />
        <span>退出登录</span>
      </button>
    </div>

    <!-- 退出确认对话框 -->
    <div v-if="showLogoutConfirm" class="confirm-dialog">
      <div class="dialog-content">
        <h3>确认退出登录？</h3>
        <p>退出后需要重新登录才能使用完整功能</p>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="showLogoutConfirm = false">取消</button>
          <button class="confirm-btn" @click="handleLogout()">确认退出</button>
        </div>
      </div>
    </div>

    <!-- 未登录提示 -->
    <div v-if="!user" class="login-prompt">
      <div class="prompt-content">
        <User :size="48" />
        <p>登录后可查看个人信息和管理发布内容</p>
        <button class="login-btn" @click="router.push('/login')">登录/注册</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-center-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 16px;
}

/* 用户卡片 */
.user-card {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  margin-bottom: 16px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  margin-bottom: 16px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  margin-bottom: 16px;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.edit-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.user-id {
  font-size: 12px;
  margin: 8px 0;
  opacity: 0.8;
}

.user-desc {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  display: block;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

/* 功能菜单 */
.menu-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f1f5f9;
}

.menu-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.menu-label {
  font-size: 15px;
  color: #1e293b;
  flex: 1;
}

.menu-arrow {
  color: #94a3b8;
}

/* 设置菜单 */
.settings-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  cursor: pointer;
}

.settings-item:hover {
  background: #f8fafc;
}

.settings-icon {
  color: #64748b;
}

.settings-label {
  font-size: 14px;
  color: #1e293b;
  flex: 1;
}

.settings-arrow {
  color: #94a3b8;
}

/* 退出登录 */
.logout-section {
  padding: 16px;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #fef2f2;
  color: #dc2626;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

/* 确认对话框 */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 80%;
  max-width: 320px;
}

.dialog-content h3 {
  font-size: 18px;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.dialog-content p {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 20px 0;
}

.dialog-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}

.confirm-btn {
  flex: 1;
  padding: 12px;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}

/* 未登录提示 */
.login-prompt {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prompt-content {
  text-align: center;
  color: #64748b;
}

.prompt-content p {
  margin: 16px 0 24px 0;
  font-size: 14px;
}

.login-btn {
  padding: 12px 32px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}
</style>
