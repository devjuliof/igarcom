import { api } from './api'
import type { RegisterPushTokenPayload } from '../types'

export const pushTokenService = {
  register: async (payload: RegisterPushTokenPayload): Promise<void> => {
    await api.post('/push-tokens', payload)
  },

  deactivate: async (token: string): Promise<void> => {
    await api.delete(`/push-tokens/${encodeURIComponent(token)}`)
  },
}
