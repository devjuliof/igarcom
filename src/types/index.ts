// ==================== API ====================

export interface ApiResponse<T> {
  data: T
  message?: string
}

// ==================== AUTH ====================

export interface AuthUser {
  id: string
  email: string
  name: string
  companyId: string
  companyName?: string
  companySlug?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

// ==================== TABLES ====================

export type TableStatus = 'free' | 'occupied'

export interface Table {
  id: string
  number: string
  name: string | null
  status: TableStatus
  deviceId: string | null
  consumption: {
    totalCents: number
    paidCents: number
    remainingCents: number
  }
  orders: {
    total: number
    active: number
  }
  createdAt: string
  updatedAt: string
}

// ==================== WAITER CALLS ====================

export type WaiterCallType = 'call' | 'bill'
export type WaiterCallStatus = 'pending' | 'acknowledged' | 'completed' | 'canceled'

export interface WaiterCall {
  id: string
  tableNumber: string
  tableId: string | null
  type: WaiterCallType
  status: WaiterCallStatus
  acknowledgedBy: string | null
  acknowledgedAt: string | null
  completedAt: string | null
  createdAt: string
}

// ==================== ORDERS ====================

export type OrderStatus =
  | 'awaiting_payment'
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'awaiting_delivery'
  | 'out_for_delivery'
  | 'completed'
  | 'canceled'

export interface OrderItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes: string | null
}

export interface Order {
  id: string
  orderNumber: number
  status: OrderStatus
  totalCents: number
  items: OrderItem[]
  createdAt: string
}

// ==================== MENU (for waiter ordering) ====================

export interface PublicProduct {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  sortOrder: number
}

export interface PublicCategory {
  id: string
  name: string
  icon: string | null
  sortOrder: number
  products: PublicProduct[]
}

export interface CatalogCompany {
  id: string
  name: string
  slug: string
  logo: string | null
  baseColor: string | null
}

export interface CatalogResponse {
  categories: PublicCategory[]
  company: CatalogCompany
}

// ==================== PUSH TOKENS ====================

export interface RegisterPushTokenPayload {
  expoPushToken: string
  deviceName?: string
  platform?: 'ios' | 'android'
}
