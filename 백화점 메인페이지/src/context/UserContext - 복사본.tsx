import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCurrentUser } from '../services/userService'
import { User } from '../types'

interface UserContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  updateUserInfo: (userData: Partial<User>) => void
  refreshUserInfo: () => void
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

  useEffect(() => {
    // 초기 사용자 정보 로드
    const loadUser = async () => {
      const user = await getCurrentUser()
      if (user) {
        setCurrentUser(user)
      }
    }
    loadUser()
  }, [])

  const updateUserInfo = (userData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData }
      setCurrentUser(updatedUser)
    }
  }

  const refreshUserInfo = async () => {
    const user = await getCurrentUser()
    if (user) {
      setCurrentUser(user)
    }
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, updateUserInfo, refreshUserInfo }}>
      {children}
    </UserContext.Provider>
  )
}
