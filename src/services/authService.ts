import { api } from './api'
import type { ApiResponse, LoginPayload, LoginResponse } from '../types'

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      payload,
    )
    return response.data.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },
}
