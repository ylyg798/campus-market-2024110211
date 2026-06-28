<template>
  <nav class="app-nav">
    <RouterLink 
      v-for="item in navItems" 
      :key="item.path" 
      :to="item.path" 
      class="nav-item" 
      :class="{ active: router.currentRoute.value.path === item.path }"
    >
      <component :is="item.icon" :size="18" />
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Home, ShoppingCart, Search, Users, PersonStanding, PenTool, MessageCircle, User } from '@lucide/vue'

const router = useRouter()

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/trade', label: '二手交易', icon: ShoppingCart },
  { path: '/lost-found', label: '失物招领', icon: Search },
  { path: '/group-buy', label: '拼单搭子', icon: Users },
  { path: '/errand', label: '跑腿委托', icon: PersonStanding },
  { path: '/publish', label: '发布', icon: PenTool },
  { path: '/message', label: '消息', icon: MessageCircle },
  { path: '/user', label: '个人中心', icon: User },
]
</script>

<style scoped>
.app-nav {
  display: flex;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #374151;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f3f4f6;
}

.nav-item.active {
  background: #3b82f6;
  color: #fff;
}
</style>