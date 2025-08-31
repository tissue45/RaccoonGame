import { supabase } from './supabase'

// 검색 로그 저장
export const saveSearchLog = async (query: string, userId?: string) => {
  try {
    const { error } = await supabase
      .from('search_logs')
      .insert({
        query: query.trim().toLowerCase(),
        user_id: userId || null,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('검색 로그 저장 실패:', error)
    }
  } catch (error) {
    console.error('검색 로그 저장 중 오류:', error)
  }
}

// 인기 검색어 가져오기 (실제 검색 로그 기반)
export const getPopularSearchTermsFromLogs = async (limit: number = 10): Promise<string[]> => {
  try {
    // 최근 30일간의 검색 로그에서 인기 검색어 추출
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('search_logs')
      .select('query, count')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .select('query')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('검색 로그 조회 실패:', error)
      return []
    }

    // 검색어 빈도 계산
    const queryCounts: { [key: string]: number } = {}
    data?.forEach(log => {
      if (log.query) {
        queryCounts[log.query] = (queryCounts[log.query] || 0) + 1
      }
    })

    // 빈도순으로 정렬하여 상위 검색어 반환
    const sortedQueries = Object.entries(queryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query]) => query)

    return sortedQueries
  } catch (error) {
    console.error('인기 검색어 조회 실패:', error)
    return []
  }
}

// 연관 검색어 가져오기
export const getRelatedSearchTerms = async (query: string, limit: number = 5): Promise<string[]> => {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    const { data, error } = await supabase
      .from('search_logs')
      .select('query')
      .ilike('query', `%${query}%`)
      .neq('query', query.trim().toLowerCase())
      .order('created_at', { ascending: false })
      .limit(limit * 2) // 중복 제거를 위해 더 많이 가져옴

    if (error) {
      console.error('연관 검색어 조회 실패:', error)
      return []
    }

    // 중복 제거 및 정렬
    const uniqueQueries = [...new Set(data?.map(log => log.query).filter(Boolean))]
    return uniqueQueries.slice(0, limit)
  } catch (error) {
    console.error('연관 검색어 조회 실패:', error)
    return []
  }
}

// 검색 통계 가져오기
export const getSearchStats = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('search_logs')
      .select('created_at')
      .eq('query', query.trim().toLowerCase())

    if (error) {
      console.error('검색 통계 조회 실패:', error)
      return { totalSearches: 0, recentSearches: 0 }
    }

    const totalSearches = data?.length || 0
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const recentSearches = data?.filter(log => 
      new Date(log.created_at) > oneWeekAgo
    ).length || 0

    return { totalSearches, recentSearches }
  } catch (error) {
    console.error('검색 통계 조회 실패:', error)
    return { totalSearches: 0, recentSearches: 0 }
  }
}

// 검색 히스토리 가져오기 (사용자별)
export const getUserSearchHistory = async (userId: string, limit: number = 10): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('search_logs')
      .select('query')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('사용자 검색 히스토리 조회 실패:', error)
      return []
    }

    // 중복 제거 (최신 검색어만 유지)
    const uniqueQueries = [...new Set(data?.map(log => log.query).filter(Boolean))]
    return uniqueQueries
  } catch (error) {
    console.error('사용자 검색 히스토리 조회 실패:', error)
    return []
  }
}

// 검색어 자동완성 (검색 로그 기반)
export const getSearchSuggestionsFromLogs = async (query: string, limit: number = 8): Promise<string[]> => {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    const { data, error } = await supabase
      .from('search_logs')
      .select('query')
      .ilike('query', `${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit * 2)

    if (error) {
      console.error('검색 로그 기반 자동완성 조회 실패:', error)
      return []
    }

    // 중복 제거 및 정렬
    const uniqueQueries = [...new Set(data?.map(log => log.query).filter(Boolean))]
    
    // 검색어와 가장 유사한 순으로 정렬
    const sortedQueries = uniqueQueries
      .sort((a, b) => {
        const aStartsWithQuery = a.toLowerCase().startsWith(query.toLowerCase())
        const bStartsWithQuery = b.toLowerCase().startsWith(query.toLowerCase())
        
        if (aStartsWithQuery && !bStartsWithQuery) return -1
        if (!aStartsWithQuery && bStartsWithQuery) return 1
        
        return a.length - b.length
      })
      .slice(0, limit)

    return sortedQueries
  } catch (error) {
    console.error('검색 로그 기반 자동완성 조회 실패:', error)
    return []
  }
}
