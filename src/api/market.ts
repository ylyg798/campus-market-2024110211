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

    return api.get('/market', { params }).then(res => res.data)
  },

  getMarketInfo(id: string): Promise<MarketInfo> {
    return api.get(`/market/${id}`).then(res => res.data)
  },

  createMarketInfo(data: Omit<MarketInfo, 'id' | 'createdAt' | 'viewCount' | 'favoriteCount'>): Promise<MarketInfo> {
    return api.post('/market', {
      ...data,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      favoriteCount: 0,
    }).then(res => res.data)
  },

  updateMarketInfo(id: string, data: Partial<MarketInfo>): Promise<MarketInfo> {
    return api.patch(`/market/${id}`, data).then(res => res.data)
  },

  incrementViewCount(id: string): Promise<MarketInfo> {
    return api.get(`/market/${id}`).then(res => {
      const item = res.data as MarketInfo
      return api.patch(`/market/${id}`, { viewCount: (item.viewCount || 0) + 1 }).then(res => res.data)
    })
  },
}