import { useState, useCallback } from 'react'
import { CartItem } from '../types'

export const useCart = () => {
  // 임시 장바구니 데이터 (현대백화점 스타일 상품들)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      productId: '1',
      quantity: 1,
      product: {
        id: '1',
        name: '시그니처 캐시미어 코트',
        price: 890000,
        image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
        category: 'women',
        brand: 'MAX MARA'
      }
    },
    {
      id: '2',
      productId: '2',
      quantity: 2,
      product: {
        id: '2',
        name: '프리미엄 실크 블라우스',
        price: 320000,
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
        category: 'women',
        brand: 'THEORY'
      }
    },
    {
      id: '3',
      productId: '3',
      quantity: 1,
      product: {
        id: '3',
        name: '이탈리안 레더 핸드백',
        price: 1250000,
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
        category: 'bags',
        brand: 'BOTTEGA VENETA'
      }
    }
  ])

  // 선택된 아이템들의 ID를 관리
  const [selectedItems, setSelectedItems] = useState<string[]>(
    cartItems.map(item => item.id) // 초기에는 모든 아이템이 선택됨
  )

  // 전체 선택 상태 확인
  const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length

  // 수량 업데이트
  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }
    
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }, [])

  // 개별 아이템 삭제
  const removeItem = useCallback((itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId))
    setSelectedItems(selected => selected.filter(id => id !== itemId))
  }, [])

  // 선택된 아이템들 삭제
  const removeSelectedItems = useCallback(() => {
    setCartItems(items => items.filter(item => !selectedItems.includes(item.id)))
    setSelectedItems([])
  }, [selectedItems])

  // 개별 아이템 선택/해제
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(selected => {
      if (selected.includes(itemId)) {
        return selected.filter(id => id !== itemId)
      } else {
        return [...selected, itemId]
      }
    })
  }, [])

  // 전체 선택/해제
  const toggleAllSelection = useCallback(() => {
    if (isAllSelected) {
      setSelectedItems([])
    } else {
      setSelectedItems(cartItems.map(item => item.id))
    }
  }, [isAllSelected, cartItems])

  // 총 가격 계산
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }, [cartItems])

  // 선택된 아이템들의 총 가격 계산
  const getSelectedTotalPrice = useCallback(() => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }, [cartItems, selectedItems])

  // 가격 포맷팅
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }, [])

  return {
    cartItems,
    selectedItems,
    isAllSelected,
    updateQuantity,
    removeItem,
    removeSelectedItems,
    toggleItemSelection,
    toggleAllSelection,
    getTotalPrice,
    getSelectedTotalPrice,
    formatPrice
  }
}