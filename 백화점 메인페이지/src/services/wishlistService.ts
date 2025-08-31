import { supabase } from './supabase'
import { Product } from '../types'

export interface WishlistItem {
  id: string
  user_id: string
  product_id: number
  created_at: string
  updated_at: string
  product?: Product
}

// 사용자의 찜 목록 가져오기
export const getUserWishlist = async (userId: string): Promise<Product[]> => {
  try {
    // 먼저 wishlists에서 product_id 목록을 가져옴
    const { data: wishlistData, error: wishlistError } = await supabase
      .from('wishlists')
      .select('product_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (wishlistError) {
      console.error('Error fetching wishlist:', wishlistError)
      return []
    }

    if (!wishlistData || wishlistData.length === 0) {
      return []
    }

    // product_id 목록으로 products 테이블에서 상품 정보 조회
    const productIds = wishlistData.map(item => item.product_id)
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return []
    }

    // 이미지 URL 처리 및 created_at 순서대로 정렬
    const productsMap = new Map(productsData?.map(product => [product.id, {
      ...product,
      image: product.image_urls?.[0] || '/placeholder-image.jpg'
    }]) || [])
    
    return wishlistData
      .map(item => productsMap.get(item.product_id))
      .filter(Boolean) as Product[]
  } catch (error) {
    console.error('Error in getUserWishlist:', error)
    return []
  }
}

// 찜 목록에 상품 추가
export const addToWishlist = async (userId: string, productId: number): Promise<boolean> => {
  try {
    console.log('Adding to wishlist - userId:', userId, 'productId:', productId)
    
    const { data, error } = await supabase
      .from('wishlists')
      .insert([
        {
          user_id: userId,
          product_id: productId
        }
      ])
      .select()

    if (error) {
      console.error('Error adding to wishlist:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return false
    }

    console.log('Successfully added to wishlist:', data)
    return true
  } catch (error) {
    console.error('Error in addToWishlist:', error)
    return false
  }
}

// 찜 목록에서 상품 제거
export const removeFromWishlist = async (userId: string, productId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) {
      console.error('Error removing from wishlist:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in removeFromWishlist:', error)
    return false
  }
}

// 상품이 찜 목록에 있는지 확인
export const isInWishlist = async (userId: string, productId: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116는 결과가 없을 때
      console.error('Error checking wishlist:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in isInWishlist:', error)
    return false
  }
}

// 찜 목록 개수 가져오기
export const getWishlistCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      console.error('Error getting wishlist count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error in getWishlistCount:', error)
    return 0
  }
}

// 찜 목록 전체 삭제
export const clearWishlist = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error clearing wishlist:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in clearWishlist:', error)
    return false
  }
}
