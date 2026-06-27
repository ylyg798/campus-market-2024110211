import axios from 'axios'

export const BASE_URL = '/api'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)
