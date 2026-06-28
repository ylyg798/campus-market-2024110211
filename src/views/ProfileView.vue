<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useFavoriteStore } from '@/stores/favoriteStore'

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

const activeTab = ref<'profile' | 'favorites' | 'history'>('profile')

const user = computed(() => userStore.user)

const menuItems = [
  { icon: '📦', label: '我的发布', path: '/profile/publish' },
  { icon: '❤️', label: '我的收藏', path: '/profile/favorites' },
  { icon: '📋', label: '交易记录', path: '/profile/history' },
  { icon: '⚙️', label: '设置', path: '/profile/settings' },
]

function logout() {
  userStore.logout()
  router.push('/setup')
}

function goToPage(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="header-bg"></div>
      <div class="profile-info">
        <div class="avatar">
          <span>👤</span>
        </div>
        <div class="user-info">
          <h2 class="nickname">{{ user?.nickname || '未登录' }}</h2>
          <p class="college">{{ user?.college }} · {{ user?.campus }}</p>
        </div>
      </div>
      <div class="credit-section">
        <div class="credit-card">
          <div class="credit-icon">⭐</div>
          <div class="credit-info">
            <span class="credit-label">信用分</span>
            <span class="credit-value">{{ user?.creditScore || 100 }}</span>
          </div>
        </div>
      </div>
    </header>

    <main class="profile-main">
      <div class="menu-section">
        <div class="menu-grid">
          <button
            v-for="item in menuItems"
            :key="item.label"
            class="menu-item"
            @click="goToPage(item.path)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-label">{{ item.label }}</span>
          </button>
        </div>
      </div>

      <div class="action-section">
        <button class="logout-btn" @click="logout()">
          退出登录
        </button>
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
      <button class="nav-item active" @click="router.push('/profile')">
        <span class="nav-icon">👤</span>
        <span class="nav-label">我的</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
}

.profile-header {
  position: relative;
  padding-bottom: 20px;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.profile-info {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 120px 20px 20px;
  background: #fff;
  border-radius: 0 0 20px 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.nickname {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.college {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.credit-section {
  padding: 0 20px;
  margin-top: -10px;
}

.credit-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.credit-icon {
  font-size: 32px;
}

.credit-info {
  display: flex;
  flex-direction: column;
}

.credit-label {
  font-size: 12px;
  color: #94a3b8;
}

.credit-value {
  font-size: 24px;
  font-weight: 700;
  color: #f59e0b;
}

.profile-main {
  padding: 20px;
}

.menu-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

.menu-icon {
  font-size: 28px;
}

.menu-label {
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}

.action-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background: #fef2f2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
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

.nav-item.active .nav-label {
  color: #10b981;
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
