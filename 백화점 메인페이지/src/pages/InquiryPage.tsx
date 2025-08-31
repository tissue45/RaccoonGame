import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiMessageSquare, FiFileText, FiUpload, FiX, FiSearch, FiHeart, FiHash, FiShoppingBag } from 'react-icons/fi'

interface InquiryForm {
  inquiryType: string
  productSearch: string
  title: string
  content: string
  imageFile: File | null
  email: string
  emailDomain: string
  customEmailDomain: string
  phone1: string
  phone2: string
  phone3: string
  smsNotification: boolean
  noProduct: boolean
}

interface Order {
  id: string
  user_id: string
  order_date: string
  status: string
  total_amount: number
  items: Array<{
    product_id: number
    name: string
    price: number
    quantity: number
    image: string
  }>
}

const InquiryPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<InquiryForm>({
    inquiryType: '',
    productSearch: '',
    title: '',
    content: '',
    imageFile: null,
    email: '',
    emailDomain: 'naver.com',
    customEmailDomain: '',
    phone1: '010',
    phone2: '',
    phone3: '',
    smsNotification: false,
    noProduct: false
  })

  const [showCustomEmail, setShowCustomEmail] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  useEffect(() => {
    // 주문 내역 가져오기
    const savedOrders = localStorage.getItem('orders')
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders)
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const user = JSON.parse(currentUser)
        const userOrders = allOrders.filter((order: Order) => 
          order.user_id === user.id || order.user_id === user.email || order.user_id === user.name
        )
        setOrders(userOrders)
      }
    }
  }, [])

  const inquiryTypes = [
    '회원',
    '상품',
    '주문/결제',
    '배송'
  ]

  const phonePrefixes = ['010', '011', '016', '017', '018', '019']
  const emailDomains = ['naver.com', 'gmail.com', 'daum.net', 'hanmail.net', 'hotmail.com']

  const handleInputChange = (field: keyof InquiryForm, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setCharCount(content.length)
    handleInputChange('content', content)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      // 파일 크기 체크 (1MB)
      if (file.size > 1024 * 1024) {
        alert('파일 크기는 1MB 이하여야 합니다.')
        return
      }
      // 파일 확장자 체크
      const allowedExtensions = ['jpg', 'jpeg', 'png']
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        alert('jpg, jpeg, png 파일만 업로드 가능합니다.')
        return
      }
      handleInputChange('imageFile', file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.inquiryType) {
      alert('문의 유형을 선택해주세요.')
      return
    }
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    if (!formData.content.trim()) {
      alert('문의 내용을 입력해주세요.')
      return
    }
    if (!formData.email.trim()) {
      alert('이메일을 입력해주세요.')
      return
    }

    // 문의 데이터 생성
    const newInquiry = {
      id: Date.now().toString(), // 간단한 ID 생성
      inquiryType: formData.inquiryType,
      title: formData.title,
      content: formData.content,
      inquiryDate: new Date().toISOString(),
      replyStatus: '답변대기' as const,
      email: formData.email,
      phone: formData.phone1 + '-' + formData.phone2 + '-' + formData.phone3,
      smsNotification: formData.smsNotification,
      imageFile: formData.imageFile
    }

    // localStorage에서 기존 문의 내역 가져오기
    const existingInquiries = localStorage.getItem('inquiries')
    const inquiries = existingInquiries ? JSON.parse(existingInquiries) : []
    
    // 새 문의 추가
    inquiries.push(newInquiry)
    
    // localStorage에 저장
    localStorage.setItem('inquiries', JSON.stringify(inquiries))
    
    console.log('문의 제출:', newInquiry)
    alert('문의가 성공적으로 접수되었습니다.')
    navigate('/inquiry-history')
  }

  const removeFile = () => {
    handleInputChange('imageFile', null)
  }

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product)
    setShowOrderModal(false)
    // 선택된 상품 정보를 문의 상품 필드에 설정
    handleInputChange('productSearch', product.name)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  return (
    <div className="py-10 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-5">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8">
          <span className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" onClick={() => navigate('/')}>Home</span>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" onClick={() => navigate('/mypage')}>마이페이지</span>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600">1:1 문의하기</span>
        </div>

        <div className="flex gap-8">
          {/* 사이드바 */}
          <aside className="bg-white rounded-lg p-8 shadow-lg w-64 flex-shrink-0">
            <div className="mb-8 pb-5 border-b-2 border-gray-800">
              <h3 className="text-2xl font-bold text-gray-800 m-0">고객센터</h3>
            </div>
            
            <nav>
              <div className="mb-8">
                <h4 className="text-base font-semibold text-gray-800 m-0 mb-4">1:1 문의</h4>
                <ul className="list-none p-0 m-0">
                  <li className="mb-1">
                    <Link
                      to="/inquiry"
                      className="text-sm text-gray-800 bg-gray-100 font-medium py-3 px-4 block transition-all duration-300 rounded-md"
                    >
                      1:1 문의하기
                    </Link>
                  </li>
                  <li className="mb-1">
                    <Link
                      to="/inquiry-history"
                      className="text-sm text-gray-600 py-3 px-4 block transition-all duration-300 rounded-md hover:text-gray-800 hover:bg-gray-50"
                    >
                      1:1 문의내역
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 m-0">1:1 문의하기</h1>
                <Link
                  to="/inquiry-history"
                  className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <FiMessageSquare size={18} />
                  1:1 문의내역
                </Link>
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed">
                문의사항에 대해 빠르게 답변 드리겠습니다. 답변은 이메일로 확인하시거나, 
                고객센터 &gt; 1:1 문의내역에서 확인하실 수 있습니다.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 문의 유형 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    문의 유형 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => handleInputChange('inquiryType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  >
                    <option value="">선택하세요</option>
                    {inquiryTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* 문의 상품 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">문의 상품</label>
                  
                  {/* 주문상품 찾기 섹션 */}
                  <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">주문상품 찾기</h3>
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => setShowOrderModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <FiShoppingBag size={16} />
                        주문상품에서 찾기
                      </button>
                      <span className="text-sm text-gray-600">
                        총 {orders.length}건의 주문이 있습니다
                      </span>
                    </div>
                    
                                         {/* 선택된 상품 표시 */}
                     {selectedProduct && (
                       <div className="p-4 bg-white rounded-lg border border-gray-200">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <img 
                               src={selectedProduct.image} 
                               alt={selectedProduct.name} 
                               className="w-12 h-12 object-cover rounded"
                             />
                             <div>
                               <div className="mb-1">
                                 <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded">프리미엄</span>
                               </div>
                               <p className="font-medium text-gray-800">{selectedProduct.name}</p>
                               <p className="text-sm text-gray-600">
                                 {formatPrice(selectedProduct.price)} × {selectedProduct.quantity}개
                               </p>
                             </div>
                           </div>
                           <button
                             type="button"
                             onClick={() => {
                               setSelectedProduct(null)
                               handleInputChange('productSearch', '')
                             }}
                             className="text-gray-400 hover:text-gray-600"
                           >
                             <FiX size={20} />
                           </button>
                         </div>
                       </div>
                     )}
                  </div>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.noProduct}
                      onChange={(e) => handleInputChange('noProduct', e.target.checked)}
                      className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-800"
                    />
                    <span className="text-sm text-gray-600">선택할 상품 없음</span>
                  </label>
                </div>

                {/* 제목 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="문의 제목을 입력해주세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  />
                </div>

                {/* 문의 내용 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    문의 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="문의 내용을 자세히 입력해주세요"
                    rows={8}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent resize-none"
                  />
                  <div className="text-right text-sm text-gray-500 mt-2">
                    {charCount}/500자
                  </div>
                </div>

                {/* 이미지 첨부 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">이미지 첨부</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      id="fileInput"
                    />
                    <label
                      htmlFor="fileInput"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      찾아보기
                    </label>
                    {formData.imageFile && (
                      <button
                        type="button"
                        onClick={removeFile}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                      >
                        <FiX size={16} />
                        취소
                      </button>
                    )}
                  </div>
                  {formData.imageFile && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiFileText size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-700">{formData.imageFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(formData.imageFile.size / 1024).toFixed(1)}KB)
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    확장자는 jpg (jpeg), png 파일만 가능합니다. (용량 1MB 이내)
                  </p>
                </div>

                {/* 이메일 답변 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    이메일 답변 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="이메일 주소"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    />
                    <span className="text-2xl text-gray-400 self-center">@</span>
                    {showCustomEmail ? (
                      <input
                        type="text"
                        value={formData.customEmailDomain}
                        onChange={(e) => handleInputChange('customEmailDomain', e.target.value)}
                        placeholder="직접입력"
                        className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      />
                    ) : (
                      <select
                        value={formData.emailDomain}
                        onChange={(e) => handleInputChange('emailDomain', e.target.value)}
                        className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      >
                        {emailDomains.map((domain, index) => (
                          <option key={index} value={domain}>{domain}</option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowCustomEmail(!showCustomEmail)}
                      className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      직접입력
                    </button>
                  </div>
                </div>

                {/* SMS 답변알림 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">SMS 답변알림</label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={formData.phone1}
                      onChange={(e) => handleInputChange('phone1', e.target.value)}
                      className="w-20 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    >
                      {phonePrefixes.map((prefix, index) => (
                        <option key={index} value={prefix}>{prefix}</option>
                      ))}
                    </select>
                    <span className="text-gray-400">-</span>
                    <input
                      type="text"
                      value={formData.phone2}
                      onChange={(e) => handleInputChange('phone2', e.target.value)}
                      placeholder="0000"
                      maxLength={4}
                      className="w-20 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-center"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="text"
                      value={formData.phone3}
                      onChange={(e) => handleInputChange('phone3', e.target.value)}
                      placeholder="0000"
                      maxLength={4}
                      className="w-20 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-center"
                    />
                    <label className="flex items-center gap-2 ml-4">
                      <input
                        type="checkbox"
                        checked={formData.smsNotification}
                        onChange={(e) => handleInputChange('smsNotification', e.target.checked)}
                        className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-800"
                      />
                      <span className="text-sm text-gray-600">SMS 답변알림 받기</span>
                    </label>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gray-800 text-white py-4 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    문의하기
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/mypage')}
                    className="flex-1 bg-white text-gray-700 py-4 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>

        {/* 주문상품 선택 모달 */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 m-0">주문상품 선택</h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <span className="text-sm text-gray-600">주문일: {formatDate(order.order_date)}</span>
                            <span className="mx-2 text-gray-400">|</span>
                            <span className="text-sm text-gray-600">주문번호: {order.id}</span>
                            <span className="mx-2 text-gray-400">|</span>
                            <span className="text-sm text-gray-600">총 금액: {formatPrice(order.total_amount)}원</span>
                          </div>
                                                     <span className={`px-2 py-1 rounded text-xs font-medium border ${
                             order.status === '결제완료' ? 'border-gray-800 text-gray-800 bg-white' : 'border-gray-300 text-gray-800 bg-white'
                           }`}>
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="grid gap-3">
                          {order.items.map((item, index) => (
                            <div 
                              key={index}
                              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleProductSelect(item)}
                            >
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 mb-1">{item.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {formatPrice(item.price)} × {item.quantity}개
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">
                                  {formatPrice(item.price * item.quantity)}원
                                </p>
                                <button className="mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700 transition-colors">
                                  선택
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-600 mb-4">주문 내역이 없습니다.</p>
                    <Link
                      to="/"
                      className="inline-block bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      쇼핑하러 가기
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InquiryPage
