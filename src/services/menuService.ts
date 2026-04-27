import { api } from './api'
import type { ApiResponse, CatalogResponse } from '../types'

export const menuService = {
  getPublicMenu: async (companySlug: string): Promise<CatalogResponse> => {
    const response = await api.get<ApiResponse<CatalogResponse>>(
      `/public/menu/${companySlug}`,
    )
    return response.data.data
  },
}
