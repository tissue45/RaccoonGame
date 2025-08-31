import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { findUserIdByNameAndPhone } from '../services/userService'

const FindIdPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [foundEmail, setFoundEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // 전화번호는 숫자만 저장 (하이픈 제거)
    if (name === 'phone') {
      const phoneNumber = value.replace(/[^0-9]/g, '') // 숫자만 추출
      setFormData(prev => ({
        ...prev,
        [name]: phoneNumber
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // 에러 메시지 초기화
    setErrorMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      // 데이터베이스에서 이름과 휴대폰 번호로 이메일 찾기
      const result = await findUserIdByNameAndPhone(formData.name, formData.phone)
      
      if (result.success && result.email) {
        setFoundEmail(result.email)
        setStep('success')
      } else {
        setErrorMessage(result.error || '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('아이디 찾기 오류:', error)
      setErrorMessage('아이디 찾기 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  const handleGoToForgotPassword = () => {
    navigate('/forgot-password')
  }

  if (step === 'success') {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-10 px-5">
        <div className="bg-transparent p-12 w-full max-w-[420px] text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">✓</div>
            <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">아이디 찾기 완료</h1>
            <p className="text-gray-500 text-sm">회원님의 아이디를 찾았습니다.</p>
          </div>

          <div className="bg-green-50 rounded-lg p-8 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">찾은 아이디</h3>
            <p className="text-2xl font-bold text-green-600 mb-4">
              {foundEmail}
            </p>
            <p className="text-sm text-gray-600">
              위 아이디로 로그인하실 수 있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleBackToLogin} 
              className="w-full py-4 bg-black text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg"
            >
              로그인하기
            </button>
            <button 
              onClick={handleGoToForgotPassword} 
              className="w-full py-4 bg-white text-black border-2 border-black rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-black hover:text-white hover:-translate-y-0.5 hover:shadow-lg"
            >
              비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-10 px-5">
      <div className="bg-transparent p-12 w-full max-w-[420px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">아이디 찾기</h1>
          <p className="text-gray-500 text-sm m-0">가입 시 입력하신 이름과 휴대폰 번호를 입력해주세요</p>
        </div>

        <form className="mb-8" onSubmit={handleSubmit}>
          <div className="mb-5">
            <input
              type="text"
              name="name"
              placeholder="이름"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="mb-8">
            <input
              type="tel"
              name="phone"
              placeholder="휴대폰 번호 (숫자만 입력)"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* 에러 메시지 표시 */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{errorMessage}</p>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-4 bg-black text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading}
          >
            {isLoading ? '검색 중...' : '아이디 찾기'}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link to="/forgot-password" className="text-gray-500 no-underline transition-colors duration-300 hover:text-black">비밀번호 찾기</Link>
          <span className="text-gray-300 mx-2">|</span>
          <Link to="/login" className="text-gray-500 no-underline transition-colors duration-300 hover:text-black">로그인 페이지로 돌아가기</Link>
        </div>
      </div>
    </div>
  )
}

export default FindIdPage