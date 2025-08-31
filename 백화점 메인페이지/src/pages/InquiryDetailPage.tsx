import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiMessageSquare, FiFileText, FiX, FiDownload } from 'react-icons/fi'

interface Inquiry {
  id: string
  inquiryType: string
  title: string
  content: string
  inquiryDate: string
  replyStatus: '답변대기' | '답변완료'
  email: string
  phone: string
  smsNotification: boolean
  imageFile: File | null
  productSearch?: string
}

const InquiryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      // localStorage에서 문의 내역 가져오기
      const savedInquiries = localStorage.getItem('inquiries')
      if (savedInquiries) {
        const inquiries = JSON.parse(savedInquiries)
        const foundInquiry = inquiries.find((inq: Inquiry) => inq.id === id)
        if (foundInquiry) {
          setInquiry(foundInquiry)
        } else {
          alert('문의를 찾을 수 없습니다.')
          navigate('/inquiry-history')
        }
      } else {
        alert('문의 내역이 없습니다.')
        navigate('/inquiry-history')
      }
      setLoading(false)
    }
  }, [id, navigate])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '답변대기':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case '답변완료':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case '답변대기':
        return '답변 대기 중'
      case '답변완료':
        return '답변 완료'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="py-10 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="py-10 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">문의를 찾을 수 없습니다.</p>
          <Link
            to="/inquiry-history"
            className="inline-block bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            문의내역으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-10 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-5">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8">
          <span className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" onClick={() => navigate('/')}>Home</span>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" onClick={() => navigate('/mypage')}>마이페이지</span>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" onClick={() => navigate('/inquiry-history')}>1:1 문의내역</span>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600">문의 상세</span>
        </div>

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/inquiry-history')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft size={20} />
            문의내역으로 돌아가기
          </button>
          <Link
            to="/inquiry"
            className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <FiMessageSquare size={18} />
            새 문의하기
          </Link>
        </div>

        {/* 문의 상세 내용 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 문의 헤더 */}
          <div className="bg-gray-800 text-white p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{inquiry.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span>문의일: {formatDate(inquiry.inquiryDate)}</span>
                  <span>문의유형: {inquiry.inquiryType}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(inquiry.replyStatus)}`}>
                {getStatusText(inquiry.replyStatus)}
              </span>
            </div>
          </div>

          {/* 문의 내용 */}
          <div className="p-6">
            {/* 문의 상품 정보 */}
            {inquiry.productSearch && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">문의 상품</h3>
                <p className="text-gray-700">{inquiry.productSearch}</p>
              </div>
            )}

            {/* 문의 내용 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">문의 내용</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{inquiry.content}</p>
              </div>
            </div>

            {/* 첨부 파일 */}
            {inquiry.imageFile && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">첨부 파일</h3>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <FiFileText size={20} className="text-gray-600" />
                  <span className="text-gray-700">{inquiry.imageFile.name}</span>
                  <span className="text-sm text-gray-500">
                    ({(inquiry.imageFile.size / 1024).toFixed(1)}KB)
                  </span>
                  <button className="ml-auto px-3 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors flex items-center gap-1">
                    <FiDownload size={14} />
                    다운로드
                  </button>
                </div>
              </div>
            )}

            {/* 연락처 정보 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">연락처 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">이메일</h4>
                  <p className="text-gray-800">{inquiry.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">연락처</h4>
                  <p className="text-gray-800">{inquiry.phone}</p>
                </div>
              </div>
              {inquiry.smsNotification && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">✓ SMS 답변알림을 받기로 설정했습니다.</p>
                </div>
              )}
            </div>

            {/* 답변 영역 */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">답변</h3>
              {inquiry.replyStatus === '답변완료' ? (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">답변 완료</span>
                  </div>
                  <p className="text-green-700">답변이 완료되었습니다. 이메일로 답변 내용을 확인해주세요.</p>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-yellow-800">답변 대기 중</span>
                  </div>
                  <p className="text-yellow-700">문의하신 내용에 대해 빠른 시일 내에 답변 드리겠습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate('/inquiry-history')}
            className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
          >
            목록으로 돌아가기
          </button>
          <Link
            to="/inquiry"
            className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium text-center"
          >
            새 문의하기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default InquiryDetailPage
