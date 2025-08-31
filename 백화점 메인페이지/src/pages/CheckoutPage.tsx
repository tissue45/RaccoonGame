import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useCartContext } from '../context/CartContext'
import { useCouponContext } from '../context/CouponContext'
import { tossPaymentsService, PaymentData } from '../services/tossPayments'

const CheckoutPage: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { cartItems, selectedItems, getSelectedTotalPrice, formatPrice } = useCartContext()
    const { selectedCoupon, selectCoupon, useCoupon, getAvailableCoupons, calculateDiscount, clearSelectedCoupon } = useCouponContext()

    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    })

    // 로그인된 사용자 정보 불러오기
    useEffect(() => {
        const currentUser = localStorage.getItem('currentUser')
        if (currentUser) {
            const user = JSON.parse(currentUser)
            console.log('로그인된 사용자 정보:', user)
            setCustomerInfo({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                address: user.address || ''
            })
        } else {
            console.log('로그인된 사용자가 없습니다.')
        }
    }, [])

    const [paymentMethod, setPaymentMethod] = useState('card')
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [showCouponSection, setShowCouponSection] = useState(false)

    // 바로구매 데이터가 있는지 확인
    const directOrderData = location.state

    // 바로구매인지 장바구니 주문인지 판단
    const isDirectOrder = !!directOrderData && directOrderData.isDirectOrder

    let orderItems: any[] = []
    let totalPrice = 0

    if (isDirectOrder) {
        // 바로구매의 경우
        orderItems = directOrderData.items.map((item: any) => ({
            id: item.product.id,
            product: item.product,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
        }))
        totalPrice = directOrderData.totalAmount
    } else {
        // 장바구니 주문의 경우
        orderItems = cartItems.filter(item => selectedItems.includes(item.id))
        totalPrice = getSelectedTotalPrice()
    }

    // 사용자 등급 확인
    const currentUser = localStorage.getItem('currentUser')
    const user = currentUser ? JSON.parse(currentUser) : null
    
    // 배송비 계산 (FAMILY 등급은 3,000원, SILVER 이상은 무료)
    const shippingFee = user && user.grade === 'FAMILY' ? 3000 : 0
    
    // 쿠폰 할인 적용
    const availableCoupons = getAvailableCoupons(totalPrice)
    const discountAmount = selectedCoupon ? calculateDiscount(selectedCoupon, totalPrice) : 0
    const finalPrice = totalPrice + shippingFee - discountAmount

    // 디버깅을 위한 로그
    useEffect(() => {
        console.log('결제 페이지 로드됨')
        console.log('선택된 쿠폰:', selectedCoupon)
        console.log('총 주문 금액:', totalPrice)
        console.log('할인 금액:', discountAmount)
        console.log('최종 결제 금액:', finalPrice)
    }, [selectedCoupon, totalPrice, discountAmount, finalPrice])

    if (orderItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">주문할 상품이 없습니다</h2>
                        <p className="text-gray-600 mb-8">상품을 선택한 후 주문해주세요.</p>
                        <button 
                            onClick={() => navigate(isDirectOrder ? '/' : '/cart')}
                            className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                        >
                            {isDirectOrder ? '홈으로 돌아가기' : '장바구니로 돌아가기'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCustomerInfo(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
            alert('필수 정보를 모두 입력해주세요.')
            return
        }

        if (!agreeTerms) {
            alert('구매 약관에 동의해주세요.')
            return
        }

        setIsProcessing(true)

        try {
            const orderId = tossPaymentsService.generateOrderId()
            const orderName = orderItems.length === 1 
                ? orderItems[0].product.name 
                : `${orderItems[0].product.name} 외 ${orderItems.length - 1}건`

            // 쿠폰 사용은 결제 성공 후 PaymentSuccessPage에서 처리됨
            // 여기서는 선택된 쿠폰 정보만 유지

            const paymentData: PaymentData = {
                amount: finalPrice, // 할인된 최종 금액으로 결제
                orderId,
                orderName,
                customerName: customerInfo.name,
                customerEmail: customerInfo.email,
                customerMobilePhone: customerInfo.phone,
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
            }

            // 결제 방법에 따라 다른 결제 요청
            switch (paymentMethod) {
                case 'card':
                    await tossPaymentsService.requestPayment(paymentData)
                    break
                case 'kakao':
                    await tossPaymentsService.requestKakaoPayment(paymentData)
                    break
                case 'bank':
                    await tossPaymentsService.requestTransferPayment(paymentData)
                    break
                default:
                    await tossPaymentsService.requestPayment(paymentData)
            }
        } catch (error) {
            console.error('결제 요청 실패:', error)
            alert('결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.')
        } finally {
            setIsProcessing(false)
        }
    }

    // 개발자용 결제 완료 테스트 함수
    const handleTestPaymentSuccess = () => {
        const orderId = tossPaymentsService.generateOrderId()
        const paymentKey = `test_payment_${Date.now()}`
        
        // 쿠폰 사용은 결제 성공 후 PaymentSuccessPage에서 처리됨
        // 여기서는 선택된 쿠폰 정보만 유지
        
        // 결제 성공 페이지로 이동 (테스트용 파라미터와 함께)
        navigate(`/payment/success?paymentKey=${paymentKey}&orderId=${orderId}&amount=${finalPrice}`)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-6">
                <h1 className="text-3xl font-bold text-center mb-12">주문/결제</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 주문 상품 정보 */}
                    <div className="bg-white rounded-lg p-6 shadow-sm h-fit">
                        <h2 className="text-xl font-bold mb-6">주문 상품</h2>
                        <div className="space-y-4 mb-6">
                            {orderItems.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg">
                                    <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">{item.product.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{item.product.brand}</p>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div>색상: {isDirectOrder ? item.selectedColor : '블랙'}</div>
                                            <div>사이즈: {isDirectOrder ? item.selectedSize : 'FREE'}</div>
                                            <div>수량: {item.quantity}개</div>
                                        </div>
                                        <p className="text-lg font-bold text-black mt-2">₩{formatPrice(item.product.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 쿠폰 선택 섹션 */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-800">쿠폰 적용</h3>
                                {selectedCoupon && (
                                    <button
                                        onClick={() => setShowCouponSection(!showCouponSection)}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        {showCouponSection ? '접기' : '쿠폰 변경'}
                                    </button>
                                )}
                            </div>
                            
                            {/* 장바구니에서 선택한 쿠폰 정보 표시 */}
                            {selectedCoupon && (
                                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                    <strong>장바구니에서 선택한 쿠폰:</strong> {selectedCoupon.name}
                                </div>
                            )}
                            
                            {selectedCoupon ? (
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-800">{selectedCoupon.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {selectedCoupon.type === 'discount' 
                                                    ? `${formatPrice(selectedCoupon.value)} 할인`
                                                    : `${selectedCoupon.value}% 할인${selectedCoupon.maxDiscount ? ` (최대 ${formatPrice(selectedCoupon.maxDiscount)})` : ''}`
                                                }
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-red-500 text-lg">
                                                -₩{formatPrice(discountAmount)}
                                            </div>
                                            <button
                                                onClick={() => selectCoupon(null)}
                                                className="text-xs text-gray-500 hover:text-red-500"
                                            >
                                                쿠폰 해제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowCouponSection(!showCouponSection)}
                                    className="w-full flex items-center justify-between text-left"
                                >
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {availableCoupons.length > 0 
                                                ? `${availableCoupons.length}개의 쿠폰 사용 가능`
                                                : '사용 가능한 쿠폰이 없습니다'
                                            }
                                        </p>
                                        {selectedCoupon && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                장바구니에서 선택한 쿠폰이 적용되었습니다
                                            </p>
                                        )}
                                    </div>
                                    {showCouponSection ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                                </button>
                            )}

                            {showCouponSection && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    {availableCoupons.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">사용 가능한 쿠폰이 없습니다.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                                                <input
                                                    type="radio"
                                                    name="coupon"
                                                    checked={selectedCoupon === null}
                                                    onChange={() => selectCoupon(null)}
                                                    className="mr-3"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-800">쿠폰 미사용</div>
                                                    <div className="text-sm text-gray-500">할인 없이 주문</div>
                                                </div>
                                            </div>
                                            
                                            {availableCoupons.map((coupon) => (
                                                <div key={coupon.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                                                    <input
                                                        type="radio"
                                                        name="coupon"
                                                        checked={selectedCoupon?.id === coupon.id}
                                                        onChange={() => selectCoupon(coupon)}
                                                        className="mr-3"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-800">{coupon.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {coupon.type === 'discount' 
                                                                ? `${formatPrice(coupon.value)} 할인`
                                                                : `${coupon.value}% 할인${coupon.maxDiscount ? ` (최대 ${formatPrice(coupon.maxDiscount)})` : ''}`
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-400">{coupon.restrictions}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium text-red-500">
                                                            -₩{formatPrice(calculateDiscount(coupon, totalPrice))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">상품금액</span>
                                <span className="font-medium">₩{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">배송비</span>
                                {shippingFee > 0 ? (
                                    <span className="font-medium">₩{formatPrice(shippingFee)}</span>
                                ) : (
                                    <span className="text-green-600 font-medium">무료</span>
                                )}
                            </div>
                            {selectedCoupon && (
                                <div className="flex justify-between text-red-500">
                                    <span>할인금액 ({selectedCoupon.name})</span>
                                    <span>-₩{formatPrice(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-3">
                                <span>총 결제금액</span>
                                <span>₩{formatPrice(finalPrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 주문자 정보 */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-6">주문자 정보</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={customerInfo.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">휴대폰 번호 *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={customerInfo.phone}
                                    onChange={handleInputChange}
                                    placeholder="010-0000-0000"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={customerInfo.email}
                                    onChange={handleInputChange}
                                    placeholder="example@email.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">주소 *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={customerInfo.address}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* 결제 방법 */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">결제 방법</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <span className="font-medium">신용카드</span>
                                    </label>
                                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="bank"
                                            checked={paymentMethod === 'bank'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <span className="font-medium">무통장입금</span>
                                    </label>
                                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="kakao"
                                            checked={paymentMethod === 'kakao'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <span className="font-medium">카카오페이</span>
                                    </label>
                                </div>
                            </div>

                            {/* 약관 동의 */}
                            <div className="border-t pt-6">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                        className="hidden peer"
                                    />
                                    <span className="w-5 h-5 border-2 border-gray-300 rounded mr-3 relative transition-all duration-300 peer-checked:bg-black peer-checked:border-black after:content-[''] after:absolute after:left-[6px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 after:opacity-0 peer-checked:after:opacity-100"></span>
                                    <span className="text-sm">구매 조건 및 개인정보 처리방침에 동의합니다.</span>
                                </label>
                            </div>

                            {/* 결제 버튼 */}
                            <div className="flex gap-4 pt-6">
                                <button 
                                    type="button" 
                                    onClick={() => navigate(-1)} 
                                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    이전으로
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? '결제 진행 중...' : `₩${formatPrice(finalPrice)} 결제하기`}
                                </button>
                            </div>

                            {/* 개발자용 테스트 버튼 */}
                            <div className="border-t pt-6 text-center">
                                <p className="text-sm text-gray-500 mb-3">🔧 개발자 테스트용</p>
                                <button 
                                    type="button" 
                                    onClick={handleTestPaymentSuccess}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                >
                                    결제 완료 테스트
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckoutPage