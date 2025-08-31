import React, { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const TestPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testSupabase = async () => {
      try {
        // 테이블 존재 여부 확인
        console.log('Testing Supabase connection...')
        
        // category_level1 테이블 테스트
        const { data: level1Data, error: level1Error } = await supabase
          .from('category_level1')
          .select('*')
          .limit(5)
        
        if (level1Error) {
          console.error('Level1 table error:', level1Error)
          setError(`Level1 테이블 오류: ${level1Error.message}`)
        } else {
          console.log('Level1 data:', level1Data)
        }

        // category_level2 테이블 테스트
        const { data: level2Data, error: level2Error } = await supabase
          .from('category_level2')
          .select('*')
          .limit(5)
        
        if (level2Error) {
          console.error('Level2 table error:', level2Error)
          setError(`Level2 테이블 오류: ${level2Error.message}`)
        } else {
          console.log('Level2 data:', level2Data)
        }

        // 기존 categories 테이블도 확인
        const { data: oldCategories, error: oldError } = await supabase
          .from('categories')
          .select('*')
          .limit(5)
        
        if (oldError) {
          console.error('Old categories table error:', oldError)
        } else {
          console.log('Old categories data:', oldCategories)
        }

        // 모든 테이블 목록 확인
        const { data: tables, error: tablesError } = await supabase
          .rpc('get_tables')
          .select('*')
        
        if (tablesError) {
          console.log('Tables RPC not available, trying direct query...')
          // 직접 쿼리로 테이블 확인
          const { data: directTables, error: directError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
          
          if (directError) {
            console.error('Direct table query error:', directError)
          } else {
            console.log('Available tables:', directTables)
          }
        } else {
          console.log('Available tables:', tables)
        }

      } catch (err) {
        console.error('Test error:', err)
        setError(`테스트 오류: ${err}`)
      }
    }

    testSupabase()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase 테스트 페이지</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
        <p>브라우저 콘솔을 확인하여 Supabase 연결 상태와 테이블 구조를 확인하세요.</p>
        <p>F12를 눌러 개발자 도구를 열고 Console 탭을 확인하세요.</p>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">현재 구현된 기능:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>카테고리 타입에 level, parent_id 필드 추가</li>
          <li>getCategoriesHierarchy 함수에서 category_level1, category_level2 테이블 사용</li>
          <li>헤더 햄버거 메뉴에서 카테고리 레벨1과 레벨2 표시</li>
        </ul>
      </div>

      <div className="bg-yellow-100 p-4 rounded mt-4">
        <h2 className="text-lg font-semibold mb-2">필요한 Supabase 테이블 구조:</h2>
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold">category_level1 테이블:</h3>
            <ul className="list-disc list-inside ml-4">
              <li>id (int, primary key)</li>
              <li>name (text) - 예: "의류/패션", "뷰티", "식품"</li>
              <li>description (text, optional)</li>
              <li>created_at (timestamp)</li>
              <li>updated_at (timestamp)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">category_level2 테이블:</h3>
            <ul className="list-disc list-inside ml-4">
              <li>id (int, primary key)</li>
              <li>name (text) - 예: "여성의류", "남성의류", "신발" 등</li>
              <li>parent_id (int, foreign key to category_level1.id)</li>
              <li>description (text, optional)</li>
              <li>created_at (timestamp)</li>
              <li>updated_at (timestamp)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPage

