import React, { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { FiXCircle, FiHome, FiRefreshCw } from 'react-icons/fi'

const PaymentFailPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [errorInfo, setErrorInfo] = useState<any>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const message = searchParams.get('message')
    const orderId = searchParams.get('orderId')

    setErrorInfo({
      code,
      message: message || '결제 처리 중 오류가 발생했습니다.',
      orderId,
    })
  }, [searchParams])

  const handleRetryPayment = () => {
    // 이전 페이지(체크아웃)로 돌아가기
    navigate(-1)
  }

  const getErrorMessage = (code: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '사용자가 결제를 취소했습니다.'
      case 'PAY_PROCESS_ABORTED':
        return '결제 진행 중 오류가 발생했습니다.'
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 결제를 거절했습니다.'
      case 'INVALID_CARD_COMPANY':
        return '유효하지 않은 카드입니다.'
      case 'NOT_SUPPORTED_INSTALLMENT':
        return '지원하지 않는 할부 개월수입니다.'
      case 'EXCEED_MAX_DAILY_PAYMENT_COUNT':
        return '일일 결제 한도를 초과했습니다.'
      case 'NOT_AVAILABLE_PAYMENT':
        return '현재 결제할 수 없는 상태입니다.'
      default:
        return errorInfo?.message || '결제 처리 중 오류가 발생했습니다.'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-red-500 mb-8">
            <FiXCircle size={64} className="mx-auto" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">결제에 실패했습니다</h1>
          <p className="text-gray-600 mb-12">
            {getErrorMessage(errorInfo?.code)}
          </p>

          {errorInfo?.orderId && (
            <div className="bg-red-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-4">오류 정보</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문번호</span>
                  <span className="font-medium text-gray-900">{errorInfo.orderId}</span>
                </div>
                {errorInfo.code && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">오류코드</span>
                    <span className="font-medium text-red-600">{errorInfo.code}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 mb-12">
            <button 
              onClick={handleRetryPayment} 
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <FiRefreshCw size={18} />
              다시 결제하기
            </button>
            <Link to="/" className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              <FiHome size={18} />
              홈으로
            </Link>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6 text-left">
            <h4 className="font-bold text-gray-900 mb-4">결제 문제 해결 방법</h4>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>• 카드 한도 및 잔액을 확인해 주세요</li>
              <li>• 다른 결제 수단을 이용해 보세요</li>
              <li>• 문제가 지속되면 고객센터로 문의해 주세요</li>
            </ul>
            
            <div className="border-t border-yellow-200 pt-4">
              <p className="text-sm text-gray-600 font-medium">고객센터: 1588-1234 (평일 09:00-18:00)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailPage