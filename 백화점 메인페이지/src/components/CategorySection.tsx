import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProductsByCategory } from '../services/productService'

const CategorySection: React.FC = () => {
  // 임시로 하드코딩된 카테고리 (실제로는 Supabase에서 가져올 수 있음)
  const categories = [
    { 
      id: 1,
      name: '여성 패션', 
      path: '/category/1', 
      image: 'https://image.thehyundai.com/HM/HM006/20250806/104045/pc_exclusive_stories.jpg' 
    },
    { 
      id: 2,
      name: '남성 패션', 
      path: '/category/2', 
      image: 'https://image.thehyundai.com/HM/HM006/20250805/132821/pc_exclusive.jpg' 
    },
    { 
      id: 3,
      name: '뷰티', 
      path: '/category/3', 
      image: 'https://image.thehyundai.com/HM/HM006/20250804/103547/pc_exclusive_stylein_3rd.jpg' 
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div 
              key={category.name} 
              className="group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.location.href = category.path}
            >
              <div 
                className="relative h-80 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white text-center px-4">{category.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategorySection