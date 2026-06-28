<template>
  <nav class="app-nav">
    <RouterLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item el-menu-item"
      :class="{ 'is-active': isActive(item.path) }"
    >
      <component :is="item.icon" :size="18" class="nav-icon" />
      <span class="nav-label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { Home, ShoppingCart, Search, Users, PersonStanding, PenTool, MessageCircle, User } from '@lucide/vue'

const router = useRouter()
const route = useRoute()

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/trade', label: '二手交易', icon: ShoppingCart },
  { path: '/lost-found', label: '失物招领', icon: Search },
  { path: '/group-buy', label: '拼单搭子', icon: Users },
  { path: '/errand', label: '跑腿委托', icon: PersonStanding },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
.app-nav {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-regular);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
}

.nav-item:hover {
  background: var(--color-bg-hover);
  color: var(--color-primary);
}

.nav-item.is-active {
  background: rgba(46, 125, 50, 0.08);
  color: var(--color-primary);
}

.nav-item.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.nav-icon {
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
}
</style>
