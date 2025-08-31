import React, { useState, useEffect, useRef } from 'react'
import { getPopularProducts } from '../services/productService'
import { Product } from '../types'

const WeeklyFocus: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isBrandVisible, setIsBrandVisible] = useState(false)
  const [isProductsVisible, setIsProductsVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)
  const brandRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    )

    const brandObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsBrandVisible(true)
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    )

    const productsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsProductsVisible(true)
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    if (brandRef.current) {
      brandObserver.observe(brandRef.current)
    }

    if (productsRef.current) {
      productsObserver.observe(productsRef.current)
    }

    return () => {
      observer.disconnect()
      brandObserver.disconnect()
      productsObserver.disconnect()
    }
  }, [])

  // 제품 데이터 로드
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getPopularProducts(20) // 5페이지 x 4개 제품 = 20개
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className={`text-3xl font-bold text-center mb-16 text-gray-900 transition-all duration-1000 ease-out transform ${
          isVisible ? 'translate-y-0' : 'translate-y-8'
        }`}>
          Weekly Focus
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
          <div className="lg:col-span-2 relative overflow-hidden rounded-lg shadow-lg group">
            <video className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" autoPlay muted loop>
              <source
                src="https://minfo.lotteshopping.com/content/video/20250821/0825_%EC%9D%B8%EB%B2%A4%ED%86%A0%EB%A6%AC(PC).mp4"
                type="video/mp4"
              />
            </video>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-8">
              <div className="text-sm font-semibold text-white bg-white bg-opacity-20 px-3 py-1 rounded-full w-fit mb-4">FASHION</div>
              <h3 className="text-4xl font-bold text-white mb-3">LACOSTE</h3>
              <p className="text-lg text-white opacity-90">프랑스 전통의 우아함과 스포츠 정신이 만나다</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative flex-1 overflow-hidden rounded-lg shadow-lg group">
              <div 
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ 
                  backgroundImage: 'url(https://contents.lotteon.com/display/dshoplnk/52737/2/M001313/685467/P70E969733B3E8393A6EDA22EB3F84023F93CFFC3BD0E6D547877026F26C11CD4/file/dims/optimize/format/webp)' 
                }}
              ></div>
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
                <div className="text-xs font-semibold text-white bg-white bg-opacity-20 px-2 py-1 rounded-full w-fit mb-2">BEAUTY</div>
                <h3 className="text-xl font-bold text-white">스킨케어 루틴</h3>
              </div>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-lg shadow-lg group">
              <div 
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ 
                  backgroundImage: 'url(https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)' 
                }}
              ></div>
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
                <div className="text-xs font-semibold text-white bg-white bg-opacity-20 px-2 py-1 rounded-full w-fit mb-2">FASHION</div>
                <h3 className="text-xl font-bold text-white">가을 트렌드</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 브랜드 섹션 */}
      <div ref={brandRef} className="max-w-6xl mx-auto px-6 mt-24">
        <h2 className={`text-3xl font-bold text-center mb-16 text-gray-900 transition-all duration-1000 ease-out transform ${
          isBrandVisible ? 'translate-y-0' : 'translate-y-8'
        }`}>
          New Brand Avenue
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
          {/* 첫 번째 행 - ADIDAS */}
          <div className="relative overflow-hidden rounded-lg shadow-lg group">
            <div 
              className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
              style={{ 
                backgroundImage: 'url(https://image.thehyundai.com/static/image/sect/dispbnnr22410015210020250818082110.jpg)' 
              }}
            ></div>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
              <div className="text-sm font-semibold text-white bg-white bg-opacity-20 px-3 py-1 rounded-full w-fit mb-3">SPORTS</div>
              <h3 className="text-2xl font-bold text-white mb-2">ADIDAS</h3>
              <p className="text-sm text-white opacity-90">스포츠의 정점, 혁신과 성능의 만남</p>
            </div>
            {/* 호버 오버레이 */}
            <div className="absolute inset-0 bg-white bg-opacity-95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">ADIDAS</h3>
              <p className="text-gray-700 text-xs leading-relaxed">
                독일의 전설적인 스포츠 브랜드로, 혁신적인 기술과 디자인으로 운동선수와 일반인 모두에게 최고의 성능을 제공합니다. 
                Boost, Primeknit 등 혁신적인 기술로 스포츠의 새로운 기준을 제시하고 있습니다.
              </p>
            </div>
          </div>
          
          {/* 첫 번째 행 - MAXMARA */}
          <div className="relative overflow-hidden rounded-lg shadow-lg group">
            <div 
              className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
              style={{ 
                backgroundImage: 'url(https://image.thehyundai.com/HM/HM001Tile/20241119/164317/dispimg22410010020241119164341.jpg)' 
              }}
            ></div>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
              <div className="text-sm font-semibold text-white bg-white bg-opacity-20 px-3 py-1 rounded-full w-fit mb-3">LUXURY</div>
              <h3 className="text-2xl font-bold text-white mb-2">MAXMARA</h3>
              <p className="text-sm text-white opacity-90">이탈리아 프리미엄 패션</p>
            </div>
            {/* 호버 오버레이 */}
            <div className="absolute inset-0 bg-white bg-opacity-95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">MAXMARA</h3>
              <p className="text-gray-700 text-xs leading-relaxed">
                이탈리아의 프리미엄 패션 브랜드로, 우아하고 세련된 디자인으로 여성들에게 꿈의 코트를 제공합니다. 
                최고급 소재와 정교한 테일러링으로 시간을 초월한 아름다움을 선사합니다.
              </p>
            </div>
          </div>
          
          {/* 두 번째 행 - CREED */}
          <div className="relative overflow-hidden rounded-lg shadow-lg group">
            <div 
              className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
              style={{ 
                backgroundImage: 'url(https://image.thehyundai.com/static/image/sect/dispbnnr16793811012020220307101531.jpg)' 
              }}
            ></div>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
              <div className="text-sm font-semibold text-white bg-white bg-opacity-20 px-3 py-1 rounded-full w-fit mb-3">PERFUME</div>
              <h3 className="text-2xl font-bold text-white mb-2">CREED</h3>
              <p className="text-sm text-white opacity-90">영국 왕실의 공식 향수</p>
            </div>
            {/* 호버 오버레이 */}
            <div className="absolute inset-0 bg-white bg-opacity-95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">CREED</h3>
              <p className="text-gray-700 text-xs leading-relaxed">
                영국 왕실의 공식 향수 제조업체로, 1760년부터 이어져 온 전통과 혁신을 담은 럭셔리 향수 브랜드입니다. 
                최고급 원료와 장인의 정성을 담아 만든 독특한 향으로 특별한 순간을 선사합니다.
              </p>
            </div>
          </div>
          
          {/* 두 번째 행 - HERMÈS */}
          <div className="relative overflow-hidden rounded-lg shadow-lg group">
            <div 
              className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
              style={{ 
                backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)' 
              }}
            ></div>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
              <div className="text-sm font-semibold text-white bg-white bg-opacity-20 px-3 py-1 rounded-full w-fit mb-3">FASHION</div>
              <h3 className="text-2xl font-bold text-white mb-2">HERMÈS</h3>
              <p className="text-sm text-white opacity-90">프랑스 럭셔리의 정점</p>
            </div>
            {/* 호버 오버레이 */}
            <div className="absolute inset-0 bg-white bg-opacity-95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">HERMÈS</h3>
              <p className="text-gray-700 text-xs leading-relaxed">
                프랑스의 전설적인 럭셔리 브랜드로, 1837년부터 이어져 온 전통과 장인의 정신을 담아 최고급 가죽 제품을 선사합니다.
                시간을 초월한 아름다움과 기능성을 완벽하게 조화시킨 명품의 대명사입니다.
              </p>
            </div>
          </div>
        </div>
        {/* 브랜드 섹션 하단에 하나의 "더 알아보기" 버튼 추가 */}
        <div className="text-center mt-12">
          <button className="text-gray-700 font-medium underline decoration-gray-400 hover:text-gray-900 hover:decoration-gray-600 transition-colors duration-300">
            더 알아보기
          </button>
        </div>
      </div>
      
      {/* Featured Products 섹션 */}
      <div ref={productsRef} className="max-w-6xl mx-auto px-6 mt-24">
        <h2 className={`text-3xl font-bold text-center mb-16 text-gray-900 transition-all duration-1000 ease-out transform ${
          isProductsVisible ? 'translate-y-0' : 'translate-y-8'
        }`}>
          Featured Products
        </h2>
        
        {/* 제품 데이터 */}
        {(() => {
          if (loading) {
            return (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            )
          }

          // 제품을 4개씩 페이지로 나누기
          const itemsPerPage = 4
          const totalPages = Math.ceil(products.length / itemsPerPage)
          const startIndex = (currentPage - 1) * itemsPerPage
          const endIndex = startIndex + itemsPerPage
          const currentProducts = products.slice(startIndex, endIndex)

          // 뱃지 색상 배열
          const badgeColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500']
          const badgeLabels = ['NEW', 'SALE', 'HOT', 'BEST']

          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentProducts.map((product, index) => {
                  const badgeIndex = index % badgeColors.length
                  return (
                    <div key={product.id} className="group cursor-pointer" onClick={() => window.location.href = `/product/${product.id}`}>
                      <div className="relative overflow-hidden rounded-lg shadow-lg mb-4">
                        <div 
                          className="w-full h-64 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                          style={{ backgroundImage: `url(${product.image})` }}
                        ></div>
                        <div className={`absolute top-4 right-4 ${badgeColors[badgeIndex]} text-white px-2 py-1 rounded-full text-xs font-semibold`}>
                          {badgeLabels[badgeIndex]}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
                      <p className="text-xl font-bold text-gray-900">₩{new Intl.NumberFormat('ko-KR').format(product.price)}</p>
                    </div>
                  )
                })}
              </div>
              
              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-16 space-x-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`text-2xl font-medium transition-colors ${
                        currentPage === page 
                          ? 'text-gray-900 border-b-2 border-gray-900 pb-1' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )
        })()}
      </div>
    </section>
  )
}

export default WeeklyFocus