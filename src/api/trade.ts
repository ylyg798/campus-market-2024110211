import http from './http'

export interface TradeItem {
  id?: number
  title: string
  category: string
  price: number
  condition: string
  location: string
  publisher: string
  publishTime: string
  image: string
  status: string
  description: string
}

export function getTrades() {
  return http.get<TradeItem[]>('/secondhands')
}

export function getTrade(id: number) {
  return http.get<TradeItem>(`/secondhands/${id}`)
}

export function createTrade(data: Omit<TradeItem, 'id'>) {
  return http.post<TradeItem>('/secondhands', data)
}

export function updateTrade(id: number, data: Partial<TradeItem>) {
  return http.patch<TradeItem>(`/secondhands/${id}`, data)
}

export function deleteTrade(id: number) {
  return http.delete(`/secondhands/${id}`)
}
