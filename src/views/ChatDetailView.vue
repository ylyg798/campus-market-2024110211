<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/messageStore'
import { useUserStore } from '@/stores/userStore'
import type { Message } from '@/types/message'
import { ArrowLeft, Send, MoreVertical, User, Image, Paperclip, Smile, Phone, Video } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()

const conversationId = computed(() => route.params.id as string)
const conversation = computed(() => messageStore.conversations.find(c => c.id === conversationId.value))
const messages = computed(() => messageStore.getMessages(conversationId.value))

const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const showMoreOptions = ref(false)

// 当前用户
const currentUser = computed(() => userStore.user)

// 对方信息
const otherParty = computed(() => conversation.value?.otherParty)

function goBack() {
  router.back()
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

async function sendMessage() {
  if (!messageInput.value.trim() || !conversationId.value) return
  
  const content = messageInput.value.trim()
  messageInput.value = ''
  
  await messageStore.sendMessage(conversationId.value, content, 'text')
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function isMyMessage(message: Message) {
  return message.senderId === currentUser.value?.id
}

async function fetchData() {
  if (userStore.user) {
    await messageStore.fetchConversations(userStore.user.id)
    if (conversationId.value) {
      scrollToBottom()
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="chat-page">
    <!-- 顶部导航 -->
    <header class="chat-header">
      <button class="back-btn" @click="goBack()">
        <ArrowLeft :size="20" />
      </button>
      
      <div class="header-info">
        <div class="avatar">
          <img v-if="otherParty?.avatar" :src="otherParty.avatar" :alt="otherParty.nickname" />
          <div v-else class="avatar-placeholder">
            <User :size="20" />
          </div>
        </div>
        <div class="user-info">
          <h3 class="user-name">{{ otherParty?.nickname || '用户' }}</h3>
          <span class="online-status" v-if="conversation?.otherPartyOnline">在线</span>
        </div>
      </div>
      
      <button class="more-btn" @click="showMoreOptions = !showMoreOptions">
        <MoreVertical :size="20" />
      </button>
      
      <!-- 更多选项菜单 -->
      <div v-if="showMoreOptions" class="more-menu">
        <button class="menu-item">
          <Phone :size="18" />
          <span>语音通话</span>
        </button>
        <button class="menu-item">
          <Video :size="18" />
          <span>视频通话</span>
        </button>
        <button class="menu-item">
          <User :size="18" />
          <span>查看资料</span>
        </button>
      </div>
    </header>

    <!-- 消息列表 -->
    <main class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-chat">
        <User :size="48" />
        <p>开始和 {{ otherParty?.nickname || '对方' }} 聊天吧</p>
      </div>

      <div v-else class="messages-list">
        <div 
          v-for="(msg, index) in messages" 
          :key="msg.id"
          class="message-item"
          :class="{ my-message: isMyMessage(msg) }"
        >
          <!-- 日期分隔 -->
          <div 
            v-if="index === 0 || formatDate(msg.createdAt) !== formatDate(messages[index - 1].createdAt)"
            class="date-separator"
          >
            {{ formatDate(msg.createdAt) }}
          </div>
          
          <!-- 消息内容 -->
          <div class="message-wrapper">
            <div v-if="!isMyMessage(msg)" class="message-avatar">
              <img v-if="otherParty?.avatar" :src="otherParty.avatar" />
              <div v-else class="avatar-placeholder">
                <User :size="16" />
              </div>
            </div>
            
            <div class="message-content">
              <div class="message-bubble" :class="{ mine: isMyMessage(msg) }">
                <p v-if="msg.type === 'text'">{{ msg.content }}</p>
                <img v-else-if="msg.type === 'image'" :src="msg.content" class="message-image" />
              </div>
              <span class="message-time">{{ formatTime(msg.createdAt) }}</span>
            </div>
            
            <div v-if="isMyMessage(msg)" class="message-avatar">
              <img v-if="currentUser?.avatar" :src="currentUser.avatar" />
              <div v-else class="avatar-placeholder">
                <User :size="16" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 输入区域 -->
    <footer class="input-area">
      <div class="input-tools">
        <button class="tool-btn">
          <Image :size="20" />
        </button>
        <button class="tool-btn">
          <Paperclip :size="20" />
        </button>
        <button class="tool-btn">
          <Smile :size="20" />
        </button>
      </div>
      
      <div class="input-box">
        <input 
          v-model="messageInput"
          type="text"
          placeholder="输入消息..."
          class="message-input"
          @keyup.enter="sendMessage"
        />
        <button 
          class="send-btn" 
          :disabled="!messageInput.trim()"
          @click="sendMessage"
        >
          <Send :size="20" />
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

/* 顶部导航 */
.chat-header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.back-btn, .more-btn {
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
}

.header-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
}

.avatar img {
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
  color: #94a3b8;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.online-status {
  font-size: 12px;
  color: #10b981;
}

.more-menu {
  position: absolute;
  top: 56px;
  right: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px;
  z-index: 100;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  width: 100%;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
}

.menu-item:hover {
  background: #f8fafc;
}

/* 消息列表 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
}

.empty-chat p {
  margin-top: 16px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  flex-direction: column;
}

.date-separator {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  margin: 8px 0;
}

.message-wrapper {
  display: flex;
  gap: 8px;
}

.my-message .message-wrapper {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.my-message .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 12px 16px;
  background: #fff;
  border-radius: 16px;
  word-break: break-word;
}

.message-bubble.mine {
  background: #3b82f6;
  color: #fff;
}

.message-bubble p {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
}

.message-image {
  max-width: 200px;
  border-radius: 8px;
}

.message-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

/* 输入区域 */
.input-area {
  background: #fff;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
}

.input-tools {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tool-btn {
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
}

.input-box {
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
}

.send-btn {
  width: 48px;
  height: 48px;
  background: #3b82f6;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
}

.send-btn:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}
</style>