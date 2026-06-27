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
}
