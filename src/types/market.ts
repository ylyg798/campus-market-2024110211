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
