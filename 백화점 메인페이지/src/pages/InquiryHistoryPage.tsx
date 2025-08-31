import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiMessageSquare, FiPlus, FiSearch, FiCalendar, FiFileText, FiShoppingBag, FiX } from 'react-icons/fi'

interface Inquiry {
  id: string
  inquiryType: string
  title: string
  inquiryDate: string
  replyStatus: '답변대기' | '답변완료'
  replyDate?: string
  content: string
  replyContent?: string
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

const InquiryHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  
 

  useEffect(() => {
    // 로컬스토리지에서 문의 내역과 주문 내역 가져오기
    const savedInquiries = localStorage.getItem('inquiries')
    console.log('저장된 문의 내역:', savedInquiries)
    
    if (savedInquiries) {
      const parsedInquiries = JSON.parse(savedInquiries)
      console.log('파싱된 문의 내역:', parsedInquiries)
      setInquiries(parsedInquiries)
    } else {
      console.log('문의 내역이 localStorage에 없습니다.')
    }

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
    
    setLoading(false)
  }, [])

  const inquiryTypes = [
    '회원',
    '상품',
    '주문/결제',
    '배송'
  ]

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || inquiry.inquiryType === filterType
    const matchesStatus = filterStatus === 'all' || inquiry.replyStatus === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  // 디버깅을 위한 로그
  console.log('전체 문의 내역:', inquiries)
  console.log('필터링된 문의 내역:', filteredInquiries)
  console.log('검색어:', searchTerm)
  console.log('필터 타입:', filterType)
  console.log('필터 상태:', filterStatus)

  const getStatusBadge = (status: string) => {
    if (status === '답변대기') {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">답변대기</span>
    } else {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">답변완료</span>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product)
    setShowOrderModal(false)
    // 선택된 상품 정보를 문의 작성 페이지로 전달할 수 있도록 처리
    console.log('선택된 상품:', product)
  }

  const handleDeleteInquiries = () => {
    if (confirm('저장된 모든 문의를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      localStorage.removeItem('inquiries')
      setInquiries([])
      alert('저장된 모든 문의가 삭제되었습니다.')
    }
  }



  if (loading) {
    return (
      <div className="py-10 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">문의 내역을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-10 min-h-screen bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto px-5 w-full box-border">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8">
          <span className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" onClick={() => navigate('/')}>Home</span>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" onClick={() => navigate('/mypage')}>마이페이지</span>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600">1:1 문의내역</span>
        </div>

        <div className="flex gap-8 items-start w-full">
          {/* 사이드바 */}
          <div className="bg-white rounded-lg p-8 h-fit shadow-lg w-64 flex-shrink-0 relative z-10">
            <div className="mb-8 pb-5 border-b-2 border-gray-800">
              <h3 className="text-2xl font-bold text-gray-800 m-0">마이룸</h3>
              <p className="text-sm text-gray-600 m-0">MY ROOM</p>
            </div>
            
            <nav>
              <div className="mb-8">
                <h4 className="text-base font-semibold text-gray-800 m-0 mb-4">주문현황</h4>
                <ul className="list-none p-0 m-0">
                  <li className="mb-1">
                    <Link
                      to="/order-tracking"
                      className="text-sm text-gray-600 py-3 px-4 block transition-all duration-300 rounded-md hover:text-gray-800 hover:bg-gray-50"
                    >
                      주문확인/배송조회
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mb-8">
                <h4 className="text-base font-semibold text-gray-800 m-0 mb-4">쇼핑통장</h4>
                <ul className="list-none p-0 m-0">
                  <li className="mb-1">
                    <Link
                      to="/coupons"
                      className="text-sm text-gray-600 py-3 px-4 block transition-all duration-300 rounded-md hover:text-gray-800 hover:bg-gray-50"
                    >
                      쿠폰
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mb-8">
                <h4 className="text-base font-semibold text-gray-800 m-0 mb-4">쇼핑백</h4>
                <ul className="list-none p-0 m-0">
                  <li className="mb-1">
                    <Link
                      to="/wishlist"
                      className="text-sm text-gray-600 py-3 px-4 block transition-all duration-300 rounded-md hover:text-gray-800 hover:bg-gray-50"
                    >
                      찜
                    </Link>
                  </li>
                  <li className="mb-1">
                    <Link
                      to="/recent"
                      className="text-sm text-gray-600 py-3 px-4 block transition-all duration-300 rounded-md hover:text-gray-800 hover:bg-gray-50"
                    >
                      최근 본 상품
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mb-8">
                <h4 className="text-base font-semibold text-gray-800 m-0 mb-4">나의 정보</h4>
                <ul className="list-none p-0 m-0">
                                     <li className="mb-1">
                      <Link
                        to="/mypage?modal=userInfo"
                        className="text-sm text-gray-600 py-3 px-4 block transition-all duration-300 rounded-md hover:text-gray-800 hover:bg-gray-50"
                      >
                        회원정보변경
                      </Link>
                    </li>
                   <li className="mb-1">
                     <Link
                       to="/inquiry-history"
                       className="text-sm text-gray-800 bg-gray-100 font-medium py-3 px-4 block transition-all duration-300 rounded-md"
                     >
                       1:1 문의내역
                     </Link>
                   </li>
                 </ul>
               </div>
             </nav>
           </div>

           {/* 메인 콘텐츠 */}
           <div className="flex-1 bg-white rounded-lg p-8 shadow-lg min-h-[500px]">
             <div className="flex justify-between items-center mb-6">
               <h1 className="text-3xl font-bold text-gray-800 m-0">1:1 문의내역</h1>
               <Link
                 to="/inquiry"
                 className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
               >
                 <FiPlus size={18} />
                 1:1 문의하기
               </Link>
             </div>

             {/* 검색 및 필터 */}
             <div className="mb-6 p-6 bg-gray-50 rounded-lg">
               <div className="flex gap-4 items-center mb-4">
                 <div className="flex-1">
                   <div className="relative">
                     <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                     <input
                       type="text"
                       placeholder="문의 제목 또는 내용으로 검색"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                     />
                   </div>
                 </div>
                 <select
                   value={filterType}
                   onChange={(e) => setFilterType(e.target.value)}
                   className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                 >
                   <option value="all">전체 문의유형</option>
                   {inquiryTypes.map((type, index) => (
                     <option key={index} value={type}>{type}</option>
                   ))}
                 </select>
                 <select
                   value={filterStatus}
                   onChange={(e) => setFilterStatus(e.target.value)}
                   className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                 >
                   <option value="all">전체 상태</option>
                   <option value="답변대기">답변대기</option>
                   <option value="답변완료">답변완료</option>
                 </select>
               </div>
             </div>

             {/* 문의 내역 테이블 */}
             {filteredInquiries.length > 0 ? (
               <div className="overflow-x-auto">
                 <table className="w-full">
                   <thead>
                     <tr className="bg-gray-50 border-b border-gray-200">
                       <th className="text-left py-4 px-6 font-semibold text-gray-800">문의일</th>
                       <th className="text-left py-4 px-6 font-semibold text-gray-800">문의유형</th>
                       <th className="text-left py-4 px-6 font-semibold text-gray-800">제목</th>
                       <th className="text-left py-4 px-6 font-semibold text-gray-800">답변여부</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredInquiries.map((inquiry) => (
                       <tr key={inquiry.id} className="border-b border-gray-100 hover:bg-gray-50">
                         <td className="py-4 px-6 text-sm text-gray-600">
                           {formatDate(inquiry.inquiryDate)}
                         </td>
                         <td className="py-4 px-6 text-sm text-gray-600">
                           {inquiry.inquiryType}
                         </td>
                                                       <td className="py-4 px-6">
                           <Link
                             to={`/inquiry/${inquiry.id}`}
                             className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors cursor-pointer"
                           >
                             <FiFileText size={16} className="text-gray-400" />
                             <span className="text-sm font-medium">{inquiry.title}</span>
                           </Link>
                         </td>
                         <td className="py-4 px-6">
                           {getStatusBadge(inquiry.replyStatus)}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ) : (
               <div className="text-center py-20">
                 <h3 className="text-2xl font-semibold text-gray-800 mb-3">문의내역이 없습니다</h3>
                 <p className="text-gray-600 mb-4">아직 등록된 문의가 없습니다.</p>
                 <div className="text-sm text-gray-500 mb-8">
                   <p>• 문의를 작성하면 여기에 표시됩니다</p>
                   <p>• 문의 작성 후 답변을 기다릴 수 있습니다</p>
                 </div>
               </div>
             )}

             {/* 문의 삭제 버튼 */}
             <div className="pt-8 border-t border-gray-200">
               <button
                 onClick={handleDeleteInquiries}
                 className="w-full bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium"
               >
                 저장된 문의 모두 삭제
               </button>
               <p className="text-xs text-gray-500 text-center mt-3">
                 ⚠️ 이 버튼을 클릭하면 저장된 모든 문의가 영구적으로 삭제됩니다
               </p>
             </div>
           </div>
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
                           <span className={`px-2 py-1 rounded text-xs font-medium ${
                             order.status === '결제완료' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
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
                                 <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
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
                     <div className="text-4xl mb-4">📦</div>
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

 export default InquiryHistoryPage
