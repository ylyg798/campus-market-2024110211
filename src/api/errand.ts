import http from './http'

export interface ErrandItem {
  id: number
  title: string
  taskType: string
  reward: number
  from: string
  to: string
  deadline: string
  publisher: string
  status: string
  description: string
}

export function getErrands() {
  return http.get<ErrandItem[]>('/errands')
}

export function getErrand(id: number) {
  return http.get<ErrandItem>(`/errands/${id}`)
}

export function createErrand(data: Omit<ErrandItem, 'id'>) {
  return http.post<ErrandItem>('/errands', data)
}

export function updateErrand(id: number, data: Partial<ErrandItem>) {
  return http.patch<ErrandItem>(`/errands/${id}`, data)
}

export function deleteErrand(id: number) {
  return http.delete(`/errands/${id}`)
}
