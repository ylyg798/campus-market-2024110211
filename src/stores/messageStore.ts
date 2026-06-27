import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/config'

export interface Conversation {
  id: string
  userId: string
  otherPartyId: string
  otherParty: {
    id: string
    nickname: string
  }
  infoId: string
  infoTitle: string
  lastMessage: string
  lastMessageTime: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

export const useMessageStore = defineStore('message', () => {
  const conversations = ref<Conversation[]>([])
  const messages = ref<Message[]>([])
  const isLoading = ref(false)

  async function fetchConversations(userId: string) {
    isLoading.value = true
    try {
      const response = await api.get('/conversations', {
        params: { userId },
      })
      conversations.value = response.data
    } catch (error) {
      console.error('获取会话列表失败:', error)
      conversations.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMessages(conversationId: string) {
    isLoading.value = true
    try {
      const response = await api.get('/messages', {
        params: { conversationId },
      })
      messages.value = response.data
    } catch (error) {
      console.error('获取消息列表失败:', error)
      messages.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function createConversation(userId: string, otherPartyId: string, infoId: string, infoTitle: string) {
    isLoading.value = true
    try {
      await api.post('/conversations', {
        userId,
        otherPartyId,
        infoId,
        infoTitle,
        lastMessage: `您好，我对"${infoTitle}"感兴趣`,
        lastMessageTime: new Date().toISOString(),
      })
    } catch (error) {
      console.error('创建会话失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function sendMessage(conversationId: string, senderId: string, content: string) {
    isLoading.value = true
    try {
      const response = await api.post('/messages', {
        conversationId,
        senderId,
        content,
        createdAt: new Date().toISOString(),
      })
      messages.value.push(response.data)
    } catch (error) {
      console.error('发送消息失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  function generateBargainReply(offer: number, originalPrice: number) {
    const ratio = offer / originalPrice

    if (ratio >= 0.9) {
      return '这个价格可以接受，我们约个时间见面交易吧！'
    } else if (ratio >= 0.7) {
      return '价格有点低了，再加点怎么样？'
    } else if (ratio >= 0.5) {
      return '这个价格太低了，我没法接受。'
    } else {
      return '亲，这个价格实在太低了，建议您看看其他商品。'
    }
  }

  return {
    conversations,
    messages,
    isLoading,
    fetchConversations,
    fetchMessages,
    createConversation,
    sendMessage,
    generateBargainReply,
  }
})
