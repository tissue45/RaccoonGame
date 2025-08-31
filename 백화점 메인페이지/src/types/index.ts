export interface Product {
  id: number
  name: string
  description: string
  price: number
  brand?: string
  image_urls?: string[]
  image: string
  category_id: number
  status: 'forsale' | 'soldout' | 'inactive'
  sales: number
  stock: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  description?: string
  image_url?: string
  level: number
  parent_id?: number
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  productId: number
  quantity: number
  product: Product
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  user_id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: string
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  name: string
  type: 'discount' | 'percentage'
  value: number // 할인 금액 또는 할인율
  minAmount: number // 최소 구매 금액
  maxDiscount?: number // 최대 할인 금액 (퍼센트 쿠폰의 경우)
  restrictions: string
  usagePeriod: {
    start: string
    end: string
  }
  isUsed: boolean
  usedAt?: string
  orderId?: string
  userId: string
  createdAt: string
}

export interface CouponUsage {
  id: string
  couponId: string
  userId: string
  orderId: string
  usedAt: string
  discountAmount: number
}