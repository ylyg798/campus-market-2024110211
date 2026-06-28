<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/messageStore'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()

const conversations = ref<any[]>([])

onMounted(() => {
  if (userStore.user) {
    messageStore.fetchConversations(userStore.user.id)
    conversations.value = messageStore.conversations
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

function goToChat(conversationId: string) {
  router.push(`/messages/${conversationId}`)
}
</script>

<template>
  <div class="message-page">
    <header class="message-header">
      <div class="header-content">
        <button class="back-btn" @click="router.back()">
          <span>←</span>
        </button>
        <h1>消息</h1>
        <div class="header-actions"></div>
      </div>
    </header>

    <main class="message-main">
      <div v-if="messageStore.isLoading" class="loading-state">
        <p>加载中...</p>
      </div>
      <div v-else-if="messageStore.conversations.length === 0" class="empty-state">
        <span class="empty-icon">💬</span>
        <p>暂无消息</p>
      </div>
      <div v-else class="conversation-list">
        <div
          v-for="conv in messageStore.conversations"
          :key="conv.id"
          class="conversation-item"
          @click="goToChat(conv.id)"
        >
          <div class="conv-avatar">
            <span>👤</span>
          </div>
          <div class="conv-info">
            <div class="conv-name">{{ conv.otherParty?.nickname || '未知用户' }}</div>
            <div class="conv-preview">{{ conv.lastMessage || '暂无消息' }}</div>
          </div>
          <div class="conv-time">{{ formatTime(conv.lastMessageTime || '') }}</div>
        </div>
      </div>
    </main>

    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/')">
        <span>🏠</span>
        <span>首页</span>
      </button>
      <button class="nav-item" @click="router.push('/list')">
        <span>📋</span>
        <span>列表</span>
      </button>
      <button class="nav-item publish-btn" @click="router.push('/publish')">
        <span>+</span>
      </button>
      <button class="nav-item active" @click="router.push('/message')">
        <span>💬</span>
        <span>消息</span>
      </button>
      <button class="nav-item" @click="router.push('/profile')">
        <span>👤</span>
        <span>我的</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.message-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.message-header {
  background: #fff;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
}

.message-header h1 {
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.message-main {
  padding: 16px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conversation-item {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border: 1px solid #eee;
}

.conversation-item:hover {
  border-color: #10b981;
}

.conv-avatar {
  width: 48px;
  height: 48px;
  background: #f0fdf4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.conv-info {
  flex: 1;
}

.conv-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.conv-preview {
  font-size: 13px;
  color: #999;
}

.conv-time {
  font-size: 12px;
  color: #999;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 8px 0;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #eee;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 12px;
  font-size: 10px;
  color: #666;
}

.nav-item.active {
  color: #10b981;
}

.nav-item span:first-child {
  font-size: 20px;
}

.nav-item.publish-btn {
  background: #10b981;
  color: #fff;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-top: -10px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
</style>
