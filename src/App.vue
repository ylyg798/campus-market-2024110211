<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.user)

onMounted(() => {
  userStore.loadUser()
})

const navItems = [
  { path: '/home', label: '首页', icon: '🏠' },
  { path: '/list', label: '列表', icon: '📋' },
  { path: '/board', label: '看板', icon: '📊' },
  { path: '/publish', label: '发布', icon: '✏️' },
  { path: '/message', label: '消息', icon: '💬' },
  { path: '/profile', label: '我的', icon: '👤' },
]
</script>

<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <nav v-if="isLoggedIn" class="top-nav">
      <div class="nav-container">
        <div class="nav-logo">
          <span class="logo-text">校园轻集市</span>
        </div>

        <div class="nav-links">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            :class="{ active: router.currentRoute.value.path === item.path }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- 路由视图 -->
    <RouterView />

    <!-- 页脚 -->
    <footer v-if="isLoggedIn" class="page-footer">
      <div class="footer-content">
        <p class="footer-text">© 2024 校园轻集市 - Day2 多页面骨架系统</p>
      </div>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  color: #1e293b;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}

.top-nav {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 16px 20px;
  color: #fff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.nav-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 14px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.3);
  font-weight: 600;
}

.nav-icon {
  font-size: 16px;
}

.nav-label {
  font-size: 13px;
}

.page-footer {
  background: #fff;
  padding: 20px;
  border-top: 1px solid #f1f5f9;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
}

.footer-content {
  text-align: center;
}

.footer-text {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}
</style>
