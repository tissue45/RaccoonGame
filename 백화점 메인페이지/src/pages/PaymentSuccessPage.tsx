import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiHome, FiShoppingBag } from 'react-icons/fi'
import { useCouponContext } from '../context/CouponContext'
import { createOrder, Order, OrderItem } from '../services/orderService'

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orderCreated, setOrderCreated] = useState(false)
  const navigate = useNavigate()
  const hasProcessedRef = useRef(false) // 중복 실행 방지를 위한 ref
  const { selectedCoupon, useCoupon, calculateDiscount } = useCouponContext()

  useEffect(() => {
    // 이미 처리되었으면 중단
    if (hasProcessedRef.current) {
      return
    }

    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    if (paymentKey && orderId && amount) {
      // 이미 주문이 생성되었는지 확인
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
      const orderExists = existingOrders.some((order: any) => 
        order.payment_key === paymentKey
      )

      if (orderExists) {
        console.log('이미 주문이 생성되었습니다.')
        setPaymentInfo({
          paymentKey,
          orderId,
          amount: parseInt(amount),
          method: '카드',
          approvedAt: new Date().toISOString(),
        })
        setLoading(false)
        hasProcessedRef.current = true
        return
      }

      // 처리 시작 표시
      hasProcessedRef.current = true

      // 실제로는 서버에서 결제 승인 API를 호출해야 합니다
      // 여기서는 시뮬레이션으로 처리
      setTimeout(async () => {
        const paymentData = {
          paymentKey,
          orderId,
          amount: parseInt(amount),
          method: '카드',
          approvedAt: new Date().toISOString(),
        }
        setPaymentInfo(paymentData)
        
        // 결제 성공 시 선택된 쿠폰이 있으면 사용 처리
        if (selectedCoupon) {
          const discountAmount = calculateDiscount(selectedCoupon, parseInt(amount))
          useCoupon(selectedCoupon.id, orderId, discountAmount)
        }
        
        // 주문 데이터 생성 및 저장
        await createOrderFromCart(paymentData)
        setLoading(false)
      }, 1000)
    } else {
      setLoading(false)
    }
  }, []) // 의존성 배열을 비워서 한 번만 실행

  const createOrderFromCart = async (paymentData: any) => {
    try {
      // 현재 로그인한 사용자 정보 가져오기
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        console.error('사용자 정보를 찾을 수 없습니다.')
        return
      }

      const user = JSON.parse(currentUser)
      
      // 장바구니에서 상품 정보 가져오기
      let cartItems = JSON.parse(localStorage.getItem('cart') || '[]')
      
      // 장바구니가 비어있으면 테스트용 상품 데이터 생성
      if (cartItems.length === 0) {
        console.log('장바구니가 비어있어 테스트용 상품 데이터를 생성합니다.')
        cartItems = [
          {
            id: 1,
            name: '프리미엄 울 코트',
            price: paymentData.amount,
            quantity: 1,
            image: '/placeholder-image.jpg',
            brand: '테스트 브랜드',
            size: 'FREE',
            color: '블랙'
          }
        ]
      }

      // 주문 아이템 생성 (더 상세한 정보 포함)
      const orderItems = cartItems.map((item: any) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        brand: item.brand || '브랜드 정보 없음',
        size: item.selectedSize || item.size || 'FREE',
        color: item.selectedColor || item.color || '색상 정보 없음'
      }))

      // 배송 예상일 계산 (3-5일 후)
      const estimatedDelivery = new Date()
      estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 3) + 3)

      // 주문 데이터 생성 (더 상세한 정보 포함)
      const orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id || user.email, // 사용자 ID 또는 이메일
        order_date: new Date().toISOString(),
        status: '결제완료' as const,
        total_amount: paymentData.amount,
        payment_method: paymentData.method,
        payment_key: paymentData.paymentKey,
        items: orderItems,
        shipping_address: user.address || '주소 정보 없음',
        recipient_name: user.name,
        recipient_phone: user.phone || '010-1234-5678',
        tracking_number: `TN${Date.now()}`, // 운송장번호 생성
        estimated_delivery: estimatedDelivery.toISOString() // 예상 배송일
      }

      // 데이터베이스에 주문 저장
      const savedOrder = await createOrder(orderData)
      
      if (savedOrder) {
        console.log('주문이 성공적으로 데이터베이스에 저장되었습니다:', savedOrder)
        setOrderCreated(true)
        
        // 성공적으로 저장된 후 로컬스토리지에서도 제거 (중복 방지)
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        const filteredOrders = existingOrders.filter((order: any) => 
          order.payment_key !== paymentData.paymentKey
        )
        localStorage.setItem('orders', JSON.stringify(filteredOrders))
      } else {
        console.error('주문 저장에 실패했습니다.')
        // 실패 시 로컬스토리지에 임시 저장
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        const updatedOrders = [...existingOrders, orderData]
        localStorage.setItem('orders', JSON.stringify(updatedOrders))
      }
      
      // 장바구니 자동 비우기 (결제 완료 후)
      const currentCart = localStorage.getItem('cart')
      if (currentCart) {
        localStorage.removeItem('cart')
        console.log('장바구니가 자동으로 비워졌습니다.')
      }
      
      // 주문 완료 알림 (한 번만 표시)
      if (!sessionStorage.getItem(`alerted_${paymentData.paymentKey}`)) {
        alert('주문이 성공적으로 완료되었습니다! 마이페이지로 이동합니다.')
        sessionStorage.setItem(`alerted_${paymentData.paymentKey}`, 'true')
      }
      
      // 바로 마이페이지로 이동
      navigate('/mypage')
      
    } catch (error) {
      console.error('주문 생성 중 오류 발생:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">결제 정보를 확인하고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (!paymentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">결제 정보를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-8">올바르지 않은 접근입니다.</p>
          <Link to="/" className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-green-500 mb-8">
            <FiCheckCircle size={64} className="mx-auto" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">결제가 완료되었습니다!</h1>
          <p className="text-gray-600 mb-12 leading-relaxed">
            주문해 주셔서 감사합니다.<br />
            주문 확인 및 배송 안내는 문자와 이메일로 발송됩니다.
          </p>

          {orderCreated && (
            <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
              <h4 className="font-bold text-blue-900 mb-2">✅ 주문이 성공적으로 생성되었습니다!</h4>
              <p className="text-blue-700 text-sm">
                마이페이지의 '주문접수/배송조회'에서 주문 내역을 확인할 수 있습니다.
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-8 mb-8 text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-6">결제 정보</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">주문번호</span>
                <span className="font-medium text-gray-900">{paymentInfo.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제금액</span>
                <span className="font-bold text-lg text-gray-900">₩{formatPrice(paymentInfo.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제방법</span>
                <span className="font-medium text-gray-900">{paymentInfo.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제일시</span>
                <span className="font-medium text-gray-900">{formatDate(paymentInfo.approvedAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-12">
            <Link to="/" className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              <FiHome size={18} />
              홈으로
            </Link>
            <button 
              onClick={() => navigate('/mypage')}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <FiShoppingBag size={18} />
              주문내역 확인
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 text-left">
            <h4 className="font-bold text-gray-900 mb-4">배송 안내</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 일반배송: 주문일로부터 2-3일 내 배송</li>
              <li>• 당일배송: 오후 2시 이전 주문시 당일 배송 (서울/경기 일부지역)</li>
              <li>• 배송 문의: 1588-1234</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage