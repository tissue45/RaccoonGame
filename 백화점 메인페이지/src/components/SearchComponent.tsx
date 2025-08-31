import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  getSearchSuggestions, 
  getPopularSearchTerms, 
  advancedSearchProducts,
  getSearchResultCount 
} from '../services/productService'
import { 
  saveSearchLog, 
  getRelatedSearchTerms, 
  getSearchStats,
  getUserSearchHistory 
} from '../services/searchService'
import { useUser } from '../context/UserContext'
import { Product } from '../types'

interface SearchFilters {
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  brand?: string
  sortBy: 'name' | 'price' | 'sales' | 'created_at'
  sortOrder: 'asc' | 'desc'
}

const SearchComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [popularTerms, setPopularTerms] = useState<string[]>([])
  const [relatedTerms, setRelatedTerms] = useState<string[]>([])
  const [userHistory, setUserHistory] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'sales',
    sortOrder: 'desc'
  })
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [resultCount, setResultCount] = useState(0)
  const [searchStats, setSearchStats] = useState({ totalSearches: 0, recentSearches: 0 })
  
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useUser()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // URL에서 검색어 파싱
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const query = searchParams.get('search')
    if (query) {
      setSearchQuery(query)
      performSearch(query, filters)
    }
  }, [location.search])

  // 인기 검색어 로드
  useEffect(() => {
    loadPopularTerms()
  }, [])

  // 사용자 검색 히스토리 로드
  useEffect(() => {
    if (currentUser) {
      loadUserHistory()
    }
  }, [currentUser])

  // 자동완성 제안 로드
  useEffect(() => {
    if (searchQuery.length >= 2) {
      loadSuggestions()
      loadRelatedTerms()
      loadSearchStats()
    } else {
      setSuggestions([])
      setRelatedTerms([])
      setSearchStats({ totalSearches: 0, recentSearches: 0 })
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
      const terms = await getPopularSearchTerms(8)
      setPopularTerms(terms)
    } catch (error) {
      console.error('인기 검색어 로드 실패:', error)
    }
  }

  const loadUserHistory = async () => {
    try {
      if (currentUser) {
        const history = await getUserSearchHistory(currentUser.id, 6)
        setUserHistory(history)
      }
    } catch (error) {
      console.error('사용자 검색 히스토리 로드 실패:', error)
    }
  }

  const loadSuggestions = async () => {
    try {
      const suggestions = await getSearchSuggestions(searchQuery, 8)
      setSuggestions(suggestions)
    } catch (error) {
      console.error('검색 제안 로드 실패:', error)
    }
  }

  const loadRelatedTerms = async () => {
    try {
      const related = await getRelatedSearchTerms(searchQuery, 5)
      setRelatedTerms(related)
    } catch (error) {
      console.error('연관 검색어 로드 실패:', error)
    }
  }

  const loadSearchStats = async () => {
    try {
      const stats = await getSearchStats(searchQuery)
      setSearchStats(stats)
    } catch (error) {
      console.error('검색 통계 로드 실패:', error)
    }
  }

  const performSearch = async (query: string, searchFilters: SearchFilters) => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const results = await advancedSearchProducts(query, searchFilters)
      const count = await getSearchResultCount(query, searchFilters)
      
      setSearchResults(results)
      setResultCount(count)
      
      // 검색 로그 저장
      await saveSearchLog(query, currentUser?.id)
      
      // URL 업데이트
      const searchParams = new URLSearchParams()
      searchParams.set('search', query)
      navigate(`/search?${searchParams.toString()}`, { replace: true })
    } catch (error) {
      console.error('검색 실패:', error)
      setSearchResults([])
      setResultCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery, filters)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    performSearch(suggestion, filters)
    setShowSuggestions(false)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  const handlePopularTermClick = (term: string) => {
    setSearchQuery(term)
    performSearch(term, filters)
  }

  const handleRelatedTermClick = (term: string) => {
    setSearchQuery(term)
    performSearch(term, filters)
  }

  const handleHistoryClick = (term: string) => {
    setSearchQuery(term)
    performSearch(term, filters)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    if (searchQuery.trim()) {
      performSearch(searchQuery, newFilters)
    }
  }

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      sortBy: 'sales',
      sortOrder: 'desc'
    }
    setFilters(defaultFilters)
    if (searchQuery.trim()) {
      performSearch(searchQuery, defaultFilters)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* 검색 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {searchQuery ? `"${searchQuery}" 검색 결과` : '상품 검색'}
        </h1>
        
        {/* 검색 통계 */}
        {searchQuery && searchStats.totalSearches > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            이 검색어는 총 {searchStats.totalSearches}번 검색되었으며, 
            최근 1주일간 {searchStats.recentSearches}번 검색되었습니다.
          </div>
        )}
        
        {/* 검색창 */}
        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="찾고 싶은 상품을 검색해보세요..."
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            검색
          </button>
          
          {/* 검색 제안 */}
          {showSuggestions && (suggestions.length > 0 || popularTerms.length > 0 || relatedTerms.length > 0 || userHistory.length > 0) && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50 max-h-96 overflow-y-auto"
            >
              {/* 검색 제안 */}
              {suggestions.length > 0 && (
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
              
              {/* 연관 검색어 */}
              {relatedTerms.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">연관 검색어</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedTerms.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleRelatedTermClick(term)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 사용자 검색 히스토리 */}
              {userHistory.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">최근 검색어</h3>
                  {userHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(term)}
                      className="block w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
              
              {/* 인기 검색어 */}
              {popularTerms.length > 0 && (
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

      {/* 검색 결과가 있을 때만 표시 */}
      {searchQuery && (
        <>
          {/* 필터 및 정렬 */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {Object.keys(filters).some(key => key !== 'sortBy' && key !== 'sortOrder' && filters[key as keyof SearchFilters]) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  필터 초기화
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">총 {resultCount}개 상품</span>
              
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="sales">인기순</option>
                <option value="price">가격순</option>
                <option value="name">이름순</option>
                <option value="created_at">최신순</option>
              </select>
              
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* 필터 패널 - 항상 표시 */}
          <div className="mb-6 p-6 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 가격 범위 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">가격 범위</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="최소"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-gray-500 self-center">~</span>
                  <input
                    type="number"
                    placeholder="최대"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* 브랜드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">브랜드</label>
                <input
                  type="text"
                  placeholder="브랜드명 입력"
                  value={filters.brand || ''}
                  onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 검색 결과 */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">검색 중...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-blue-600 mb-2">
                      {formatPrice(product.price)}원
                    </p>
                    {product.brand && (
                      <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>판매량: {product.sales}</span>
                      <span>재고: {product.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">검색 결과가 없습니다.</p>
              <p className="text-gray-500 mt-2">다른 검색어를 시도해보세요.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SearchComponent
