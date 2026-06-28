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
  <div class="messages-page">
    <header class="messages-header">
      <div class="header-content">
        <button class="back-btn" @click="router.back()">
          <span>←</span>
        </button>
        <h1>消息</h1>
        <div class="header-actions"></div>
      </div>
    </header>

    <main class="messages-main">
      <div v-if="messageStore.isLoading" class="loading-state">
        <p>加载中...</p>
      </div>

      <div v-else-if="conversations.length === 0" class="empty-state">
        <span class="empty-icon">💬</span>
        <p>暂无消息</p>
      </div>

      <div v-else class="conversation-list">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="conversation-item"
          @click="goToChat(conv.id)"
        >
          <div class="conv-avatar">
            <span>👤</span>
          </div>
          <div class="conv-content">
            <div class="conv-header">
              <span class="conv-name">{{ conv.otherParty.nickname }}</span>
              <span class="conv-time">{{ formatTime(conv.lastMessageTime) }}</span>
            </div>
            <div class="conv-preview">
              <span>{{ conv.lastMessage }}</span>
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
      <button class="nav-item" @click="router.push('/market')">
        <span class="nav-icon">🛒</span>
        <span class="nav-label">集市</span>
      </button>
      <button class="nav-item publish-btn" @click="router.push('/publish')">
        <span class="nav-icon">+</span>
      </button>
      <button class="nav-item active" @click="router.push('/messages')">
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
.messages-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
}

.messages-header {
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

.messages-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.messages-main {
  padding: 16px;
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

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conversation-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
}

.conv-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.conv-content {
  flex: 1;
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.conv-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.conv-time {
  font-size: 12px;
  color: #94a3b8;
}

.conv-preview {
  font-size: 14px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
