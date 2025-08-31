import React, { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Product } from '../types'
import { getProductsByLevel3Category, getBreadcrumbPath } from '../services/productService'
import Breadcrumb from '../components/Breadcrumb'

type SortOption = 'sales' | 'recent' | 'recommended' | 'price_low' | 'price_high' | 'reviews'
type ViewMode = 'grid' | 'list'

const ProductListPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search')
  const [products, setProducts] = useState<Product[]>([])
  const [categoryName, setCategoryName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [breadcrumbItems, setBreadcrumbItems] = useState<Array<{id: number, name: string, level: number, path: string}>>([])
  
  // 정렬 및 필터링 상태
  const [sortBy, setSortBy] = useState<SortOption>('sales')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [showBrandFilter, setShowBrandFilter] = useState(false)

  // 브랜드 목록 추출 (실제로는 API에서 가져와야 함)
  const brands = Array.from(new Set(products.map(p => p.brand).filter((brand): brand is string => Boolean(brand))))
  const brandCounts = brands.reduce((acc, brand) => {
      acc[brand] = products.filter(p => p.brand === brand).length
      return acc
  }, {} as Record<string, number>)

  useEffect(() => {
    const loadData = async () => {
      // 검색어가 있으면 카테고리 ID가 없어도 상품을 로드할 수 있도록 수정
      if (!categoryId && !searchQuery) return
      
      try {
        setLoading(true)
        
        if (categoryId) {
          // 카테고리별 상품 로드
          const [productsResult, breadcrumbResult] = await Promise.all([
            getProductsByLevel3Category(parseInt(categoryId)),
            getBreadcrumbPath(parseInt(categoryId))
          ])
          setProducts(productsResult.products)
          setCategoryName(productsResult.categoryName)
          setBreadcrumbItems(breadcrumbResult)
        } else if (searchQuery) {
          // 검색어가 있을 때는 모든 상품을 로드 (실제로는 검색 API를 사용해야 함)
          const [productsResult, breadcrumbResult] = await Promise.all([
            getProductsByLevel3Category(1), // 임시로 첫 번째 카테고리 사용
            getBreadcrumbPath(1)
          ])
          setProducts(productsResult.products)
          setCategoryName('검색 결과')
          setBreadcrumbItems(breadcrumbResult)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [categoryId, searchQuery])

  // 정렬된 상품 목록
  const sortedProducts = React.useMemo(() => {
      let sorted = [...products]
      
      switch (sortBy) {
          case 'sales':
              sorted.sort((a, b) => (b.sales || 0) - (a.sales || 0))
              break
          case 'recent':
              sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              break
          case 'price_low':
              sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
              break
          case 'price_high':
              sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
              break
          case 'reviews':
              // 리뷰 수 기준 정렬 (실제 리뷰 데이터가 있다면 사용)
              sorted.sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0))
              break
          default:
              break
      }
      
      return sorted
  }, [products, sortBy])

  // 검색 및 브랜드 필터링된 상품 목록
  const filteredProducts = React.useMemo(() => {
      let filtered = sortedProducts
      
      // 검색어 필터링
      if (searchQuery) {
          const query = searchQuery.toLowerCase()
          filtered = filtered.filter(product => 
              product.name.toLowerCase().includes(query) ||
              (product.brand && product.brand.toLowerCase().includes(query)) ||
              (product.description && product.description.toLowerCase().includes(query))
          )
      }
      
      // 브랜드 필터링
      if (selectedBrands.length > 0) {
          filtered = filtered.filter(product => product.brand && selectedBrands.includes(product.brand))
      }
      
      return filtered
  }, [sortedProducts, selectedBrands, searchQuery])

  const handleBrandToggle = (brand: string) => {
      setSelectedBrands(prev => 
          prev.includes(brand) 
              ? prev.filter(b => b !== brand)
              : [...prev, brand]
      )
  }

  const sortOptions = [
      { value: 'sales', label: '많이팔린순' },
      { value: 'recent', label: '최근등록순' },
      { value: 'recommended', label: 'MD추천순' },
      { value: 'price_low', label: '낮은가격순' },
      { value: 'price_high', label: '높은가격순' },
      { value: 'reviews', label: '상품평개수순' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 브레드크럼 */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* 검색 결과 표시 */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-900 mb-1">
                  검색 결과: "{searchQuery}"
                </h2>
                <p className="text-blue-700 text-sm">
                  {filteredProducts.length}개의 상품을 찾았습니다
                </p>
              </div>
              <Link 
                to="/product-list" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                검색 초기화
              </Link>
            </div>
          </div>
        )}
        
        {/* 헤더 */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {searchQuery ? `"${searchQuery}" 검색 결과` : categoryName}
            </h1>
          </div>
          <p className="text-gray-600">총 {filteredProducts.length}개의 상품</p>
        </div>

        {/* 브랜드 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">브랜드별</h3>
            <button 
              onClick={() => setShowBrandFilter(!showBrandFilter)}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              {showBrandFilter ? '접기' : '더보기'}
            </button>
          </div>
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${showBrandFilter ? 'block' : 'hidden'}`}>
            {brands.slice(0, showBrandFilter ? brands.length : 8).map(brand => (
              <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                />
                <span className="text-sm text-gray-700">
                  {brand} ({brandCounts[brand] || 0})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 정렬 및 보기 옵션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 정렬 옵션 */}
              <div className="flex items-center space-x-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as SortOption)}
                    className={`px-3 py-2 text-sm transition-colors ${
                      sortBy === option.value
                        ? 'text-gray-900 font-semibold'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 상품 수 표시 */}
              <div className="text-sm text-gray-600">
                상품수 {filteredProducts.length}개
              </div>
              
              {/* 보기 형식 선택 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 목록 */}
        {filteredProducts.length > 0 ? (
          <div className={`gap-6 ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-4'
          }`}>
            {filteredProducts.map((product) => (
              <Link 
                key={product.id}
                to={`/product/${product.id}`}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                  <img
                    src={product.image || '/placeholder-image.jpg'}
                    alt={product.name}
                    className={`${viewMode === 'list' ? 'w-full h-48' : 'w-full h-48'} object-cover`}
                  />
                </div>
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{product.brand}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">4.9</span>
                      <span className="text-sm text-gray-500">10개</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-end items-center">
                    <span className="text-xl font-bold text-gray-900">
                      ₩{product.price?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '상품이 없습니다'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `"${searchQuery}"에 대한 검색 결과를 찾을 수 없습니다. 다른 검색어를 시도해보세요.`
                : '이 카테고리에는 아직 상품이 등록되지 않았습니다.'
              }
            </p>
            {searchQuery && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">추천 검색어:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['나이키', '아디다스', '신발', '스포츠', '운동화'].map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => window.location.href = `/product-list?search=${encodeURIComponent(keyword)}`}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductListPage
