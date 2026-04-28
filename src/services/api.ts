import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

  if (__DEV__ && Platform.OS === 'android') {
    return envUrl.replace(/localhost|127\.0\.0\.1/, '10.0.2.2')
  }

  return envUrl
}

const API_BASE_URL = getApiBaseUrl()

if (__DEV__) {
  console.log('[API] Platform:', Platform.OS)
  console.log('[API] Base URL:', API_BASE_URL)
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth-token')
      if (__DEV__) console.log(`[API] ${config.method?.toUpperCase()} ${config.url} | token: ${token ? 'yes' : 'NO'}`)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Ignore storage errors
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.error('API Error:', error.response?.data || error.message)
    }
    return Promise.reject(error)
  },
)
