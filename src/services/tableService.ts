import { api } from './api'
import type { ApiResponse, Table } from '../types'

export const tableService = {
  getTables: async (status?: string): Promise<Table[]> => {
    const params = status ? { status } : {}
    const response = await api.get<{ data: Table[] }>('/tables', { params })
    return response.data.data
  },

  getTableById: async (id: string): Promise<Table> => {
    const response = await api.get<{ data: Table }>(`/tables/${id}`)
    return response.data.data
  },

  transferTable: async (
    sourceTableId: string,
    destinationTableId: string,
  ): Promise<void> => {
    await api.post('/tables/transfer', {
      sourceTableId,
      destinationTableId,
    })
  },
}
