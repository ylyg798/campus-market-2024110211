import { api } from './config'
import type { FavoriteItem } from '@/types/favorite'

export const favoriteApi = {
  getFavorites(userId: string): Promise<FavoriteItem[]> {
    return api.get('/favorites', {
      params: { userId },
    }).then(res => res.data)
  },

  addFavorite(data: Omit<FavoriteItem, 'id' | 'createdAt'>): Promise<FavoriteItem> {
    return api.post('/favorites', {
      ...data,
      createdAt: new Date().toISOString(),
    }).then(res => res.data)
  },

  removeFavorite(userId: string, infoId: string): Promise<void> {
    return api.get('/favorites', {
      params: { userId, infoId },
    }).then(res => {
      const items = res.data as FavoriteItem[]
      if (items.length > 0 && items[0]) {
        return api.delete(`/favorites/${items[0].id}`).then(() => { })
      }
      return Promise.resolve()
    })
  },

  checkFavorite(userId: string, infoId: string): Promise<boolean> {
    return api.get('/favorites', {
      params: { userId, infoId },
    }).then(res => {
      const items = res.data as FavoriteItem[]
      return items.length > 0
    })
  },
}
