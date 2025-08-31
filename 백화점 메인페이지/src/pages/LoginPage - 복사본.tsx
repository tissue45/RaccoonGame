import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/userService'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      })

      if (result.success && result.user) {
        alert(`${result.user.name}님, 환영합니다!`)
        navigate('/')
      } else {
        alert(result.error || '로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-10 px-5">
      <div className="bg-transparent p-12 w-full max-w-[420px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">로그인</h1>
          <p className="text-gray-500 text-sm m-0">PREMIUM에 오신 것을 환영합니다</p>
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
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400"
            />
          </div>

          <div className="mb-5">
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full py-4 px-5 border border-gray-200 rounded-lg text-base outline-none transition-all duration-300 bg-gray-50 box-border focus:border-black focus:bg-white focus:shadow-lg placeholder:text-gray-400"
            />
          </div>

          <div className="flex justify-between items-center mb-6 text-sm sm:flex-col sm:items-start sm:gap-3">
            <label className="flex items-center cursor-pointer text-gray-500">
              <input type="checkbox" className="hidden peer" />
              <span className="w-[18px] h-[18px] border border-gray-300 rounded-sm mr-2 relative transition-all duration-300 peer-checked:bg-black peer-checked:border-black after:content-[''] after:absolute after:left-[5px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 after:opacity-0 peer-checked:after:opacity-100"></span>
              로그인 상태 유지
            </label>
            <div className="flex items-center gap-2 sm:self-end">
              <Link to="/find-id" className="text-gray-500 no-underline transition-colors duration-300 text-sm hover:text-black">
                아이디 찾기
              </Link>
              <span className="text-gray-300 text-xs">|</span>
              <Link to="/forgot-password" className="text-gray-500 no-underline transition-colors duration-300 text-sm hover:text-black">
                비밀번호 찾기
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-black text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="my-8">
          <div className="text-center mb-6 text-base text-gray-800 font-medium">
            <span>간편하게 쇼핑 계속하기</span>
          </div>
          
          <div className="flex justify-center gap-6 mb-8 sm:gap-4">
            <button className="flex flex-col items-center gap-2 p-4 border-none rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 bg-transparent min-w-[80px] hover:-translate-y-0.5 sm:min-w-[70px]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center relative bg-yellow-300 sm:w-10 sm:h-10">
                <div className="w-6 h-6 bg-black rounded-full relative"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-black z-10"></div>
              </div>
              <span className="text-gray-500 text-sm">카카오</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 border-none rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 bg-transparent min-w-[80px] hover:-translate-y-0.5 sm:min-w-[70px]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center relative bg-green-500 text-white font-bold text-2xl sm:w-10 sm:h-10">
                N
              </div>
              <span className="text-gray-500 text-sm">네이버</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 border-none rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 bg-transparent min-w-[80px] hover:-translate-y-0.5 sm:min-w-[70px]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center relative bg-white border border-gray-200 sm:w-10 sm:h-10">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span className="text-gray-500 text-sm">구글</span>
            </button>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-4 text-sm text-gray-500">
            <span>아직 회원이 아니신가요?</span>
          </div>
          <Link 
            to="/signup" 
            className="inline-block w-full py-3.5 bg-white text-black border-2 border-black rounded-lg text-base font-semibold no-underline text-center cursor-pointer transition-all duration-300 box-border hover:bg-black hover:text-white hover:-translate-y-0.5 hover:shadow-lg"
            onClick={() => window.scrollTo(0, 0)}
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage