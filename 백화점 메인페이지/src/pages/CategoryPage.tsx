import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductsByLevel3Category } from '../services/categoryService'
import { Product } from '../types'

const CategoryPage: React.FC = () => {
    const { categoryId, category } = useParams<{ categoryId: string; category: string }>()
    const actualCategoryId = categoryId || category
    const [products, setProducts] = useState<Product[]>([])
    const [categoryName, setCategoryName] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchProducts = async () => {
            if (!actualCategoryId) return

            try {
                setLoading(true)
                setError('')
                
                const result = await getProductsByLevel3Category(parseInt(actualCategoryId))
                setProducts(result.products)
                setCategoryName(result.categoryName)
            } catch (err) {
                console.error('Error fetching category products:', err)
                setError('상품을 불러오는 중 오류가 발생했습니다.')
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [actualCategoryId])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
                    <p className="text-gray-600">상품을 불러오는 중...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
                    <p className="text-gray-600">총 {products.length}개의 상품</p>
                </div>

                {/* 상품 목록 */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="aspect-w-1 aspect-h-1 w-full">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.src = '/placeholder-image.jpg'
                                        }}
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                        {product.description}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-gray-900">
                                            ₩{product.price?.toLocaleString()}
                                        </span>
                                        <button 
                                            onClick={() => navigate(`/product/${product.id}`)}
                                            className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                                        >
                                            상세보기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">상품이 없습니다</h3>
                        <p className="text-gray-600">이 카테고리에는 아직 상품이 등록되지 않았습니다.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CategoryPage

