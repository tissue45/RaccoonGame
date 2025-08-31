import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // URL에서 access_token과 refresh_token 확인 (프래그먼트에서 파싱)
    const hash = window.location.hash.substring(1) // # 제거
    const params = new URLSearchParams(hash)
    
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    
    console.log('Parsed tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken })
    
    if (!accessToken || !refreshToken) {
      setErrorMessage('유효하지 않은 링크입니다. 토큰을 찾을 수 없습니다.')
      return
    }

    // 세션 설정
    const setSession = async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (error) {
        console.error('Session set error:', error)
        setErrorMessage('세션 설정 중 오류가 발생했습니다: ' + error.message)
      } else {
        console.log('Session set successfully')
      }
    }

    setSession()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setErrorMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        setErrorMessage(error.message)
      } else {
        setStep('success')
      }
    } catch (error) {
      console.error('Password update error:', error)
      setErrorMessage('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  if (step === 'success') {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-10 px-5">
        <div className="bg-transparent p-12 w-full max-w-[420px] text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">✓</div>
            <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">비밀번호 변경 완료</h1>
            <p className="text-gray-500 text-sm">새 비밀번호로 로그인하실 수 있습니다.</p>
          </div>

          <button 
            onClick={handleBackToLogin} 
            className="w-full py-4 bg-black text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg"
          >
            로그인하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-10 px-5">
      <div className="bg-transparent p-12 w-full max-w-[420px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">새 비밀번호 설정</h1>
          <p className="text-gray-500 text-sm m-0">새로운 비밀번호를 입력해주세요</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{errorMessage}</p>
          </div>
        )}

        <form className="mb-8" onSubmit={handleSubmit}>
          <div className="mb-5">
            <input
              type="password"
              name="password"
              placeholder="새 비밀번호"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="mb-8">
            <input
              type="password"
              name="confirmPassword"
              placeholder="새 비밀번호 확인"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-black text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading}
          >
            {isLoading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link to="/login" className="text-gray-500 no-underline transition-colors duration-300 hover:text-black">로그인 페이지로 돌아가기</Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
