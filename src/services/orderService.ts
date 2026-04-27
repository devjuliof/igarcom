import { api } from './api'
import type { ApiResponse, Order } from '../types'

export interface CreateOrderPayload {
  source: 'waiter'
  deliveryType: 'dine_in'
  tableNumber: string
  tableId: string
  items: {
    productId: string
    quantity: number
    notes?: string
  }[]
  paymentMethod: 'cash'
}

export const orderService = {
  getOrdersByTable: async (tableId: string): Promise<Order[]> => {
    const response = await api.get<{ data: Order[] }>('/orders', {
      params: { tableId },
    })
    return response.data.data
  },

  createOrder: async (
    companySlug: string,
    payload: CreateOrderPayload,
  ): Promise<Order> => {
    const response = await api.post<ApiResponse<Order>>(
      `/public/orders/${companySlug}`,
      payload,
    )
    return response.data.data
  },
}
