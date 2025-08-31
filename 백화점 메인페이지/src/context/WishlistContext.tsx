import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '../types'
import { useUser } from './UserContext'
import { 
  getUserWishlist, 
  addToWishlist as addToWishlistDB, 
  removeFromWishlist as removeFromWishlistDB,
  isInWishlist as isInWishlistDB,
  getWishlistCount as getWishlistCountDB,
  clearWishlist as clearWishlistDB
} from '../services/wishlistService'

interface WishlistContextType {
  wishlistItems: Product[]
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: number) => Promise<void>
  isInWishlist: (productId: number) => boolean
  getWishlistCount: () => number
  clearWishlist: () => Promise<void>
  showToast: boolean
  toastMessage: string
  hideToast: () => void
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export const useWishlistContext = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlistContext must be used within a WishlistProvider')
  }
  return context
}

interface WishlistProviderProps {
  children: ReactNode
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const { currentUser } = useUser()
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [wishlistCount, setWishlistCount] = useState(0)

  // 사용자 찜 목록 데이터 로드
  const refreshWishlist = async () => {
    if (!currentUser?.id) return

    try {
      const items = await getUserWishlist(currentUser.id)
      const count = await getWishlistCountDB(currentUser.id)
      
      setWishlistItems(items)
      setWishlistCount(count)
    } catch (error) {
      console.error('Failed to load wishlist:', error)
    }
  }

  useEffect(() => {
    if (currentUser?.id) {
      refreshWishlist()
    } else {
      setWishlistItems([])
      setWishlistCount(0)
    }
  }, [currentUser])

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  const hideToast = () => {
    setShowToast(false)
  }

  const addToWishlist = async (product: Product) => {
    if (!currentUser?.id) {
      showToastMessage('로그인이 필요한 서비스입니다.')
      return
    }

    try {
      const success = await addToWishlistDB(currentUser.id, product.id)
      if (success) {
        await refreshWishlist()
        showToastMessage('찜 목록에 추가되었습니다.')
      } else {
        showToastMessage('찜 목록 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      showToastMessage('찜 목록 추가 중 오류가 발생했습니다.')
    }
  }

  const removeFromWishlist = async (productId: number) => {
    if (!currentUser?.id) return

    try {
      const success = await removeFromWishlistDB(currentUser.id, productId)
      if (success) {
        await refreshWishlist()
        showToastMessage('찜 목록에서 제거되었습니다.')
      } else {
        showToastMessage('찜 목록 제거에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      showToastMessage('찜 목록 제거 중 오류가 발생했습니다.')
    }
  }

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.id === productId)
  }

  const getWishlistCount = () => {
    return wishlistCount
  }

  const clearWishlist = async () => {
    if (!currentUser?.id) return

    try {
      const success = await clearWishlistDB(currentUser.id)
      if (success) {
        await refreshWishlist()
        showToastMessage('찜 목록이 초기화되었습니다.')
      } else {
        showToastMessage('찜 목록 초기화에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      showToastMessage('찜 목록 초기화 중 오류가 발생했습니다.')
    }
  }

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      getWishlistCount,
      clearWishlist,
      showToast,
      toastMessage,
      hideToast,
      refreshWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  )
}