import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecentViewContext } from '../context/RecentViewContext'
import { useUser } from '../context/UserContext'
import Sidebar from '../components/Sidebar'
import UserInfoModal from '../components/UserInfoModal'

const RecentViewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('shopping')
  const [sortBy, setSortBy] = useState('latest')
  const [showUserInfoModal, setShowUserInfoModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { recentItems, removeFromRecent, getRecentCount } = useRecentViewContext()
  const { currentUser } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
    }
  }, [currentUser])

  const handlePersonalInfoClick = (menuItem: string) => {
    if (menuItem === '회원정보변경') {
      setShowUserInfoModal(true)
    }
  }

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser)
  }

  const tabs = [
    { id: 'shopping', label: '최근 본 상품', count: getRecentCount() },
    { id: 'brand', label: '브랜드', count: 0 },
    { id: 'magazine', label: '단골매장', count: 0 },
    { id: 'event', label: '이벤트', count: 0 },
    { id: 'etc', label: '기획전', count: 0 }
  ]

  return (
    <div className="py-10 min-h-screen bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto px-5 w-full box-border">
        <div className="flex gap-8 items-start w-full">
          {/* 사이드바 */}
          <Sidebar onPersonalInfoClick={handlePersonalInfoClick} />

          {/* 메인 콘텐츠 */}
          <div className="flex-1 bg-white rounded-lg p-8 shadow-lg min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 m-0">최근 본 상품</h1>
            </div>

            {/* 탭 메뉴 */}
            <div className="flex border-b border-gray-200 mb-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors duration-300 ${
                    activeTab === tab.id 
                      ? 'text-gray-800 border-gray-800' 
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}({tab.count})
                </button>
              ))}
            </div>

            {/* 빈 상태 */}
            {recentItems.length === 0 && (
              <div className="text-center py-16">
                <div className="mb-4">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto">
                    <path
                      d="M20 25h40l-4 30H24l-4-30z"
                      stroke="#ddd"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle cx="30" cy="65" r="3" fill="#ddd" />
                    <circle cx="50" cy="65" r="3" fill="#ddd" />
                    <path
                      d="M15 15h5l2 10"
                      stroke="#ddd"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle cx="55" cy="35" r="8" stroke="#ddd" strokeWidth="2" fill="none" />
                    <path d="M50 35h10M55 30v10" stroke="#ddd" strokeWidth="2" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">최근 본 상품이 없습니다.</p>
              </div>
            )}

            {/* 최근 본 상품 목록 */}
            {recentItems.length > 0 && activeTab === 'shopping' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recentItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative">
                      <Link to={`/product/${item.id}`}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-image.jpg'
                          }}
                        />
                      </Link>
                      <button
                        className="absolute top-2 right-2 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-300"
                        onClick={() => removeFromRecent(item.id)}
                        title="최근 본 상품에서 제거"
                      >
                        ×
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-gray-500 mb-1">{item.brand || '브랜드'}</div>
                      <Link to={`/product/${item.id}`} className="block text-gray-800 font-medium mb-2 hover:text-gray-600 transition-colors duration-300 line-clamp-2">
                        {item.name}
                      </Link>
                      <div className="text-lg font-semibold text-gray-800">₩{item.price?.toLocaleString() || '0'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 회원정보변경 모달 */}
      <UserInfoModal
        isOpen={showUserInfoModal}
        onClose={() => setShowUserInfoModal(false)}
        onUpdate={handleUserUpdate}
        user={user}
      />
    </div>
  )
}

export default RecentViewPage
