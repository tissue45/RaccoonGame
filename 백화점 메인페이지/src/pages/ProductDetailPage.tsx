import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiHeart, FiShare2, FiShoppingBag, FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi'
import { useCartContext } from '../context/CartContext'
import { useWishlistContext } from '../context/WishlistContext'
import { useRecentViewContext } from '../context/RecentViewContext'
import { useUser } from '../context/UserContext'
import { getProductById } from '../services/productService'
import { Product } from '../types'

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart, formatPrice } = useCartContext()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext()
  const { addToRecent } = useRecentViewContext()
  const { currentUser } = useUser()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('FREE')
  const [selectedColor, setSelectedColor] = useState('블랙')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    return currentUser !== null
  }

  // 로그인 필요 알림 함수
  const showLoginRequired = () => {
    alert('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.')
    navigate('/login')
  }

  // 상품 데이터 로드
  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          const productData = await getProductById(parseInt(id))
          setProduct(productData)
          // 상품이 로드되면 최근 본 상품에 추가
          if (productData) {
            addToRecent(productData)
          }
        } catch (error) {
          console.error('Failed to fetch product:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchProduct()
  }, [id, addToRecent])

  // 페이지 로드 시 스크롤을 맨 위로 이동
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    scrollToTop()
    setTimeout(scrollToTop, 0)
    setTimeout(scrollToTop, 100)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
          <h2 className="text-xl text-gray-600">상품 정보를 불러오는 중...</h2>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">상품을 찾을 수 없습니다</h2>
          <Link to="/" className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">홈으로 돌아가기</Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!checkLoginStatus()) {
      showLoginRequired()
      return
    }
    addToCart(product, quantity)
    alert(`${product.name}이(가) 장바구니에 추가되었습니다.`)
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity)
    }
  }

  const toggleWishlist = () => {
    if (!checkLoginStatus()) {
      showLoginRequired()
      return
    }
    if (product) {
      if (isInWishlist(product.id.toString())) {
        removeFromWishlist(product.id.toString())
      } else {
        addToWishlist(product)
      }
    }
  }

  const handleBuyNow = () => {
    console.log('바로구매 버튼 클릭됨')
    
    if (!checkLoginStatus()) {
      console.log('로그인 상태 확인 실패')
      showLoginRequired()
      return
    }
    
    console.log('로그인 상태 확인 성공')
    console.log('상품 정보:', product)
    console.log('수량:', quantity)
    console.log('선택된 사이즈:', selectedSize)
    console.log('선택된 색상:', selectedColor)
    
    // 바로구매를 위한 주문 데이터 생성
    const orderData = {
      items: [{
        product: product,
        quantity: quantity,
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        price: product.price
      }],
      totalAmount: product.price * quantity,
      isDirectOrder: true // 바로구매 플래그
    }
    
    console.log('생성된 주문 데이터:', orderData)
    
    // 결제 페이지로 이동하면서 주문 데이터 전달
    navigate('/checkout', { state: orderData })
    console.log('결제 페이지로 이동 시도')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 브레드크럼 */}
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-black transition-colors">HOME</Link>
            <span>&gt;</span>
            <span className="hover:text-black transition-colors">상품</span>
            <span>&gt;</span>
            <span className="text-black">{product.brand}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 상품 이미지 */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-4">
              <img src={product.image} alt="썸네일 1" className="w-20 h-20 object-cover rounded-lg border-2 border-black cursor-pointer" />
              <img src={product.image} alt="썸네일 2" className="w-20 h-20 object-cover rounded-lg border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors" />
              <img src={product.image} alt="썸네일 3" className="w-20 h-20 object-cover rounded-lg border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors" />
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="space-y-8">
            <div>
              <div className="text-lg text-gray-600 mb-2">{product.brand || '브랜드'}</div>
              <h1 className="text-3xl font-bold text-black mb-6">{product.name}</h1>

              <div className="flex items-center gap-4 mb-8">
                <div className="text-lg text-gray-400 line-through">₩{formatPrice(product.price + 100000)}</div>
                <div className="text-3xl font-bold text-black">₩{formatPrice(product.price)}</div>
                <div className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded">10% 할인</div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">색상</label>
                <div className="flex gap-3">
                  {['블랙', '화이트', '베이지'].map(color => (
                    <button
                      key={color}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${selectedColor === color
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">사이즈</label>
                <div className="flex gap-3 flex-wrap">
                  {['XS', 'S', 'M', 'L', 'XL', 'FREE'].map(size => (
                    <button
                      key={size}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">수량</label>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-4 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x border-gray-300 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    className="px-4 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>총 상품금액</span>
                <span>₩{formatPrice(product.price * quantity)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={toggleWishlist}
              >
                <FiHeart className={product && isInWishlist(product.id.toString()) ? 'text-red-500 fill-current' : ''} />
                관심상품
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FiShare2 />
                공유하기
              </button>
              <button
                className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                onClick={handleAddToCart}
              >
                <FiShoppingBag />
                장바구니 담기
              </button>
              <button
                className="flex items-center justify-center gap-2 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                onClick={handleBuyNow}
              >
                바로구매
              </button>
            </div>

            {/* 배송 정보 */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-4">
                <FiTruck className="text-gray-600 mt-1" size={20} />
                <div>
                  <div className="font-semibold text-gray-900">무료배송</div>
                                          <p className="text-sm text-gray-600">10만원 이상 구매시 무료배송</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FiRefreshCw className="text-gray-600 mt-1" size={20} />
                <div>
                  <div className="font-semibold text-gray-900">교환/반품</div>
                  <p className="text-sm text-gray-600">구매일로부터 7일 이내</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FiShield className="text-gray-600 mt-1" size={20} />
                <div>
                  <div className="font-semibold text-gray-900">품질보증</div>
                  <p className="text-sm text-gray-600">정품 보증 및 A/S 서비스</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 상세 정보 */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              <button className="py-4 px-2 border-b-2 border-black font-medium text-black">상품정보</button>
              <button className="py-4 px-2 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 transition-colors">배송/교환/반품</button>
              <button className="py-4 px-2 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 transition-colors">리뷰</button>
              <button className="py-4 px-2 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 transition-colors">Q&A</button>
            </div>
          </div>

          <div className="py-12">
            <div className="max-w-4xl">
              <h3 className="text-2xl font-bold mb-6">상품 설명</h3>
              <p className="text-gray-700 leading-relaxed mb-12">{product.description}</p>

              <div>
                <h4 className="text-xl font-bold mb-6">상품 정보</h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-4 px-6 bg-gray-100 font-medium text-gray-700 w-1/4">브랜드</td>
                        <td className="py-4 px-6">{product.brand || '정보 없음'}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-4 px-6 bg-gray-100 font-medium text-gray-700">소재</td>
                        <td className="py-4 px-6">캐시미어 100%</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-4 px-6 bg-gray-100 font-medium text-gray-700">원산지</td>
                        <td className="py-4 px-6">이탈리아</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 bg-gray-100 font-medium text-gray-700">세탁방법</td>
                        <td className="py-4 px-6">드라이클리닝 전용</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage