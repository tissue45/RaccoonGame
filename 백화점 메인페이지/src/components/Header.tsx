import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCartContext } from '../context/CartContext'
import { getCategoriesHierarchy } from '../services/categoryService'
import { useUser } from '../context/UserContext'
import { logout } from '../services/userService'
import { getSearchSuggestions, getPopularSearchTerms } from '../services/productService'

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<any>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [popularTerms, setPopularTerms] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  
  const { getCartItemCount } = useCartContext()
  const location = useLocation()
  const { currentUser: contextUser, refreshUser } = useUser()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // 상단 헤더를 숨길 페이지들
  const hideTopHeaderPages = ['/login', '/signup', '/forgot-password']
  const shouldHideTopHeader = hideTopHeaderPages.includes(location.pathname)

  // 로그인 상태 확인 및 카테고리 로드
  useEffect(() => {
    setCurrentUser(contextUser)
    
    // 카테고리 데이터 로드
    const loadCategories = async () => {
      const categoryData = await getCategoriesHierarchy()
      setCategories(categoryData)
      if (categoryData.length > 0) {
        setActiveCategory(categoryData[0]) // 첫 번째 카테고리를 기본값으로
        if (categoryData[0].subcategories && categoryData[0].subcategories.length > 0) {
          setActiveSubcategory(categoryData[0].subcategories[0])
        }
      }
    }
    loadCategories()
  }, [contextUser, location.pathname])

  // 인기 검색어 로드
  useEffect(() => {
    loadPopularTerms()
  }, [])

  // 자동완성 제안 로드
  useEffect(() => {
    if (searchQuery.length >= 2) {
      loadSuggestions()
    } else {
      setSuggestions([])
    }
  }, [searchQuery])

  // 외부 클릭 시 제안 숨기기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadPopularTerms = async () => {
    try {
      const terms = await getPopularSearchTerms(6)
      setPopularTerms(terms)
    } catch (error) {
      console.error('인기 검색어 로드 실패:', error)
    }
  }

  const loadSuggestions = async () => {
    if (searchQuery.length < 2) return
    
    setIsLoadingSuggestions(true)
    try {
      const suggestions = await getSearchSuggestions(searchQuery, 6)
      setSuggestions(suggestions)
    } catch (error) {
      console.error('검색 제안 로드 실패:', error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // 로그아웃 함수 (로컬스토리지 관련 코드 삭제)
  const handleLogout = async () => {
    try {
      await logout()
      setCurrentUser(null)
      // localStorage.removeItem('currentUser') 삭제
      alert('로그아웃되었습니다.')
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      alert('로그아웃 중 오류가 발생했습니다.')
    }
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const closeDropdown = () => {
    setIsDropdownOpen(false)
  }

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.hamburger-container')) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMouseEnter = () => {
    if (!shouldHideTopHeader) {
      setIsDropdownOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (!shouldHideTopHeader) {
      setIsDropdownOpen(false)
    }
  }

  const handleCategoryHover = (category: any) => {
    setActiveCategory(category)
    if (category.subcategories && category.subcategories.length > 0) {
      setActiveSubcategory(category.subcategories[0])
    } else {
      setActiveSubcategory(null)
    }
  }

  const handleSubcategoryHover = (subcategory: any) => {
    setActiveSubcategory(subcategory)
  }

  // 검색 기능
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // 검색어가 있으면 검색 페이지로 이동
      console.log('검색 실행:', searchQuery.trim())
      window.location.href = `/search?search=${encodeURIComponent(searchQuery.trim())}`
    } else {
      alert('검색어를 입력해주세요.')
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchButtonClick = () => {
    if (searchQuery.trim()) {
      console.log('검색 버튼 클릭:', searchQuery.trim())
      window.location.href = `/search?search=${encodeURIComponent(searchQuery.trim())}`
    } else {
      alert('검색어를 입력해주세요.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchButtonClick()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    window.location.href = `/search?search=${encodeURIComponent(suggestion)}`
    setShowSuggestions(false)
  }

  const handlePopularTermClick = (term: string) => {
    setSearchQuery(term)
    window.location.href = `/search?search=${encodeURIComponent(term)}`
    setShowSuggestions(false)
  }

  const handleSearchFocus = () => {
    setShowSuggestions(true)
  }

  return (
    <>
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        {/* 상단 헤더: 로고 + 햄버거 + 검색창 + 우측 메뉴 */}
        {!shouldHideTopHeader && (
          <div className="border-b border-gray-100 py-3">
            <div className="flex items-center justify-between max-w-7xl mx-auto px-6">
              <Link to="/" className="text-2xl font-bold text-black no-underline tracking-tight">PREMIUM</Link>
              <div className="flex items-center gap-4">
                {/* 햄버거 버튼 */}
                <div
                  className="relative inline-block hamburger-container"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`flex flex-col justify-around w-6 h-[18px] bg-transparent border-none cursor-pointer p-0 z-10 group ${isDropdownOpen ? 'active' : ''}`}
                    onClick={toggleDropdown}
                  >
                    <span className={`block h-0.5 w-full bg-gray-800 rounded-sm transition-all duration-300 group-hover:bg-black ${isDropdownOpen ? 'transform rotate-45 translate-x-1 translate-y-1' : ''}`}></span>
                    <span className={`block h-0.5 w-full bg-gray-800 rounded-sm transition-all duration-300 group-hover:bg-black ${isDropdownOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block h-0.5 w-full bg-gray-800 rounded-sm transition-all duration-300 group-hover:bg-black ${isDropdownOpen ? 'transform -rotate-45 translate-x-1.5 -translate-y-1.5' : ''}`}></span>
                  </button>
                  {/* 카테고리 드롭다운 메뉴 */}
                  <div className={`absolute top-full left-0 bg-white border border-gray-200 shadow-xl z-50 w-[700px] mt-2 transition-all duration-200 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2.5'}`}>
                    <div className="grid grid-cols-7 gap-0 p-3" style={{gridTemplateColumns: '100px repeat(6, 1fr)'}}>
                      <div className="px-2 border-r border-gray-100 pr-3">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="mb-2"
                            onMouseEnter={() => handleCategoryHover(category)}
                          >
                            <h3 className={`text-sm font-semibold text-gray-800 m-0 mb-1 py-1.5 cursor-pointer transition-colors duration-200 hover:text-black ${activeCategory?.id === category.id ? 'text-black bg-gray-50 py-1.5 px-2 rounded-sm -mx-2 mb-1 font-bold' : ''}`}>
                              {category.name}
                            </h3>
                          </div>
                        ))}
                      </div>
                      {/* 카테고리 레벨2 (서브카테고리들) */}
                      {activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
                        activeCategory.subcategories.map((subcategory: any, index: number) => (
                          <div key={index} className="px-2">
                            <div className="mb-2">
                              <h4 className="text-xs font-semibold text-gray-500 m-0 mb-1.5 pb-1 border-b border-gray-100">
                                {subcategory.name}
                              </h4>
                              {/* 레벨3 카테고리 (상품 링크) */}
                              {subcategory.subcategories && subcategory.subcategories.length > 0 ? (
                                subcategory.subcategories.map((subsubcategory: any, index: number) => (
                                  <Link 
                                    key={index}
                                    to={`/products/${subsubcategory.id}`} // /category/ -> /products/로 변경
                                    className="block py-1 text-gray-500 no-underline text-xs transition-colors duration-200 hover:text-black"
                                  >
                                    {subsubcategory.name}
                                  </Link>
                                ))
                              ) : (
                                // 레벨3 카테고리가 없을 때 표시할 메시지
                                <div className="col-span-6 flex items-center justify-center text-gray-400 text-sm">
                                  서브카테고리를 선택해주세요
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        // 서브카테고리가 없을 때 표시할 메시지
                        <div className="col-span-6 flex items-center justify-center text-gray-400 text-sm">
                          카테고리를 선택해주세요
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* 검색창 */}
                <form onSubmit={handleSearch} className="relative flex items-center">
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={handleSearchFocus}
                    className="py-2.5 px-5 pr-12 border border-gray-200 rounded-full outline-none text-sm w-96 transition-all duration-300 bg-gray-50 focus:border-black focus:bg-white focus:shadow-lg" 
                    placeholder="검색어를 입력하세요 (예: 나이키, 신발, 스포츠)" 
                  />
                  <button 
                    type="button"
                    onClick={handleSearchButtonClick}
                    className="absolute right-4 bg-transparent border-none cursor-pointer text-gray-500 p-1 flex items-center justify-center hover:text-black transition-colors duration-200"
                    title="검색"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </button>
                  
                  {/* 검색 제안 */}
                  {showSuggestions && (suggestions.length > 0 || popularTerms.length > 0 || isLoadingSuggestions) && (
                    <div
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50 max-h-96 overflow-y-auto"
                    >
                      {/* 로딩 상태 */}
                      {isLoadingSuggestions && (
                        <div className="p-4 text-center">
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-600">검색 중...</span>
                        </div>
                      )}
                      
                      {/* 검색 제안 */}
                      {!isLoadingSuggestions && suggestions.length > 0 && (
                        <div className="p-4 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">검색 제안</h3>
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* 인기 검색어 */}
                      {!isLoadingSuggestions && popularTerms.length > 0 && (
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">인기 검색어</h3>
                          <div className="flex flex-wrap gap-2">
                            {popularTerms.map((term, index) => (
                              <button
                                key={index}
                                onClick={() => handlePopularTermClick(term)}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
              <div className="flex gap-5 items-center">
                {currentUser ? (
                  <>
                    <span className="text-gray-800 text-sm font-semibold">{currentUser.name}님</span>
                    <button onClick={handleLogout} className="bg-transparent border-none text-gray-500 text-sm cursor-pointer transition-colors duration-300 p-0 hover:text-black">로그아웃</button>
                  </>
                ) : (
                  <Link to="/login" className="text-gray-500 no-underline text-sm transition-colors duration-300 hover:text-black">로그인/회원가입</Link>
                )}
                <Link to="/cart" className="relative text-gray-500 no-underline text-sm transition-colors duration-300 hover:text-black">
                  장바구니 ({getCartItemCount()})
                </Link>
                {currentUser && <Link to="/mypage" className="text-gray-500 no-underline text-sm transition-colors duration-300 hover:text-black">마이페이지</Link>}
              </div>
            </div>
          </div>
        )}


      </header>
    </>
  )
}

export default Header