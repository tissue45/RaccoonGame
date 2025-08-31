import { supabase } from './supabase'
import { User } from '../types'

export interface SignupData {
  email: string
  password: string
  name: string
  phone: string
  address: string
  agreeMarketing: boolean
}

export interface LoginData {
  email: string
  password: string
}

// AuthUser 타입을 User 타입으로 통일
export interface AuthUser {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  created_at: string
  updated_at?: string
}

// 회원가입
export const signup = async (userData: SignupData): Promise<{ success: boolean; error?: string }> => {
  try {
    // Supabase Auth를 사용하여 사용자 생성 (이메일 확인 없이)
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          agree_marketing: userData.agreeMarketing
        }
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user) {
      // users 테이블에 추가 정보 저장
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            address: userData.address,
            agree_marketing: userData.agreeMarketing
          }
        ])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // 프로필 생성 실패 시에도 계정은 생성됨
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Signup error:', error)
    return { success: false, error: '회원가입 중 오류가 발생했습니다.' }
  }
}

// 로그인
export const login = async (loginData: LoginData): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user) {
      // users 테이블에서 사용자 정보 가져오기
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        return { success: false, error: '사용자 정보를 가져올 수 없습니다.' }
      }

      // 로컬스토리지 저장 코드 삭제 - DB에서만 관리
      return { success: true, user: userProfile }
    }

    return { success: false, error: '로그인에 실패했습니다.' }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: '로그인 중 오류가 발생했습니다.' }
  }
}

// 로그아웃
export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// 현재 사용자 정보 가져오기 (DB에서만 조회)
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    // users 테이블에서 사용자 정보 가져오기
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
      return null
    }

    return userProfile
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// 이메일 중복 확인
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116는 결과가 없을 때
      console.error('Email check error:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Email check error:', error)
    return false
  }
}

// 회원정보 업데이트
export const updateUserProfile = async (userId: string, userData: {
  name: string
  email: string
  phone: string
  address: string
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Profile update error:', error)
    return { success: false, error: '회원정보 업데이트 중 오류가 발생했습니다.' }
  }
}

// 아이디 찾기 (이름과 휴대폰 번호로 이메일 찾기)
export const findUserIdByNameAndPhone = async (name: string, phone: string): Promise<{ success: boolean; email?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')  // select('email') 대신 select('*') 사용
      .eq('name', name)
      .eq('phone', phone)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // 결과가 없을 때
        return { success: false, error: '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.' }
      }
      console.error('Find user ID error:', error)
      return { success: false, error: '아이디 찾기 중 오류가 발생했습니다.' }
    }

    return { success: true, email: data.email }
  } catch (error) {
    console.error('Find user ID error:', error)
    return { success: false, error: '아이디 찾기 중 오류가 발생했습니다.' }
  }
}

// 비밀번호 찾기 (이름, 이메일, 휴대폰 번호로 사용자 확인)
export const findUserForPasswordReset = async (email: string, name: string, phone: string): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('name', name)
      .eq('phone', phone)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // 결과가 없을 때
        return { success: false, error: '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.' }
      }
      console.error('Find user for password reset error:', error)
      return { success: false, error: '사용자 확인 중 오류가 발생했습니다.' }
    }

    return { success: true, user: data }
  } catch (error) {
    console.error('Find user for password reset error:', error)
    return { success: false, error: '사용자 확인 중 오류가 발생했습니다.' }
  }
}

// 이메일로 임시 비밀번호 전송
export const sendTempPasswordEmail = async (email: string, tempPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`  // 여기가 핵심!
    })

    if (error) {
      console.error('Password reset email error:', error)
      return { success: false, error: '이메일 전송 중 오류가 발생했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Send temp password email error:', error)
    return { success: false, error: '이메일 전송 중 오류가 발생했습니다.' }
  }
}

// 임시 비밀번호로 비밀번호 업데이트 (수정)
export const updatePasswordWithTemp = async (userId: string, tempPassword: string, email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // 이메일로 비밀번호 재설정 링크 전송
    const emailResult = await sendTempPasswordEmail(email, tempPassword)
    
    if (!emailResult.success) {
      return emailResult
    }

    console.log(`사용자 ${email}에게 비밀번호 재설정 이메일 전송됨`)
    
    return { success: true }
  } catch (error) {
    console.error('Password update error:', error)
    return { success: false, error: '비밀번호 업데이트 중 오류가 발생했습니다.' }
  }
}
