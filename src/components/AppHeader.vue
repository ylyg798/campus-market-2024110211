<template>
  <header class="app-header">
    <div class="header-content">
      <!-- 品牌区域 -->
      <div class="brand">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="logo-text">校园轻集市</span>
        </div>
        <span class="slogan">轻量、可信、面向校园生活</span>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <Search :size="18" class="search-icon" />
          <input
            type="text"
            placeholder="搜索商品、失物、拼单、跑腿..."
            class="search-input"
          />
          <kbd class="search-shortcut">⌘K</kbd>
        </div>
      </div>

      <!-- 导航菜单 -->
      <AppNav />

      <!-- 用户区域 -->
      <div class="user-area">
        <button class="notification-btn">
          <Bell :size="20" />
          <span class="notification-badge">3</span>
        </button>
        <button class="user-btn">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
            alt="用户头像"
            class="user-avatar"
          />
          <span class="user-name">张同学</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import AppNav from './AppNav.vue'
import { Search, Bell } from '@lucide/vue'
</script>

<style scoped>
.app-header {
  height: var(--layout-header-height);
  background: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  box-shadow: var(--shadow-sm);
}

.header-content {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: 0 var(--layout-content-padding);
  height: 100%;
  display: flex;
  align-items: center;
  gap: 32px;
}

/* 品牌区域 */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.logo-icon svg {
  width: 18px;
  height: 18px;
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.slogan {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  margin-left: 8px;
}

/* 搜索栏 */
.search-bar {
  flex: 1;
  max-width: 400px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.search-input-wrapper:hover {
  background: var(--color-bg-white);
  border-color: var(--color-text-placeholder);
}

.search-input-wrapper:focus-within {
  background: var(--color-bg-white);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.search-icon {
  color: var(--color-text-placeholder);
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.search-input::placeholder {
  color: var(--color-text-placeholder);
}

.search-shortcut {
  padding: 2px 6px;
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  font-family: var(--font-family-mono);
}

/* 用户区域 */
.user-area {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.notification-btn {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-base);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.notification-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  background: var(--color-danger);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #fff;
  font-weight: var(--font-weight-semibold);
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  background: var(--color-bg-base);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}

.user-btn:hover {
  background: var(--color-bg-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}
</style>
