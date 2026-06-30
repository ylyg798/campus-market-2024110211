import http from './http'

export interface GroupBuyItem {
  id?: number
  title: string
  type: string
  targetCount: number
  currentCount: number
  deadline: string
  location: string
  publisher: string
  status: string
  description: string
}

export function getGroupBuys() {
  return http.get<GroupBuyItem[]>('/groupBuys')
}

export function getGroupBuy(id: number) {
  return http.get<GroupBuyItem>(`/groupBuys/${id}`)
}

export function createGroupBuy(data: Omit<GroupBuyItem, 'id'>) {
  return http.post<GroupBuyItem>('/groupBuys', data)
}

export function updateGroupBuy(id: number, data: Partial<GroupBuyItem>) {
  return http.patch<GroupBuyItem>(`/groupBuys/${id}`, data)
}

export function deleteGroupBuy(id: number) {
  return http.delete(`/groupBuys/${id}`)
}
