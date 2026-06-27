export type MessageType = 'text' | 'bargain'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: MessageType
  createdAt: string
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage: Message | null
  unreadCount: number
  relatedInfoId: string
  relatedInfoTitle: string
  updatedAt: string
}
