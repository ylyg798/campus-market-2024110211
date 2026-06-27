import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/config'
import type { InfoType } from '@/types/market'

export interface Favorite {
  id: string
  userId: string
  infoId: string
  infoType: InfoType
  infoTitle: string
  createdAt: string
}

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref<Favorite[]>([])
  const isLoading = ref(false)

  async function fetchFavorites(userId: string) {
    isLoading.value = true
    try {
      const response = await api.get('/favorites', {
        params: { userId },
      })
      favorites.value = response.data
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      favorites.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function toggleFavorite(userId: string, infoId: string, infoType: InfoType, infoTitle: string) {
    const existing = favorites.value.find(f => f.infoId === infoId)

    if (existing) {
      try {
        await api.delete(`/favorites/${existing.id}`)
        favorites.value = favorites.value.filter(f => f.id !== existing.id)
      } catch (error) {
        console.error('取消收藏失败:', error)
      }
    } else {
      try {
        await api.post('/favorites', {
          userId,
          infoId,
          infoType,
          infoTitle,
          createdAt: new Date().toISOString(),
        })
        favorites.value.push({
          id: Date.now().toString(),
          userId,
          infoId,
          infoType,
          infoTitle,
          createdAt: new Date().toISOString(),
        })
      } catch (error) {
        console.error('添加收藏失败:', error)
      }
    }
  }

  function isFavorite(infoId: string) {
    return favorites.value.some(f => f.infoId === infoId)
  }

  return {
    favorites,
    isLoading,
    fetchFavorites,
    toggleFavorite,
    isFavorite,
  }
})
