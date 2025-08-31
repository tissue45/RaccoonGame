import React, { useEffect } from 'react'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration])

  if (!isVisible) return null

  return (
    <div className="fixed top-5 right-5 z-50 animate-slide-in md:top-5 md:right-5 md:left-auto md:min-w-[300px] md:max-w-[400px] sm:top-3 sm:right-3 sm:left-3">
      <div className="bg-gray-800 text-white py-3 px-4 rounded-lg shadow-lg flex items-center gap-3 min-w-0">
        <span className="flex-1 text-sm leading-relaxed">{message}</span>
        <button 
          className="bg-transparent border-none text-white text-lg cursor-pointer p-0 w-5 h-5 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-200"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast