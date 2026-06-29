import http from './http'

export interface LostFoundItem {
  id: number
  title: string
  type: 'lost' | 'found'
  itemName: string
  location: string
  eventTime: string
  contact: string
  status: string
  description: string
}

export function getLostFounds() {
  return http.get<LostFoundItem[]>('/lostFounds')
}

export function getLostFound(id: number) {
  return http.get<LostFoundItem>(`/lostFounds/${id}`)
}

export function createLostFound(data: Omit<LostFoundItem, 'id'>) {
  return http.post<LostFoundItem>('/lostFounds', data)
}

export function updateLostFound(id: number, data: Partial<LostFoundItem>) {
  return http.patch<LostFoundItem>(`/lostFounds/${id}`, data)
}

export function deleteLostFound(id: number) {
  return http.delete(`/lostFounds/${id}`)
}
