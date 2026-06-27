# 校园轻集市 - 代码实现规划

## 一、数据模型定义

### 1.1 用户数据模型

**文件路径**: `src/types/user.ts`

```typescript
export interface User {
  id: string
  nickname: string
  college: string
  campus: string
  role: 'student' | 'teacher' | 'staff'
  creditScore: number
  createdAt: string
}

export interface UserProfile {
  user: User | null
  isLoggedIn: boolean
}
```

### 1.2 集市信息数据模型

**文件路径**: `src/types/market.ts`

```typescript
export type InfoType = 'secondhand' | 'lostfound' | 'groupbuy' | 'errand'
export type InfoStatus = 'active' | 'completed' | 'closed' | 'claimed' | 'found'

export interface Publisher {
  id: string
  nickname: string
  avatar?: string
}

export interface MarketInfo {
  id: string
  type: InfoType
  title: string
  campus: string
  location: string
  description: string
  tags: string[]
  images: string[]
  status: InfoStatus
  publisher: Publisher
  createdAt: string
  viewCount: number
  favoriteCount: number
  
  price?: number
  quality?: 'new' | 'like-new' | 'good' | 'fair' | 'poor'
  
  lostFoundType?: 'lost' | 'found'
  itemFeatures?: string
  
  targetCount?: number
  currentCount?: number
  deadline?: string
  
  taskContent?: string
  expectedTime?: string
  reward?: number
}

export interface FilterOptions {
  type?: InfoType
  campus?: string
  status?: InfoStatus
  keyword?: string
}

export interface SortOptions {
  field: 'createdAt' | 'viewCount' | 'price' | 'favoriteCount'
  order: 'asc' | 'desc'
}
```

### 1.3 消息数据模型

**文件路径**: `src/types/message.ts`

```typescript
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
```

### 1.4 收藏数据模型

**文件路径**: `src/types/favorite.ts`

```typescript
export interface FavoriteItem {
  infoId: string
  infoType: string
  infoTitle: string
  createdAt: string
}
```

---

## 二、API 接口设计

### 2.1 接口基础配置

**文件路径**: `src/api/config.ts`

```typescript
import axios from 'axios'

export const BASE_URL = '/api'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)
```

### 2.2 用户接口

**文件路径**: `src/api/user.ts`

```typescript
import { api } from './config'
import type { User } from '@/types/user'

export const userApi = {
  createUser(userData: Omit<User, 'id' | 'creditScore' | 'createdAt'>): Promise<User> {
    return api.post('/users', {
      ...userData,
      creditScore: Math.floor(Math.random() * 100) + 800,
      createdAt: new Date().toISOString(),
    })
  },
  
  getUser(userId: string): Promise<User> {
    return api.get(`/users/${userId}`)
  },
  
  updateUser(userId: string, data: Partial<User>): Promise<User> {
    return api.patch(`/users/${userId}`, data)
  },
}
```

### 2.3 集市信息接口

**文件路径**: `src/api/market.ts`

```typescript
import { api } from './config'
import type { MarketInfo, FilterOptions, SortOptions } from '@/types/market'

export const marketApi = {
  getMarketList(
    filters?: FilterOptions,
    sort?: SortOptions
  ): Promise<MarketInfo[]> {
    const params: Record<string, string> = {}
    
    if (filters?.type) params.type = filters.type
    if (filters?.campus) params.campus = filters.campus
    if (filters?.status) params.status = filters.status
    if (filters?.keyword) params.q = filters.keyword
    
    if (sort) {
      params._sort = sort.field
      params._order = sort.order
    }
    
    return api.get('/market', { params })
  },
  
  getMarketInfo(id: string): Promise<MarketInfo> {
    return api.get(`/market/${id}`)
  },
  
  createMarketInfo(data: Omit<MarketInfo, 'id' | 'createdAt' | 'viewCount' | 'favoriteCount'>): Promise<MarketInfo> {
    return api.post('/market', {
      ...data,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      favoriteCount: 0,
    })
  },
  
  updateMarketInfo(id: string, data: Partial<MarketInfo>): Promise<MarketInfo> {
    return api.patch(`/market/${id}`, data)
  },
  
  deleteMarketInfo(id: string): Promise<void> {
    return api.delete(`/market/${id}`)
  },
  
  incrementViewCount(id: string): Promise<MarketInfo> {
    return api.patch(`/market/${id}`, { viewCount: api.patch.increment })
  },
}
```

### 2.4 消息接口

**文件路径**: `src/api/message.ts`

```typescript
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
```

### 2.5 收藏接口

**文件路径**: `src/api/favorite.ts`

```typescript
import { api } from './config'
import type { FavoriteItem } from '@/types/favorite'

export const favoriteApi = {
  getFavorites(userId: string): Promise<FavoriteItem[]> {
    return api.get('/favorites', {
      params: { userId },
    })
  },
  
  addFavorite(data: Omit<FavoriteItem, 'id' | 'createdAt'> & { userId: string }): Promise<FavoriteItem> {
    return api.post('/favorites', {
      ...data,
      createdAt: new Date().toISOString(),
    })
  },
  
  removeFavorite(userId: string, infoId: string): Promise<void> {
    return api.delete('/favorites', {
      params: { userId, infoId },
    })
  },
  
  checkFavorite(userId: string, infoId: string): Promise<boolean> {
    return api.get('/favorites', {
      params: { userId, infoId },
    }).then((items) => items.length > 0)
  },
}
```

---

## 三、Store 状态管理

### 3.1 用户状态

**文件路径**: `src/stores/userStore.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'
import { userApi } from '@/api/user'

const STORAGE_KEY = 'campus_market_user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  
  const isLoggedIn = computed(() => !!user.value)
  
  function loadUser() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        user.value = JSON.parse(stored)
      } catch {
        user.value = null
      }
    }
  }
  
  async function createUser(userData: Omit<User, 'id' | 'creditScore' | 'createdAt'>) {
    const result = await userApi.createUser(userData)
    user.value = result
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
    return result
  }
  
  function logout() {
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }
  
  return {
    user,
    isLoggedIn,
    loadUser,
    createUser,
    logout,
  }
})
```

### 3.2 集市信息状态

**文件路径**: `src/stores/marketStore.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MarketInfo, FilterOptions, SortOptions } from '@/types/market'
import { marketApi } from '@/api/market'

export const useMarketStore = defineStore('market', () => {
  const infoList = ref<MarketInfo[]>([])
  const currentFilter = ref<FilterOptions>({})
  const currentSort = ref<SortOptions>({ field: 'createdAt', order: 'desc' })
  const isLoading = ref(false)
  const currentInfo = ref<MarketInfo | null>(null)
  
  const filteredList = computed(() => {
    let list = [...infoList.value]
    
    if (currentFilter.value.type) {
      list = list.filter(item => item.type === currentFilter.value.type)
    }
    if (currentFilter.value.campus) {
      list = list.filter(item => item.campus === currentFilter.value.campus)
    }
    if (currentFilter.value.status) {
      list = list.filter(item => item.status === currentFilter.value.status)
    }
    if (currentFilter.value.keyword) {
      const kw = currentFilter.value.keyword.toLowerCase()
      list = list.filter(item => 
        item.title.toLowerCase().includes(kw) ||
        item.description.toLowerCase().includes(kw)
      )
    }
    
    list.sort((a, b) => {
      const field = currentSort.value.field
      const order = currentSort.value.order === 'asc' ? 1 : -1
      
      if (field === 'price') {
        return ((a.price || 0) - (b.price || 0)) * order
      }
      if (field === 'viewCount') {
        return (a.viewCount - b.viewCount) * order
      }
      if (field === 'favoriteCount') {
        return (a.favoriteCount - b.favoriteCount) * order
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    
    return list
  })
  
  async function fetchMarketList() {
    isLoading.value = true
    try {
      infoList.value = await marketApi.getMarketList(currentFilter.value, currentSort.value)
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchMarketInfo(id: string) {
    isLoading.value = true
    try {
      currentInfo.value = await marketApi.getMarketInfo(id)
    } finally {
      isLoading.value = false
    }
  }
  
  async function createMarketInfo(data: Omit<MarketInfo, 'id' | 'createdAt' | 'viewCount' | 'favoriteCount'>) {
    const result = await marketApi.createMarketInfo(data)
    infoList.value.unshift(result)
    return result
  }
  
  async function updateMarketInfo(id: string, data: Partial<MarketInfo>) {
    const result = await marketApi.updateMarketInfo(id, data)
    const index = infoList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      infoList.value[index] = result
    }
    if (currentInfo.value?.id === id) {
      currentInfo.value = result
    }
    return result
  }
  
  function setFilter(filter: Partial<FilterOptions>) {
    currentFilter.value = { ...currentFilter.value, ...filter }
  }
  
  function setSort(sort: SortOptions) {
    currentSort.value = sort
  }
  
  return {
    infoList,
    filteredList,
    currentFilter,
    currentSort,
    isLoading,
    currentInfo,
    fetchMarketList,
    fetchMarketInfo,
    createMarketInfo,
    updateMarketInfo,
    setFilter,
    setSort,
  }
})
```

### 3.3 收藏状态

**文件路径**: `src/stores/favoriteStore.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FavoriteItem } from '@/types/favorite'
import { favoriteApi } from '@/api/favorite'
import { useUserStore } from './userStore'

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref<FavoriteItem[]>([])
  
  const userStore = useUserStore()
  
  const favoriteIds = computed(() => favorites.value.map(item => item.infoId))
  
  function isFavorite(infoId: string) {
    return favoriteIds.value.includes(infoId)
  }
  
  async function fetchFavorites() {
    if (!userStore.user) return
    favorites.value = await favoriteApi.getFavorites(userStore.user.id)
  }
  
  async function toggleFavorite(infoId: string, infoType: string, infoTitle: string) {
    if (!userStore.user) return
    
    const exists = favorites.value.find(item => item.infoId === infoId)
    
    if (exists) {
      await favoriteApi.removeFavorite(userStore.user.id, infoId)
      favorites.value = favorites.value.filter(item => item.infoId !== infoId)
    } else {
      const result = await favoriteApi.addFavorite({
        userId: userStore.user.id,
        infoId,
        infoType,
        infoTitle,
      })
      favorites.value.push(result)
    }
  }
  
  return {
    favorites,
    favoriteIds,
    isFavorite,
    fetchFavorites,
    toggleFavorite,
  }
})
```

### 3.4 消息状态

**文件路径**: `src/stores/messageStore.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Conversation, Message } from '@/types/message'
import { messageApi } from '@/api/message'
import { useUserStore } from './userStore'

export const useMessageStore = defineStore('message', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  
  const userStore = useUserStore()
  
  const totalUnread = computed(() => {
    return conversations.value.reduce((sum, conv) => sum + conv.unreadCount, 0)
  })
  
  async function fetchConversations() {
    if (!userStore.user) return
    isLoading.value = true
    try {
      conversations.value = await messageApi.getConversations(userStore.user.id)
    } finally {
      isLoading.value = false
    }
  }
  
  async function fetchMessages(conversationId: string) {
    isLoading.value = true
    try {
      messages.value = await messageApi.getMessages(conversationId)
      await messageApi.markAsRead(conversationId)
      
      const convIndex = conversations.value.findIndex(c => c.id === conversationId)
      if (convIndex !== -1) {
        conversations.value[convIndex].unreadCount = 0
      }
    } finally {
      isLoading.value = false
    }
  }
  
  async function sendMessage(conversationId: string, content: string, type: 'text' | 'bargain' = 'text') {
    if (!userStore.user) return
    
    const message = await messageApi.createMessage({
      conversationId,
      senderId: userStore.user.id,
      content,
      type,
    })
    
    messages.value.push(message)
    
    const convIndex = conversations.value.findIndex(c => c.id === conversationId)
    if (convIndex !== -1) {
      conversations.value[convIndex].lastMessage = message
      conversations.value[convIndex].updatedAt = message.createdAt
    }
    
    return message
  }
  
  async function createConversation(
    otherUserId: string,
    relatedInfoId: string,
    relatedInfoTitle: string
  ) {
    if (!userStore.user) return null
    
    const existing = conversations.value.find(c => 
      c.participants.includes(otherUserId) && 
      c.relatedInfoId === relatedInfoId
    )
    
    if (existing) {
      currentConversation.value = existing
      await fetchMessages(existing.id)
      return existing
    }
    
    const conversation = await messageApi.createConversation({
      participants: [userStore.user.id, otherUserId],
      lastMessage: null,
      relatedInfoId,
      relatedInfoTitle,
    })
    
    conversations.value.unshift(conversation)
    currentConversation.value = conversation
    messages.value = []
    
    return conversation
  }
  
  function generateAutoReply(message: string): string {
    const replies = [
      '好的，我考虑一下',
      '可以，具体什么时候方便？',
      '好的，在哪里交易？',
      '嗯嗯，我知道了',
      '这个我需要确认一下',
      '没问题，随时联系',
      '谢谢你的关注',
      '我再看看吧',
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  function generateBargainReply(offer: number, price: number): string {
    const ratio = offer / price
    if (ratio >= 0.9) return `这个价格差不多，成交！`
    if (ratio >= 0.8) return `可以便宜一点，${Math.floor(price * 0.85)}元怎么样？`
    if (ratio >= 0.6) return `这个价格有点低了，最少${Math.floor(price * 0.75)}元`
    if (ratio >= 0.4) return `真的不能这么低，最多便宜到${Math.floor(price * 0.7)}元`
    return `这个价格我不卖，太低了`
  }
  
  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    totalUnread,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    generateAutoReply,
    generateBargainReply,
  }
})
```

---

## 四、路由配置

**文件路径**: `src/router/index.ts`

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/setup',
      name: 'setup',
      component: () => import('@/views/SetupView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/market',
      name: 'market',
      component: () => import('@/views/MarketView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: () => import('@/views/DetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('@/views/PublishView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('@/views/MessagesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/trends',
      name: 'trends',
      component: () => import('@/views/TrendsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (!userStore.user) {
    userStore.loadUser()
  }
  
  if (to.meta.requiresAuth && !userStore.user) {
    next('/setup')
  } else if (to.path === '/setup' && userStore.user) {
    next('/')
  } else {
    next()
  }
})

export default router
```

---

## 五、页面组件实现规划

### 5.1 身份创建页

**文件路径**: `src/views/SetupView.vue`

```typescript
// 组件结构
// 1. 标题区域
// 2. 表单区域（昵称、学院、校区、身份角色）
// 3. 提交按钮
// 4. 表单校验逻辑
// 5. 成功后跳转首页
```

### 5.2 今日集市首页

**文件路径**: `src/views/HomeView.vue`

```typescript
// 组件结构
// 1. 欢迎信息区（用户昵称、信用分）
// 2. 快捷入口区（四大类型卡片）
// 3. 最新信息区（横向滚动列表）
// 4. 热门信息区（卡片列表）
// 5. 统计数据卡片（收藏数、未读消息数）
// 6. 安全提醒组件
// 7. 底部导航入口
```

### 5.3 集市信息列表页

**文件路径**: `src/views/MarketView.vue`

```typescript
// 组件结构
// 1. 搜索栏组件
// 2. 筛选栏组件
//    - 类型筛选（二手/失物招领/拼单/跑腿）
//    - 校区筛选
//    - 状态筛选
// 3. 排序控件
// 4. 信息卡片列表
//    - 图片展示
//    - 标题、标签
//    - 价格（二手）、人数（拼单）、酬劳（跑腿）
//    - 发布时间、校区
//    - 收藏按钮
// 5. 加载状态
// 6. 空数据提示
```

### 5.4 信息详情页

**文件路径**: `src/views/DetailView.vue`

```typescript
// 组件结构
// 1. 返回按钮
// 2. 图片展示区
// 3. 基础信息区
//    - 标题、标签
//    - 类型、状态、校区
//    - 发布人信息
//    - 发布时间、浏览量
// 4. 详情描述区
// 5. 类型专属区
//    - 二手：价格、成色、砍价入口
//    - 失物招领：丢失/拾获、地点、时间、特征
//    - 拼单：目标人数、当前人数、截止时间
//    - 跑腿：任务内容、地点、期望时间、酬劳
// 6. 操作按钮区
//    - 收藏按钮
//    - 联系发布者按钮
// 7. 安全提醒
```

### 5.5 信息发布页

**文件路径**: `src/views/PublishView.vue`

```typescript
// 组件结构
// 1. 返回按钮
// 2. 类型选择器（横向卡片选择）
// 3. 通用表单区
//    - 标题输入
//    - 校区选择
//    - 地点输入
//    - 描述文本框
//    - 标签输入
// 4. 类型专属表单区
//    - 二手：价格、成色、图片上传
//    - 失物招领：丢失/拾获类型、地点、时间、特征
//    - 拼单：目标人数、当前人数、截止时间
//    - 跑腿：任务内容、地点、期望时间、酬劳
// 5. 表单校验提示
// 6. 提交按钮
```

### 5.6 消息中心页

**文件路径**: `src/views/MessagesView.vue`

```typescript
// 组件结构
// 左侧：会话列表
//   - 会话头像（发布者）
//   - 会话标题（信息标题）
//   - 最后一条消息预览
//   - 未读数量标记
//   - 时间戳
// 
// 右侧/下方：聊天窗口
//   - 消息列表
//     - 自己发送的消息（右侧）
//     - 对方消息（左侧）
//     - 砍价消息（特殊样式）
//   - 输入框
//   - 发送按钮
//   - 模拟回复按钮（可选）
```

### 5.7 个人中心页

**文件路径**: `src/views/ProfileView.vue`

```typescript
// 组件结构
// 1. 用户信息卡片
//    - 昵称、头像
//    - 学院、校区、身份
//    - 信用分
//    - 编辑按钮
// 2. 统计数据
//    - 发布数量、收藏数量
// 3. 功能菜单
//    - 我的发布
//    - 我的收藏
//    - 我的消息
//    - 趋势看板
//    - 数据管理（可选）
//    - 退出登录
// 4. 我的发布列表（可展开）
//    - 信息卡片
//    - 状态更新按钮
// 5. 我的收藏列表（可展开）
```

### 5.8 趋势看板页

**文件路径**: `src/views/TrendsView.vue`

```typescript
// 组件结构
// 1. 信息类型占比图（饼图）
// 2. 校区分布图（柱状图）
// 3. 状态统计图（堆叠柱状图）
// 4. 热门信息排行（横向柱状图/TOP10）
// 5. 最近发布趋势（折线图）
// 6. 数据刷新按钮
```

---

## 六、公共组件实现规划

### 6.1 布局组件

**文件路径**: `src/components/layout/AppHeader.vue`

```typescript
// 功能：顶部导航栏
// - Logo
// - 标题
// - 返回按钮（详情页）
// - 搜索入口
// - 消息入口（带未读标记）
```

**文件路径**: `src/components/layout/AppFooter.vue`

```typescript
// 功能：底部信息栏
// - 版权信息
// - 安全提示链接
```

**文件路径**: `src/components/layout/AppTabbar.vue`

```typescript
// 功能：移动端底部标签栏
// - 首页
// - 集市
// - 发布
// - 消息
// - 个人中心
```

### 6.2 通用组件

**文件路径**: `src/components/common/InfoCard.vue`

```typescript
// 功能：信息卡片
// - 图片（缩略图）
// - 标题
// - 标签
// - 价格/人数/酬劳
// - 发布时间、校区
// - 收藏按钮
// - 点击跳转详情
```

**文件路径**: `src/components/common/FilterBar.vue`

```typescript
// 功能：筛选栏
// - 类型筛选（多选标签）
// - 校区筛选（下拉选择）
// - 状态筛选（下拉选择）
// - 排序选择
```

**文件路径**: `src/components/common/SearchBar.vue`

```typescript
// 功能：搜索栏
// - 输入框
// - 搜索图标
// - 清除按钮
// - 防抖搜索
```

**文件路径**: `src/components/common/EmptyState.vue`

```typescript
// 功能：空数据状态
// - 图标
// - 提示文字
// - 操作按钮（返回、刷新等）
```

**文件路径**: `src/components/common/SafetyTips.vue`

```typescript
// 功能：安全提醒
// - 提醒图标
// - 提醒内容（公共地点交易、验真、隐私保护、警惕异常）
// - 关闭按钮
```

**文件路径**: `src/components/common/StatCard.vue`

```typescript
// 功能：统计卡片
// - 图标
// - 数值
// - 标签
// - 颜色主题
```

### 6.3 详情页组件

**文件路径**: `src/components/detail/SecondHandDetail.vue`

```typescript
// 功能：二手交易详情
// - 价格展示
// - 成色标签
// - 砍价弹窗入口
```

**文件路径**: `src/components/detail/LostFoundDetail.vue`

```typescript
// 功能：失物招领详情
// - 丢失/拾获标记
// - 地点时间
// - 物品特征
```

**文件路径**: `src/components/detail/GroupBuyDetail.vue`

```typescript
// 功能：拼单搭子详情
// - 人数进度条
// - 截止时间倒计时
```

**文件路径**: `src/components/detail/ErrandDetail.vue`

```typescript
// 功能：跑腿委托详情
// - 任务内容
// - 地点地图占位
// - 期望时间
// - 酬劳展示
```

### 6.4 发布表单组件

**文件路径**: `src/components/publish/PublishForm.vue`

```typescript
// 功能：发布表单容器
// - 类型选择器
// - 动态表单组件
// - 表单校验
// - 提交逻辑
```

**文件路径**: `src/components/publish/SecondHandForm.vue`

```typescript
// 功能：二手交易表单
// - 价格输入
// - 成色选择
// - 图片上传/预设
```

**文件路径**: `src/components/publish/LostFoundForm.vue`

```typescript
// 功能：失物招领表单
// - 丢失/拾获类型选择
// - 地点输入
// - 时间选择
// - 物品特征描述
```

**文件路径**: `src/components/publish/GroupBuyForm.vue`

```typescript
// 功能：拼单搭子表单
// - 目标人数输入
// - 当前人数输入
// - 截止时间选择
```

**文件路径**: `src/components/publish/ErrandForm.vue`

```typescript
// 功能：跑腿委托表单
// - 任务内容描述
// - 任务地点输入
// - 期望完成时间选择
// - 酬劳输入
```

### 6.5 消息组件

**文件路径**: `src/components/message/ConversationList.vue`

```typescript
// 功能：会话列表
// - 会话项渲染
// - 未读标记
// - 点击切换会话
```

**文件路径**: `src/components/message/ChatWindow.vue`

```typescript
// 功能：聊天窗口
// - 消息列表渲染
// - 消息气泡样式
// - 滚动到底部
```

**文件路径**: `src/components/message/ChatInput.vue`

```typescript
// 功能：消息输入框
// - 文本输入
// - 发送按钮
// - 回车发送
```

---

## 七、样式规划

### 7.1 全局样式

**文件路径**: `src/style.css`

```typescript
// 全局样式配置
// - CSS 变量（主题色、字体、间距）
// - 基础重置样式
// - 通用布局类
// - 响应式断点
```

### 7.2 主题变量

```css
:root {
  --primary-color: #4f46e5;
  --primary-light: #6366f1;
  --primary-dark: #4338ca;
  
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #3b82f6;
  
  --bg-color: #f8fafc;
  --card-bg: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  
  --font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
}
```

---

## 八、Mock 数据配置

### 8.1 JSON Server 配置

**文件路径**: `mock/db.json`

```json
{
  "users": [],
  "market": [],
  "conversations": [],
  "messages": [],
  "favorites": []
}
```

**文件路径**: `mock/server.js`

```javascript
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('mock/db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use('/api', router)
server.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000')
})
```

### 8.2 示例数据生成

**文件路径**: `mock/generateData.js`

```javascript
// 生成示例数据的脚本
// - 用户数据
// - 集市信息数据（二手、失物招领、拼单、跑腿）
// - 消息数据
// - 收藏数据
```

---

## 九、项目配置补充

### 9.1 Vite 代理配置

**文件路径**: `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

### 9.2 package.json 脚本

**文件路径**: `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "run-p type-check \"build-only {@}\" --",
    "preview": "vite preview",
    "build-only": "vite build",
    "type-check": "vue-tsc --build",
    "lint": "run-s \"lint:*\"",
    "lint:oxlint": "oxlint . --fix",
    "lint:eslint": "eslint . --fix --cache",
    "mock": "node mock/server.js",
    "dev:mock": "concurrently \"npm run dev\" \"npm run mock\""
  }
}
```

---

## 十、开发检查清单

### 阶段一：基础框架

- [ ] 创建类型定义文件
- [ ] 配置 API 接口
- [ ] 创建 Pinia Store
- [ ] 配置路由和守卫
- [ ] 设置全局样式
- [ ] 配置 Mock 服务器

### 阶段二：身份与首页

- [ ] 实现身份创建页
- [ ] 实现首页组件
- [ ] 实现快捷入口卡片
- [ ] 实现安全提醒组件

### 阶段三：信息浏览

- [ ] 实现集市列表页
- [ ] 实现搜索栏组件
- [ ] 实现筛选栏组件
- [ ] 实现信息卡片组件
- [ ] 实现详情页组件
- [ ] 实现发布页组件

### 阶段四：收藏与消息

- [ ] 实现收藏功能
- [ ] 实现模拟砍价
- [ ] 实现消息中心
- [ ] 实现会话列表
- [ ] 实现聊天窗口

### 阶段五：个人中心与看板

- [ ] 实现个人中心页
- [ ] 实现用户信息卡片
- [ ] 实现我的发布列表
- [ ] 实现我的收藏列表
- [ ] 实现趋势看板页
- [ ] 集成 ECharts 图表

### 阶段六：优化完善

- [ ] 响应式布局适配
- [ ] 加载状态优化
- [ ] 错误处理完善
- [ ] 动画效果增强
- [ ] 功能测试
- [ ] Bug 修复

---

*文档版本：v1.1*
*创建日期：2026-06-27*
