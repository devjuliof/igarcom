import { api } from './api'
import type { WaiterCall, WaiterCallStatus } from '../types'

export const waiterCallService = {
  getCalls: async (status?: WaiterCallStatus): Promise<WaiterCall[]> => {
    const params = status ? { status } : {}
    if (__DEV__) console.log('[WaiterCalls] Fetching calls...')
    const response = await api.get<{ data: WaiterCall[] }>('/waiter-calls', {
      params,
    })
    if (__DEV__) console.log('[WaiterCalls] Response:', JSON.stringify(response.data).substring(0, 200))
    return response.data.data
  },

  acknowledgeCall: async (id: string): Promise<WaiterCall> => {
    const response = await api.patch<{ data: WaiterCall }>(
      `/waiter-calls/${id}/acknowledge`,
    )
    return response.data.data
  },

  completeCall: async (id: string): Promise<WaiterCall> => {
    const response = await api.patch<{ data: WaiterCall }>(
      `/waiter-calls/${id}/complete`,
    )
    return response.data.data
  },
}
