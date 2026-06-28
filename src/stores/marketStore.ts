import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/config'
import type { MarketInfo, InfoType } from '@/types/market'

export const useMarketStore = defineStore('market', () => {
  const marketList = ref<MarketInfo[]>([])
  const currentInfo = ref<MarketInfo | null>(null)
  const isLoading = ref(false)

  const filter = ref({
    type: undefined as InfoType | undefined,
    campus: undefined as string | undefined,
    keyword: undefined as string | undefined,
  })

  const filteredList = computed(() => {
    if (!marketList.value || !Array.isArray(marketList.value)) {
      return []
    }
    let list = [...marketList.value]

    if (filter.value.type) {
      list = list.filter(item => item.type === filter.value.type)
    }

    if (filter.value.campus) {
      list = list.filter(item => item.campus === filter.value.campus)
    }

    if (filter.value.keyword) {
      const keyword = filter.value.keyword.toLowerCase()
      list = list.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.tags.some(tag => tag.toLowerCase().includes(keyword))
      )
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })

  const latestList = computed(() => {
    if (!marketList.value || !Array.isArray(marketList.value)) {
      return []
    }
    return [...marketList.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  })

  const hotList = computed(() => {
    if (!marketList.value || !Array.isArray(marketList.value)) {
      return []
    }
    return [...marketList.value]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10)
  })

  async function fetchMarketList() {
    isLoading.value = true
    try {
      const response = await api.get('/infos')
      marketList.value = response.data
    } catch (error) {
      console.error('获取集市列表失败:', error)
      marketList.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMarketInfo(id: string) {
    isLoading.value = true
    try {
      const response = await api.get(`/infos/${id}`)
      currentInfo.value = response.data
    } catch (error) {
      console.error('获取信息详情失败:', error)
      currentInfo.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function publishInfo(info: Omit<MarketInfo, 'id' | 'createdAt' | 'publisher' | 'status' | 'viewCount' | 'favoriteCount'>) {
    isLoading.value = true
    try {
      const response = await api.post('/infos', {
        ...info,
        status: 'active',
        viewCount: 0,
        favoriteCount: 0,
        createdAt: new Date().toISOString(),
        publisher: {
          id: '1',
          nickname: '测试用户',
        },
      })
      marketList.value.unshift(response.data)
    } catch (error) {
      console.error('发布信息失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function acceptTask(taskId: string, userId: string, nickname: string) {
    try {
      const response = await api.patch(`/infos/${taskId}`, {
        status: 'claimed',
        assignee: {
          id: userId,
          nickname: nickname,
          acceptedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      })

      if (currentInfo.value && currentInfo.value.id === taskId) {
        currentInfo.value = response.data
      }

      const index = marketList.value.findIndex(item => item.id === taskId)
      if (index !== -1) {
        marketList.value[index] = response.data
      }

      return response.data
    } catch (error) {
      console.error('接受任务失败:', error)
      throw error
    }
  }

  async function updateTaskStatus(taskId: string, status: 'active' | 'claimed' | 'in-progress' | 'completed' | 'closed', taskProgress?: string) {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString(),
      }

      if (taskProgress) {
        updateData.taskProgress = taskProgress
      }

      const response = await api.patch(`/infos/${taskId}`, updateData)

      if (currentInfo.value && currentInfo.value.id === taskId) {
        currentInfo.value = response.data
      }

      const index = marketList.value.findIndex(item => item.id === taskId)
      if (index !== -1) {
        marketList.value[index] = response.data
      }

      return response.data
    } catch (error) {
      console.error('更新任务状态失败:', error)
      throw error
    }
  }

  function setFilter(newFilter: Partial<{ type: InfoType; campus: string; keyword: string }>) {
    filter.value = { ...filter.value, ...newFilter }
  }

  return {
    marketList,
    currentInfo,
    isLoading,
    filter,
    filteredList,
    latestList,
    hotList,
    fetchMarketList,
    fetchMarketInfo,
    publishInfo,
    acceptTask,
    updateTaskStatus,
    setFilter,
  }
})
