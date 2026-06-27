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
