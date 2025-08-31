import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, checkEmailExists } from '../services/userService'

const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    if (!formData.address.trim()) {
      alert('주소를 입력해주세요.')
      return
    }

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      alert('필수 약관에 동의해주세요.')
      return
    }

    setIsLoading(true)

    try {
      // 이메일 중복 확인
      const emailExists = await checkEmailExists(formData.email)
      if (emailExists) {
        alert('이미 가입된 이메일입니다.')
        setIsLoading(false)
        return
      }

      // 회원가입 실행
      const result = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        agreeMarketing: formData.agreeMarketing
      })

      if (result.success) {
        alert('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.')
        navigate('/login')
      } else {
        alert(result.error || '회원가입에 실패했습니다.')
      }
    } catch (error) {
      console.error('Signup error:', error)
      alert('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-10 px-5">
      <div className="bg-transparent p-12 w-full max-w-[480px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">회원가입</h1>
          <p className="text-gray-500 text-sm m-0">PREMIUM 회원이 되어 특별한 혜택을 누리세요</p>
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
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400"
            />
          </div>

          <div className="mb-5">
            <input
              type="email"
              name="email"
              placeholder="이메일 주소"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400"
            />
          </div>

          <div className="mb-5">
            <input
              type="tel"
              name="phone"
              placeholder="휴대폰 번호 (010-0000-0000)"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400"
            />
          </div>

          <div className="mb-5">
            <input
              type="text"
              name="address"
              placeholder="주소"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400"
            />
          </div>

          <div className="mb-5">
            <input
              type="password"
              name="password"
              placeholder="비밀번호 (8자 이상)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400"
            />
          </div>

          <div className="mb-8">
            <input
              type="password"
              name="confirmPassword"
              placeholder="비밀번호 확인"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400"
            />
          </div>

          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <label className="flex items-center cursor-pointer text-gray-700">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="hidden peer"
                />
                <span className="w-[18px] h-[18px] border border-gray-300 rounded-sm mr-3 relative transition-all duration-300 peer-checked:bg-black peer-checked:border-black after:content-[''] after:absolute after:left-[5px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 after:opacity-0 peer-checked:after:opacity-100"></span>
                <span className="text-red-500 font-semibold mr-1">[필수]</span> 이용약관 동의
              </label>
              <button type="button" className="text-sm text-gray-500 underline hover:text-black transition-colors">보기</button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <label className="flex items-center cursor-pointer text-gray-700">
                <input
                  type="checkbox"
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleChange}
                  className="hidden peer"
                />
                <span className="w-[18px] h-[18px] border border-gray-300 rounded-sm mr-3 relative transition-all duration-300 peer-checked:bg-black peer-checked:border-black after:content-[''] after:absolute after:left-[5px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 after:opacity-0 peer-checked:after:opacity-100"></span>
                <span className="text-red-500 font-semibold mr-1">[필수]</span> 개인정보 처리방침 동의
              </label>
              <button type="button" className="text-sm text-gray-500 underline hover:text-black transition-colors">보기</button>
            </div>

            <div className="flex items-center justify-between py-3">
              <label className="flex items-center cursor-pointer text-gray-700">
                <input
                  type="checkbox"
                  name="agreeMarketing"
                  checked={formData.agreeMarketing}
                  onChange={handleChange}
                  className="hidden peer"
                />
                <span className="w-[18px] h-[18px] border border-gray-300 rounded-sm mr-3 relative transition-all duration-300 peer-checked:bg-black peer-checked:border-black after:content-[''] after:absolute after:left-[5px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 after:opacity-0 peer-checked:after:opacity-100"></span>
                <span className="text-gray-500 font-semibold mr-1">[선택]</span> 마케팅 정보 수신 동의
              </label>
              <button type="button" className="text-sm text-gray-500 underline hover:text-black transition-colors">보기</button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-black text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {isLoading ? '처리중...' : '회원가입'}
          </button>
        </form>

        <div className="text-center">
          <div className="mb-4 text-sm text-gray-500">
            <span>이미 회원이신가요?</span>
          </div>
          <Link 
            to="/login" 
            className="inline-block w-full py-3.5 bg-white text-black border-2 border-black rounded-lg text-base font-semibold no-underline text-center cursor-pointer transition-all duration-300 box-border hover:bg-black hover:text-white hover:-translate-y-0.5 hover:shadow-lg"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SignupPage