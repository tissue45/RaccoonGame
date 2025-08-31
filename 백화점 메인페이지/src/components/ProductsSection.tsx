import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPopularProducts } from '../services/productService'
import { Product } from '../types'

const ProductsSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getPopularProducts(4) // 인기 상품 4개만 가져오기
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-80 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded mb-3"></div>
                  <div className="h-6 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-2 font-medium">{product.brand}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">{product.name}</h3>
                <p className="text-xl font-bold text-gray-900">₩{new Intl.NumberFormat('ko-KR').format(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12 gap-2">
          <span className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-full font-medium cursor-pointer">1</span>
          <span className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full font-medium cursor-pointer hover:bg-gray-300 transition-colors">2</span>
          <span className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full font-medium cursor-pointer hover:bg-gray-300 transition-colors">3</span>
        </div>
      </div>
    </section>
  )
}

export default ProductsSection