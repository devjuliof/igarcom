import { api } from './api'

export interface CompanyInfo {
  id: string
  name: string
  slug: string
  logo: string | null
}

export const companyService = {
  getCompany: async (): Promise<CompanyInfo> => {
    const response = await api.get<CompanyInfo>('/company')
    return response.data
  },
}
