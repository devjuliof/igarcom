import { api } from './api'
import type { LoginPayload, LoginResponse } from '../types'

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
      '/auth/login',
      payload,
    )
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },
}
