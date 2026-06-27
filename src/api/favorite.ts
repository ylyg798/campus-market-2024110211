import { api } from './config'
import type { FavoriteItem } from '@/types/favorite'

export const favoriteApi = {
  getFavorites(userId: string): Promise<FavoriteItem[]> {
    return api.get('/favorites', {
      params: { userId },
    })
  },

  addFavorite(data: Omit<FavoriteItem, 'id' | 'createdAt'>): Promise<FavoriteItem> {
    return api.post('/favorites', {
      ...data,
      createdAt: new Date().toISOString(),
    })
  },

  removeFavorite(userId: string, infoId: string): Promise<void> {
    return api.get('/favorites', {
      params: { userId, infoId },
    }).then(items => {
      if (items.length > 0) {
        return api.delete(`/favorites/${items[0].id}`)
      }
      return Promise.resolve()
    })
  },

  checkFavorite(userId: string, infoId: string): Promise<boolean> {
    return api.get('/favorites', {
      params: { userId, infoId },
    }).then((items: FavoriteItem[]) => items.length > 0)
  },
}
