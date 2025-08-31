import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCurrentUser } from '../services/userService'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
}

interface UserContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // 사용자 정보 새로고침 (DB에서만 가져오기)
  const refreshUser = async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        setCurrentUser(user)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setCurrentUser(null)
    }
  }

  // 초기 사용자 정보 로드
  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}
