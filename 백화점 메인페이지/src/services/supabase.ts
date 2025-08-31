import { createClient } from '@supabase/supabase-js'

// 하드코딩으로 테스트
const supabaseUrl = 'https://zyqbuuovliissozugjfq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5cWJ1dW92bGlpc3NvenVnamZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzQ4MTgsImV4cCI6MjA3MDIxMDgxOH0.TYj-kGTlsGlznZCYX4M1yIilu0z1iNZ6tcWg5iLIaHE'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase URL type:', typeof supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

// URL 유효성 검사
try {
  new URL(supabaseUrl)
  console.log('URL is valid')
} catch (error) {
  console.error('Invalid URL:', error)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)