import { api } from './api'
import type { WaiterCall, WaiterCallStatus } from '../types'

export const waiterCallService = {
  getCalls: async (status?: WaiterCallStatus): Promise<WaiterCall[]> => {
    const params = status ? { status } : {}
    const response = await api.get<{ data: WaiterCall[] }>('/waiter-calls', {
      params,
    })
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
