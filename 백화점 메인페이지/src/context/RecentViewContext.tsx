import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '../types'
import { useUser } from './UserContext'
import { 
  getUserRecentViews, 
  addRecentView, 
  removeRecentView, 
  clearUserRecentViews 
} from '../services/recentViewService'

interface RecentViewContextType {
  recentItems: Product[]
  addToRecent: (product: Product) => void
  removeFromRecent: (productId: number) => void
  clearRecent: () => void
  getRecentCount: () => number
  loading: boolean
}

const RecentViewContext = createContext<RecentViewContextType | undefined>(undefined)

export const useRecentViewContext = () => {
  const context = useContext(RecentViewContext)
  if (!context) {
    throw new Error('useRecentViewContext must be used within a RecentViewProvider')
  }
  return context
}

interface RecentViewProviderProps {
  children: ReactNode
}

export const RecentViewProvider: React.FC<RecentViewProviderProps> = ({ children }) => {
  const { currentUser } = useUser()
  const [recentItems, setRecentItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // 사용자별 최근 본 상품 목록 로드 (데이터베이스에서)
  useEffect(() => {
    const loadRecentViews = async () => {
      if (currentUser?.id) {
        setLoading(true)
        try {
          const recentViews = await getUserRecentViews(currentUser.id)
          setRecentItems(recentViews)
        } catch (error) {
          console.error('Failed to load recent views:', error)
          setRecentItems([])
        } finally {
          setLoading(false)
        }
      } else {
        setRecentItems([])
      }
    }

    loadRecentViews()
  }, [currentUser])

  const addToRecent = async (product: Product) => {
    if (!currentUser?.id) return

    try {
      const success = await addRecentView(currentUser.id, product.id)
      if (success) {
        // 성공하면 목록을 다시 로드
        const updatedRecentViews = await getUserRecentViews(currentUser.id)
        setRecentItems(updatedRecentViews)
      }
    } catch (error) {
      console.error('Failed to add to recent views:', error)
    }
  }

  const removeFromRecent = async (productId: number) => {
    if (!currentUser?.id) return

    try {
      const success = await removeRecentView(currentUser.id, productId)
      if (success) {
        setRecentItems(prev => prev.filter(item => item.id !== productId))
      }
    } catch (error) {
      console.error('Failed to remove from recent views:', error)
    }
  }

  const clearRecent = async () => {
    if (!currentUser?.id) return

    try {
      const success = await clearUserRecentViews(currentUser.id)
      if (success) {
        setRecentItems([])
      }
    } catch (error) {
      console.error('Failed to clear recent views:', error)
    }
  }

  const getRecentCount = () => {
    return recentItems.length
  }

  const value: RecentViewContextType = {
    recentItems,
    addToRecent,
    removeFromRecent,
    clearRecent,
    getRecentCount,
    loading
  }

  return (
    <RecentViewContext.Provider value={value}>
      {children}
    </RecentViewContext.Provider>
  )
}