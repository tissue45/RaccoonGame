import { supabase } from './supabase'
import { Product } from '../types'

// 사용자의 최근 본 상품 목록 가져오기
export const getUserRecentViews = async (userId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('recent_views')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching recent views:', error)
      return []
    }

    return data?.map(item => ({
      ...item.products,
      image: item.products.image_urls?.[0] || '/placeholder-image.jpg',
      viewedAt: item.viewed_at
    })) || []
  } catch (error) {
    console.error('Error in getUserRecentViews:', error)
    return []
  }
}

// 최근 본 상품 추가
export const addRecentView = async (userId: string, productId: number): Promise<boolean> => {
  try {
    // 이미 존재하는지 확인
    const { data: existing } = await supabase
      .from('recent_views')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (existing) {
      // 이미 존재하면 시간만 업데이트
      const { error } = await supabase
        .from('recent_views')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', existing.id)

      if (error) {
        console.error('Error updating recent view:', error)
        return false
      }
    } else {
      // 새로 추가
      const { error } = await supabase
        .from('recent_views')
        .insert({
          user_id: userId,
          product_id: productId,
          viewed_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error adding recent view:', error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error in addRecentView:', error)
    return false
  }
}

// 최근 본 상품 제거
export const removeRecentView = async (userId: string, productId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('recent_views')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) {
      console.error('Error removing recent view:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in removeRecentView:', error)
    return false
  }
}

// 사용자의 모든 최근 본 상품 제거
export const clearUserRecentViews = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('recent_views')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error clearing recent views:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in clearUserRecentViews:', error)
    return false
  }
}

