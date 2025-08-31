import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import UserInfoModal from '../components/UserInfoModal'
import { getUserOrders, migrateLocalOrdersToDatabase, Order, OrderItem, updateOrderStatus, cancelOrder } from '../services/orderService'
import { useUser } from '../context/UserContext'


const OrderTracking: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [searchPeriod, setSearchPeriod] = useState('1month')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [productSearch, setProductSearch] = useState('')
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [loading, setLoading] = useState(true)
    const [showUserInfoModal, setShowUserInfoModal] = useState(false)
    const navigate = useNavigate()
    const { currentUser } = useUser()

    const handlePersonalInfoClick = (menuItem: string) => {
      if (menuItem === '회원정보변경') {
        setShowUserInfoModal(true)
      }
    }

    const handleUserUpdate = (updatedUser: any) => {
      // 사용자 정보 업데이트 후 주문 목록 새로고침
      loadOrders()
    }

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        try {
            const success = await updateOrderStatus(orderId, newStatus)
            if (success) {
                // 주문 목록 새로고침
                loadOrders()
                alert('주문 상태가 업데이트되었습니다.')
            } else {
                alert('주문 상태 업데이트에 실패했습니다.')
            }
        } catch (error) {
            console.error('주문 상태 업데이트 중 오류 발생:', error)
            alert('주문 상태 업데이트 중 오류가 발생했습니다.')
        }
    }

    const handleCancelOrder = async (orderId: string) => {
        const reason = prompt('주문 취소 사유를 입력해주세요:')
        if (!reason) return

        try {
            const success = await cancelOrder(orderId, reason)
            if (success) {
                // 주문 목록 새로고침
                loadOrders()
                alert('주문이 취소되었습니다.')
            } else {
                alert('주문 취소에 실패했습니다.')
            }
        } catch (error) {
            console.error('주문 취소 중 오류 발생:', error)
            alert('주문 취소 중 오류가 발생했습니다.')
        }
    }

    const loadOrders = async () => {
        try {
            if (!currentUser) {
                navigate('/login')
                return
            }
            
            // 데이터베이스에서 사용자 주문 데이터 가져오기
            let userOrders = await getUserOrders(currentUser.id || currentUser.email || currentUser.name)
            
            // 데이터베이스에 주문이 없으면 로컬스토리지에서 마이그레이션 시도
            if (userOrders.length === 0) {
                console.log('데이터베이스에 주문이 없어 로컬스토리지에서 마이그레이션을 시도합니다.')
                const migratedCount = await migrateLocalOrdersToDatabase(currentUser.id || currentUser.email || currentUser.name)
                if (migratedCount > 0) {
                    console.log(`${migratedCount}개의 주문이 데이터베이스로 마이그레이션되었습니다.`)
                    userOrders = await getUserOrders(currentUser.id || currentUser.email || currentUser.name)
                }
            }
            
            setOrders(userOrders)
        } catch (error) {
            console.error('주문 데이터를 가져오는 중 오류 발생:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (currentUser) {
            loadOrders()
        }
    }, [currentUser])

    useEffect(() => {
        // 기본 날짜 설정 (최근 1개월)
        const today = new Date()
        const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
        
        setEndDate(today.toISOString().split('T')[0])
        setStartDate(oneMonthAgo.toISOString().split('T')[0])
    }, [])

    const handlePeriodChange = (period: string) => {
        setSearchPeriod(period)
        const today = new Date()
        let startDate = new Date()

        switch (period) {
            case '1month':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
                break
            case '3months':
                startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
                break
            case '6months':
                startDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())
                break
            case 'all':
                startDate = new Date(2020, 0, 1)
                break
        }

        setStartDate(startDate.toISOString().split('T')[0])
        setEndDate(today.toISOString().split('T')[0])
    }

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: { text: string; className: string } } = {
            '주문접수': { text: '주문접수', className: 'bg-yellow-100 text-yellow-800' },
            '결제완료': { text: '결제완료', className: 'bg-blue-100 text-blue-800' },
            '상품준비': { text: '상품준비', className: 'bg-red-100 text-red-800' },
            '배송중': { text: '배송중', className: 'bg-blue-100 text-blue-800' },
            '배송완료': { text: '배송완료', className: 'bg-green-100 text-green-800' }
        }
        
        const statusInfo = statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' }
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>{statusInfo.text}</span>
    }

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.order_date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        
        // 날짜 비교를 위해 시간을 제거하고 날짜만 비교
        const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate())
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())
        
        const dateMatch = orderDateOnly >= startDateOnly && orderDateOnly <= endDateOnly
        const productMatch = productSearch === '' || 
            order.items.some(item => item.name.toLowerCase().includes(productSearch.toLowerCase()))
        
        return dateMatch && productMatch
    })

    const cleanupDuplicateOrders = async () => {
        // localStorage 제거
        // const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        // const user = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser') || '') : null
        // const userOrders = allOrders.filter((order: Order) => 
        //     user && (order.user_id === user.id || order.user_id === user.email || order.user_id === user.name)
        // )

        // const seenOrderIds = new Set<string>()
        // const uniqueOrders: Order[] = []

        // userOrders.forEach(order => {
        //     if (!seenOrderIds.has(order.id)) {
        //         uniqueOrders.push(order)
        //         seenOrderIds.add(order.id)
        //     }
        // })

        // // 데이터베이스에서 주문 데이터 다시 가져오기
        // try {
        //     const userOrders = await getUserOrders(user.id || user.email || user.name)
        //     setOrders(userOrders)
        //     alert('주문 데이터가 데이터베이스에서 새로고침되었습니다.')
        // } catch (error) {
        //     console.error('주문 데이터 새로고침 중 오류 발생:', error)
        //     alert('주문 데이터 새로고침에 실패했습니다.')
        // }
    }

    if (loading) {
        return (
            <div className="py-10 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">주문 내역을 불러오는 중...</p>
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
                    <span className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" onClick={() => navigate('/mypage')}>MyPage</span>
                    <span className="mx-2 text-gray-400">&gt;</span>
                    <span className="text-gray-600">주문확인/배송조회</span>
                </div>

                <div className="flex gap-8 items-start w-full">
                    {/* 사이드바 */}
                    <Sidebar onPersonalInfoClick={handlePersonalInfoClick} />

                    {/* 메인 콘텐츠 */}
                    <main className="flex-1 bg-white rounded-lg p-8 shadow-lg min-h-[500px]">
                        {/* 페이지 헤더 */}
                        <div className="mb-10">
                            <h1 className="text-3xl font-bold text-gray-800 m-0 mb-3">주문확인 / 배송조회</h1>
                            <p className="text-base text-gray-600 m-0">고객님의 주문내역을 확인하실 수 있습니다.</p>
                            
                            {/* 테스트용 주문 데이터 생성 버튼 */}
                            <div className="mt-4">
                                <button 
                                    onClick={() => {
                                        if (currentUser) {
                                            const testOrder: Order = {
                                                id: `TEST_ORDER_${Date.now()}`,
                                                user_id: currentUser.id || currentUser.email || currentUser.name,
                                                order_date: new Date().toISOString(),
                                                status: '결제완료',
                                                total_amount: 50000,
                                                payment_method: '카드',
                                                payment_key: `TEST_PAYMENT_${Date.now()}`,
                                                items: [
                                                    {
                                                        product_id: 999,
                                                        name: '테스트 상품',
                                                        price: 50000,
                                                        quantity: 1,
                                                        image: '/placeholder-image.jpg'
                                                    }
                                                ],
                                                shipping_address: '테스트 주소',
                                                recipient_name: currentUser.name,
                                                recipient_phone: '010-1234-5678',
                                                created_at: new Date().toISOString(),
                                                updated_at: new Date().toISOString()
                                            }
                                            
                                            // localStorage 제거
                                            // const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
                                            // const updatedOrders = [...existingOrders, testOrder]
                                            // localStorage.setItem('orders', JSON.stringify(updatedOrders))
                                            
                                            alert('테스트 주문이 추가되었습니다! 페이지를 새로고침하세요.')
                                        }
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                >
                                    테스트 주문 추가
                                </button>
                                
                                {/* 중복 데이터 정리 버튼 */}
                                <button 
                                    onClick={cleanupDuplicateOrders}
                                    className="ml-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors"
                                >
                                    중복 데이터 정리
                                </button>
                                
                                {/* 디버깅 정보 버튼 */}
                                <button 
                                    onClick={() => {
                                        // localStorage 제거
                                        // const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
                                        // const user = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser') || '') : null
                                        // const userOrders = allOrders.filter((order: Order) => 
                                        //     user && (order.user_id === user.id || order.user_id === user.email || order.user_id === user.name)
                                        // )
                                        alert(`디버깅 정보:\n현재 사용자: ${currentUser ? currentUser.email || currentUser.name : '없음'}`)
                                    }}
                                    className="ml-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                                >
                                    디버깅 정보
                                </button>
                                
                                {/* 로컬스토리지 초기화 버튼 */}
                                <button 
                                    onClick={() => {
                                        if (confirm('로컬스토리지의 모든 주문 데이터를 삭제하시겠습니까?')) {
                                            // localStorage.removeItem('orders')
                                            // localStorage.removeItem('processedPayments')
                                            setOrders([])
                                            alert('모든 주문 데이터가 삭제되었습니다.')
                                        }
                                    }}
                                    className="ml-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                                >
                                    데이터 초기화
                                </button>
                            </div>
                        </div>

                        {/* 검색 필터 */}
                        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <span className="text-sm font-semibold text-gray-700 min-w-20">조회기간</span>
                                    <div className="flex gap-2">
                                        <button 
                                            className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 ${
                                                searchPeriod === '1month' 
                                                    ? 'bg-gray-800 text-white shadow-md' 
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                            }`}
                                            onClick={() => handlePeriodChange('1month')}
                                        >
                                            1개월
                                        </button>
                                        <button 
                                            className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 ${
                                                searchPeriod === '3months' 
                                                    ? 'bg-gray-800 text-white shadow-md' 
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                            }`}
                                            onClick={() => handlePeriodChange('3months')}
                                        >
                                            3개월
                                        </button>
                                        <button 
                                            className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 ${
                                                searchPeriod === '6months' 
                                                    ? 'bg-gray-800 text-white shadow-md' 
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                            }`}
                                            onClick={() => handlePeriodChange('6months')}
                                        >
                                            6개월
                                        </button>
                                        <button 
                                            className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 ${
                                                searchPeriod === 'all' 
                                                    ? 'bg-gray-800 text-white shadow-md' 
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                            }`}
                                            onClick={() => handlePeriodChange('all')}
                                        >
                                            전체보기
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="date" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                    />
                                    <span className="text-gray-500">~</span>
                                    <input 
                                        type="date" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                    />
                                </div>
                                
                                <div className="flex items-center gap-5">
                                    <span className="text-sm font-semibold text-gray-700 min-w-20">상품명</span>
                                    <input 
                                        type="text" 
                                        placeholder="주문상품명 입력" 
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                    />
                                    <select 
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    >
                                        <option value={10}>10개</option>
                                        <option value={20}>20개</option>
                                        <option value={50}>50개</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 결과 헤더 */}
                        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-6 py-4 mb-6">
                            <span className="text-sm text-gray-600">총 {filteredOrders.length}건</span>
                        </div>

                        {/* 주문 목록 */}
                        <div className="space-y-6">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.slice(0, itemsPerPage).map((order) => (
                                    <div key={order.id} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-base font-semibold text-gray-800">
                                                    {new Date(order.order_date).toLocaleDateString('ko-KR')}
                                                </span>
                                                <span className="text-sm text-gray-600">주문번호: {order.id || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {getStatusBadge(order.status)}
                                                {order.status !== '주문취소' && order.status !== '배송완료' && (
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => order.id && handleStatusUpdate(order.id, e.target.value as Order['status'])}
                                                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="주문접수">주문접수</option>
                                                        <option value="결제완료">결제완료</option>
                                                        <option value="상품준비">상품준비</option>
                                                        <option value="배송중">배송중</option>
                                                        <option value="배송완료">배송완료</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {order.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex items-center gap-8 mb-4 last:mb-0">
                                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-base font-semibold text-gray-800 mb-2">{item.name}</h4>
                                                    <p className="text-sm text-gray-600 mb-1">수량: {item.quantity}개</p>
                                                    <p className="text-sm text-gray-600">단가: {item.price.toLocaleString()}원</p>
                                                </div>
                                                <div className="text-center min-w-32">
                                                    <span className="text-xl font-bold text-gray-800">
                                                        {(item.price * item.quantity).toLocaleString()}원
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-2 min-w-32">
                                                    {order.status === '배송중' && (
                                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                                            배송조회
                                                        </button>
                                                    )}
                                                    {order.status === '배송완료' && (
                                                        <>
                                                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                                                교환/반품
                                                            </button>
                                                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                                                상품평 작성
                                                            </button>
                                                        </>
                                                    )}
                                                    {(order.status === '주문접수' || order.status === '결제완료') && (
                                                        <button 
                                                            onClick={() => order.id && handleCancelOrder(order.id)}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                                                        >
                                                            주문취소
                                                        </button>
                                                    )}
                                                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                                        재주문
                                                    </button>
                                                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                                        주문상세
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="mt-6 pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">총 주문금액:</span>
                                                <span className="text-xl font-bold text-gray-800">{order.total_amount.toLocaleString()}원</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white rounded-xl shadow-lg">
                                    <div className="text-6xl mb-6">📦</div>
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">주문내역이 없습니다</h3>
                                    <p className="text-base text-gray-600 mb-8">선택하신 기간 내 주문내역이 없습니다.</p>
                                    <button 
                                        className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                        onClick={() => navigate('/')}
                                    >
                                        쇼핑하러 가기
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 페이지네이션 */}
                        {filteredOrders.length > itemsPerPage && (
                            <div className="flex justify-center items-center gap-3 mt-10">
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                    이전
                                </button>
                                <div className="flex gap-1">
                                    <button className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm">1</button>
                                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">2</button>
                                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">3</button>
                                </div>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                    다음
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* 회원정보변경 모달 */}
            <UserInfoModal
              isOpen={showUserInfoModal}
              onClose={() => setShowUserInfoModal(false)}
              user={currentUser}
              onUserUpdate={handleUserUpdate}
            />
        </div>
    )
}

export default OrderTracking