import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { findUserForPasswordReset, updatePasswordWithTemp } from '../services/userService'

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')

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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 데이터베이스에서 사용자 확인
      const result = await findUserForPasswordReset(formData.email, formData.name, formData.phone)
      
      if (result.success && result.user) {
        // 비밀번호 재설정 이메일 전송
        const updateResult = await updatePasswordWithTemp(result.user.id, '', result.user.email)
        
        if (updateResult.success) {
          setStep('success')
        } else {
          alert(updateResult.error || '비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.')
        }
      } else {
        alert(result.error || '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('비밀번호 찾기 오류:', error)
      alert('비밀번호 찾기 중 오류가 발생했습니다. 다시 시도해주세요.')
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
            <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">비밀번호 재설정 이메일 전송 완료</h1>
            <p className="text-gray-500 text-sm">입력하신 이메일로 비밀번호 재설정 링크가 전송되었습니다.</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-8 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">이메일을 확인해주세요</h3>
            <p className="text-sm text-gray-600 text-left space-y-2">
              <p>• 입력하신 이메일 주소로 비밀번호 재설정 링크가 전송되었습니다.</p>
              <p>• 스팸 메일함도 확인해보세요.</p>
              <p>• 이메일을 받지 못했다면 입력하신 정보를 다시 확인해주세요.</p>
              <p>• 링크를 클릭하여 새 비밀번호를 설정해주세요.</p>
            </p>
          </div>

          <button 
            onClick={handleBackToLogin} 
            className="w-full py-4 bg-black text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-10 px-5">
      <div className="bg-transparent p-12 w-full max-w-[420px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">비밀번호 재설정</h1>
          <p className="text-gray-500 text-sm m-0">가입 시 입력하신 정보를 모두 입력해주세요</p>
        </div>

        <form className="mb-8" onSubmit={handleSubmit}>
          <div className="mb-5">
            <input
              type="email"
              name="email"
              placeholder="이메일 주소"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

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

          <button 
            type="submit" 
            className="w-full py-4 bg-black text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            disabled={isLoading}
          >
            {isLoading ? '전송 중...' : '비밀번호 재설정 이메일 전송'}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link to="/find-id" className="text-gray-500 no-underline transition-colors duration-300 hover:text-black">아이디 찾기</Link>
          <span className="text-gray-300 mx-2">|</span>
          <Link to="/login" className="text-gray-500 no-underline transition-colors duration-300 hover:text-black">로그인 페이지로 돌아가기</Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage