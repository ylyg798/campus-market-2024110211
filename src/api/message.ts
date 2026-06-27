import { api } from './config'
import type { Conversation, Message } from '@/types/message'

export const messageApi = {
  getConversations(userId: string): Promise<Conversation[]> {
    return api.get('/conversations', {
      params: {
        participants_like: userId,
      },
    })
  },

  getConversation(id: string): Promise<Conversation> {
    return api.get(`/conversations/${id}`)
  },

  createConversation(data: Omit<Conversation, 'id' | 'unreadCount' | 'updatedAt'>): Promise<Conversation> {
    return api.post('/conversations', {
      ...data,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    })
  },

  updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation> {
    return api.patch(`/conversations/${id}`, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  },

  getMessages(conversationId: string): Promise<Message[]> {
    return api.get('/messages', {
      params: {
        conversationId,
        _sort: 'createdAt',
        _order: 'asc',
      },
    })
  },

  createMessage(data: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    return api.post('/messages', {
      ...data,
      createdAt: new Date().toISOString(),
    })
  },

  markAsRead(conversationId: string): Promise<Conversation> {
    return api.patch(`/conversations/${conversationId}`, { unreadCount: 0 })
  },
}
