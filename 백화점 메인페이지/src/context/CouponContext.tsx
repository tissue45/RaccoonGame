import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Coupon, CouponUsage } from '../types'
import { useUser } from './UserContext'

interface CouponContextType {
  selectedCoupon: Coupon | null
  availableCoupons: Coupon[]
  userCoupons: Coupon[]
  userCouponUsages: CouponUsage[]
  selectCoupon: (coupon: Coupon) => void
  clearSelectedCoupon: () => void
  useCoupon: (couponId: string, orderId: string, discountAmount: number) => void
  getAvailableCoupons: (totalAmount: number) => Coupon[]
  calculateDiscount: (coupon: Coupon, totalAmount: number) => number
  addTestCoupons: () => void
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export const useCouponContext = () => {
  const context = useContext(CouponContext)
  if (!context) {
    throw new Error('useCouponContext must be used within a CouponProvider')
  }
  return context
}

interface CouponProviderProps {
  children: ReactNode
}

export const CouponProvider: React.FC<CouponProviderProps> = ({ children }) => {
  const { currentUser } = useUser()
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [userCoupons, setUserCoupons] = useState<Coupon[]>([])
  const [userCouponUsages, setUserCouponUsages] = useState<CouponUsage[]>([])

  // 사용자 쿠폰 데이터 로드
  useEffect(() => {
    if (currentUser) {
      // localStorage에서 사용자별 쿠폰 데이터 로드
      const userCoupons = JSON.parse(localStorage.getItem(`coupons_${currentUser.id}`) || '[]')
      const userCouponUsages = JSON.parse(localStorage.getItem(`coupon_usages_${currentUser.id}`) || '[]')
      
      setUserCoupons(userCoupons)
      setUserCouponUsages(userCouponUsages)
    }
  }, [currentUser])

  // 쿠폰 선택
  const selectCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
  }

  // 선택된 쿠폰 초기화
  const clearSelectedCoupon = () => {
    setSelectedCoupon(null)
  }

  // 쿠폰이 선택되었는지 확인
  const isCouponSelected = (couponId: string) => {
    return selectedCoupon?.id === couponId
  }

  // 쿠폰 사용 (결제 완료 후 호출)
  const useCoupon = (couponId: string, orderId: string, discountAmount: number) => {
    if (!currentUser) return

    // 쿠폰 상태 업데이트
    const updatedCoupons = userCoupons.map((coupon: Coupon) => {
      if (coupon.id === couponId) {
        return {
          ...coupon,
          isUsed: true,
          usedAt: new Date().toISOString(),
          orderId
        }
      }
      return coupon
    })

    // 쿠폰 사용 기록 추가
    const couponUsage: CouponUsage = {
      id: `usage_${Date.now()}`,
      couponId,
      userId: currentUser.id,
      orderId,
      usedAt: new Date().toISOString(),
      discountAmount
    }

    const updatedUserCouponUsages = [...userCouponUsages, couponUsage]

    // 로컬스토리지 업데이트
    localStorage.setItem(`coupons_${currentUser.id}`, JSON.stringify(updatedCoupons))
    localStorage.setItem(`coupon_usages_${currentUser.id}`, JSON.stringify(updatedUserCouponUsages))

    // 상태 업데이트
    setUserCoupons(updatedCoupons)
    setUserCouponUsages(updatedUserCouponUsages)
    setSelectedCoupon(null)
  }

  // 사용 가능한 쿠폰 조회 (최소 구매 금액 조건 확인)
  const getAvailableCoupons = (totalAmount: number) => {
    if (!currentUser) return []

    const availableCoupons = userCoupons.filter((coupon: Coupon) => {
      const now = new Date()
      const startDate = new Date(coupon.usagePeriod.start)
      const endDate = new Date(coupon.usagePeriod.end)
      
      const isNotUsed = !coupon.isUsed
      const meetsMinAmount = totalAmount >= coupon.minAmount
      const isWithinPeriod = now >= startDate && now <= endDate
      
      return isNotUsed && meetsMinAmount && isWithinPeriod
    })
    
    return availableCoupons
  }

  // 할인 금액 계산
  const calculateDiscount = (coupon: Coupon, totalAmount: number): number => {
    if (coupon.type === 'discount') {
      return Math.min(coupon.value, totalAmount)
    } else if (coupon.type === 'percentage') {
      const discount = (totalAmount * coupon.value) / 100
      return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount
    }
    return 0
  }

  // 초기 쿠폰 데이터 생성 (테스트용)
  const addTestCoupons = () => {
    if (!currentUser) return

    // FAMILY 등급 사용자에게 제공되는 쿠폰 데이터
    const testCoupons: Coupon[] = [
      {
        id: 'coupon_1',
        name: '첫 구매 웰컴 쿠폰',
        type: 'discount',
        value: 15000, // 15,000원 할인
        minAmount: 50000, // 50,000원 이상 구매시
        restrictions: '50,000원 이상 구매시 사용 가능 (일부 브랜드 및 일부 상품 제외)',
        usagePeriod: {
          start: '2025-01-01T00:00:00.000Z',
          end: '2025-12-31T23:59:59.999Z'
        },
        isUsed: false,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
      },
      {
        id: 'coupon_2',
        name: '1회 무료배송 쿠폰',
        type: 'discount',
        value: 3000, // 3,000원 할인 (배송비 상당)
        minAmount: 0, // 구매 금액 제한 없음
        restrictions: '모든 상품 구매시 사용 가능 (배송비 무료)',
        usagePeriod: {
          start: '2025-01-01T00:00:00.000Z',
          end: '2025-12-31T23:59:59.999Z'
        },
        isUsed: false,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
      }
    ]

    localStorage.setItem(`coupons_${currentUser.id}`, JSON.stringify(testCoupons))
    console.log('새로운 쿠폰 데이터를 생성했습니다:', testCoupons)

    setUserCoupons(testCoupons)
    // 페이지 로드 시 선택된 쿠폰 초기화
    setSelectedCoupon(null)
  }

  const value: CouponContextType = {
    selectedCoupon,
    availableCoupons,
    userCoupons,
    userCouponUsages,
    selectCoupon,
    clearSelectedCoupon,
    useCoupon,
    getAvailableCoupons,
    calculateDiscount,
    addTestCoupons
  }

  return (
    <CouponContext.Provider value={value}>
      {children}
    </CouponContext.Provider>
  )
}
