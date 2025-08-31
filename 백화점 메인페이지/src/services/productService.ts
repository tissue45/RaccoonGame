import { supabase } from './supabase'
import { Product, Category } from '../types'

// 모든 상품 가져오기
export const getAllProducts = async (): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'forsale')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching products:', error)
            return []
        }

        return data?.map(product => ({
            ...product,
            image: product.image_urls?.[0] || '/placeholder-image.jpg'
        })) || []
    } catch (error) {
        console.error('Error in getAllProducts:', error)
        return []
    }
}

// 카테고리별 상품 가져오기
export const getProductsByCategory = async (categoryId: number): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', categoryId)
            .eq('status', 'forsale')
            .order('sales', { ascending: false })

        if (error) {
            console.error('Error fetching products by category:', error)
            return []
        }

        return data?.map(product => ({
            ...product,
            image: product.image_urls?.[0] || '/placeholder-image.jpg'
        })) || []
    } catch (error) {
        console.error('Error in getProductsByCategory:', error)
        return []
    }
}

// 특정 상품 가져오기
export const getProductById = async (id: number): Promise<Product | null> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching product by id:', error)
            return null
        }

        return {
            ...data,
            image: data.image_urls?.[0] || '/placeholder-image.jpg'
        }
    } catch (error) {
        console.error('Error in getProductById:', error)
        return null
    }
}

// 인기 상품 가져오기 (판매량 기준)
export const getPopularProducts = async (limit: number = 8): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'forsale')
            .order('sales', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching popular products:', error)
            return []
        }

        return data?.map(product => ({
            ...product,
            image: product.image_urls?.[0] || '/placeholder-image.jpg'
        })) || []
    } catch (error) {
        console.error('Error in getPopularProducts:', error)
        return []
    }
}

// 신상품 가져오기
export const getNewProducts = async (limit: number = 8): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'forsale')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching new products:', error)
            return []
        }

        return data?.map(product => ({
            ...product,
            image: product.image_urls?.[0] || '/placeholder-image.jpg'
        })) || []
    } catch (error) {
        console.error('Error in getNewProducts:', error)
        return []
    }
}

// 모든 카테고리 가져오기
export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (error) {
            console.error('Error fetching categories:', error)
            return []
        }

        console.log('Categories data:', data) // 카테고리 구조 확인
        return data || []
    } catch (error) {
        console.error('Error in getAllCategories:', error)
        return []
    }
}

// 계층형 카테고리 가져오기 (레벨1, 레벨2)
export const getCategoriesHierarchy = async (): Promise<any[]> => {
    try {
        // 카테고리 레벨1 테이블에서 데이터 가져오기
        const { data: level1Data, error: level1Error } = await supabase
            .from('categories_level1')
            .select('*')
            .order('name')

        if (level1Error) {
            console.error('Error fetching level1 categories:', level1Error)
            return []
        }

        // 카테고리 레벨2 테이블에서 데이터 가져오기
        const { data: level2Data, error: level2Error } = await supabase
            .from('categories_level2')
            .select('*')
            .order('name')

        if (level2Error) {
            console.error('Error fetching level2 categories:', level2Error)
            return []
        }

        console.log('Level1 categories:', level1Data)
        console.log('Level2 categories:', level2Data)
        
        // 레벨1 카테고리들을 찾고, 각각에 대해 레벨2 카테고리들을 매핑
        const level1Categories = level1Data || []
        const level2Categories = level2Data || []
        
        return level1Categories.map(level1 => ({
            ...level1,
            subcategories: level2Categories.filter(level2 => level2.level1_id === level1.id)
        }))
    } catch (error) {
        console.error('Error in getCategoriesHierarchy:', error)
        return []
    }
}

// 3단계 계층형 카테고리 가져오기 (레벨1, 레벨2, 레벨3)
export const getCategoriesHierarchy3Level = async (): Promise<any[]> => {
    try {
        // 카테고리 레벨1 테이블에서 데이터 가져오기
        const { data: level1Data, error: level1Error } = await supabase
            .from('categories_level1')
            .select('*')
            .order('name')

        if (level1Error) {
            console.error('Error fetching level1 categories:', level1Error)
            return []
        }

        // 카테고리 레벨2 테이블에서 데이터 가져오기
        const { data: level2Data, error: level2Error } = await supabase
            .from('categories_level2')
            .select('*')
            .order('name')

        if (level2Error) {
            console.error('Error fetching level2 categories:', level2Error)
            return []
        }

        // 카테고리 레벨3 테이블에서 데이터 가져오기
        const { data: level3Data, error: level3Error } = await supabase
            .from('categories_level3')
            .select('*')
            .order('name')

        if (level3Error) {
            console.error('Error fetching level3 categories:', level3Error)
            return []
        }

        console.log('Level1 categories:', level1Data)
        console.log('Level2 categories:', level2Data)
        console.log('Level3 categories:', level3Data)
        
        // 레벨1 카테고리들을 찾고, 각각에 대해 레벨2 카테고리들을 매핑
        const level1Categories = level1Data || []
        const level2Categories = level2Data || []
        const level3Categories = level3Data || []
        
        return level1Categories.map(level1 => ({
            ...level1,
            subcategories: level2Categories
                .filter(level2 => level2.level1_id === level1.id)
                .map(level2 => ({
                    ...level2,
                    subcategories: level3Categories.filter(level3 => level3.level2_id === level2.id)
                }))
        }))
    } catch (error) {
        console.error('Error in getCategoriesHierarchy3Level:', error)
        return []
    }
}

// 상품 검색 (기본)
export const searchProducts = async (query: string): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'forsale')
            .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
            .order('sales', { ascending: false })

        if (error) {
            console.error('Error searching products:', error)
            return []
        }

        return data?.map(product => ({
            ...product,
            image: product.image_urls?.[0] || '/placeholder-image.jpg'
        })) || []
    } catch (error) {
        console.error('Error in searchProducts:', error)
        return []
    }
}

// 고급 검색 (필터링 포함)
export const advancedSearchProducts = async (
    query: string,
    filters: {
        categoryId?: number,
        minPrice?: number,
        maxPrice?: number,
        brand?: string,
        sortBy?: 'name' | 'price' | 'sales' | 'created_at',
        sortOrder?: 'asc' | 'desc'
    } = {}
): Promise<Product[]> => {
    try {
        let queryBuilder = supabase
            .from('products')
            .select('*')
            .eq('status', 'forsale')

        // 검색어가 있는 경우
        if (query && query.trim()) {
            queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
        }

        // 카테고리 필터
        if (filters.categoryId) {
            queryBuilder = queryBuilder.eq('category_id', filters.categoryId)
        }

        // 가격 범위 필터
        if (filters.minPrice !== undefined) {
            queryBuilder = queryBuilder.gte('price', filters.minPrice)
        }
        if (filters.maxPrice !== undefined) {
            queryBuilder = queryBuilder.lte('price', filters.maxPrice)
        }

        // 브랜드 필터
        if (filters.brand) {
            queryBuilder = queryBuilder.ilike('brand', `%${filters.brand}%`)
        }

        // 정렬
        const sortBy = filters.sortBy || 'sales'
        const sortOrder = filters.sortOrder || 'desc'
        queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' })

        const { data, error } = await queryBuilder

        if (error) {
            console.error('Error in advanced search:', error)
            return []
        }

        return data?.map(product => ({
            ...product,
            image: product.image_urls?.[0] || '/placeholder-image.jpg'
        })) || []
    } catch (error) {
        console.error('Error in advancedSearchProducts:', error)
        return []
    }
}

// 검색 자동완성 (상품명, 브랜드)
export const getSearchSuggestions = async (query: string, limit: number = 10): Promise<string[]> => {
    try {
        if (!query || query.trim().length < 2) {
            return []
        }

        // 상품명에서 검색
        const { data: nameResults, error: nameError } = await supabase
            .from('products')
            .select('name')
            .eq('status', 'forsale')
            .ilike('name', `%${query}%`)
            .limit(limit)

        // 브랜드에서 검색
        const { data: brandResults, error: brandError } = await supabase
            .from('products')
            .select('brand')
            .eq('status', 'forsale')
            .not('brand', 'is', null)
            .ilike('brand', `%${query}%`)
            .limit(limit)

        if (nameError || brandError) {
            console.error('Error fetching search suggestions:', nameError || brandError)
            return []
        }

        const suggestions = new Set<string>()
        
        // 상품명 추가
        nameResults?.forEach(item => {
            if (item.name) suggestions.add(item.name)
        })
        
        // 브랜드 추가
        brandResults?.forEach(item => {
            if (item.brand) suggestions.add(item.brand)
        })

        // 검색어와 가장 유사한 순으로 정렬
        const sortedSuggestions = Array.from(suggestions)
            .sort((a, b) => {
                const aStartsWithQuery = a.toLowerCase().startsWith(query.toLowerCase())
                const bStartsWithQuery = b.toLowerCase().startsWith(query.toLowerCase())
                
                if (aStartsWithQuery && !bStartsWithQuery) return -1
                if (!aStartsWithQuery && bStartsWithQuery) return 1
                
                return a.length - b.length
            })
            .slice(0, limit)

        return sortedSuggestions
    } catch (error) {
        console.error('Error in getSearchSuggestions:', error)
        return []
    }
}

// 인기 검색어 가져오기
export const getPopularSearchTerms = async (limit: number = 10): Promise<string[]> => {
    try {
        // 최근 검색 기록이나 인기 상품명을 기반으로 인기 검색어 반환
        // 실제 구현에서는 검색 로그 테이블이 필요하지만, 여기서는 인기 상품명을 사용
        const { data, error } = await supabase
            .from('products')
            .select('name')
            .eq('status', 'forsale')
            .order('sales', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching popular search terms:', error)
            return []
        }

        return data?.map(item => item.name).filter(Boolean) || []
    } catch (error) {
        console.error('Error in getPopularSearchTerms:', error)
        return []
    }
}

// 검색 결과 개수 가져오기
export const getSearchResultCount = async (query: string, filters: any = {}): Promise<number> => {
    try {
        let queryBuilder = supabase
            .from('products')
            .select('id', { count: 'exact' })
            .eq('status', 'forsale')

        if (query && query.trim()) {
            queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
        }

        if (filters.categoryId) {
            queryBuilder = queryBuilder.eq('category_id', filters.categoryId)
        }

        if (filters.minPrice !== undefined) {
            queryBuilder = queryBuilder.gte('price', filters.minPrice)
        }

        if (filters.maxPrice !== undefined) {
            queryBuilder = queryBuilder.lte('price', filters.maxPrice)
        }

        const { count, error } = await queryBuilder

        if (error) {
            console.error('Error getting search result count:', error)
            return 0
        }

        return count || 0
    } catch (error) {
        console.error('Error in getSearchResultCount:', error)
        return 0
    }
}

// 할인 상품 가져오기 (가격 기준으로 정렬)
export const getDiscountedProducts = async (limit: number = 8): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'forsale')
            .order('price', { ascending: true })
            .limit(limit)

        if (error) {
            console.error('Error fetching discounted products:', error)
            return []
        }

        return data?.map(product => ({
            ...product,
            image: product.image_urls?.[0] || '/placeholder-image.jpg'
        })) || []
    } catch (error) {
        console.error('Error in getDiscountedProducts:', error)
        return []
    }
}

// 관련 상품 가져오기 (같은 카테고리의 다른 상품들)
export const getRelatedProducts = async (productId: number, categoryId: number, limit: number = 4): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', categoryId)
            .eq('status', 'forsale')
            .neq('id', productId)
            .order('sales', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching related products:', error)
            return []
        }

        return data?.map(product => ({
            ...product,
            image: product.image_urls?.[0] || '/placeholder-image.jpg'
        })) || []
    } catch (error) {
        console.error('Error in getRelatedProducts:', error)
        return []
    }
}

// 특정 카테고리 가져오기
export const getCategoryById = async (categoryId: number): Promise<Category | null> => {
    try {
        // 먼저 categories_level2에서 찾기
        const { data: level2Data, error: level2Error } = await supabase
            .from('categories_level2')
            .select('*')
            .eq('id', categoryId)
            .single()

        if (level2Data) {
            return {
                id: level2Data.id,
                name: level2Data.name,
                description: level2Data.description,
                level: 2,
                parent_id: level2Data.level1_id,
                created_at: level2Data.created_at,
                updated_at: level2Data.updated_at
            }
        }

        // categories_level1에서 찾기
        const { data: level1Data, error: level1Error } = await supabase
            .from('categories_level1')
            .select('*')
            .eq('id', categoryId)
            .single()

        if (level1Data) {
            return {
                id: level1Data.id,
                name: level1Data.name,
                description: level1Data.description,
                level: 1,
                parent_id: undefined,
                created_at: level1Data.created_at,
                updated_at: level1Data.updated_at
            }
        }

        return null
    } catch (error) {
        console.error('Error fetching category by id:', error)
        return null
    }
}

// 레벨3 카테고리별 상품 가져오기
export const getProductsByLevel3Category = async (level3CategoryId: number): Promise<{products: Product[], categoryName: string}> => {
    try {
        // 먼저 레벨3 카테고리 정보 가져오기
        const { data: level3Category, error: level3Error } = await supabase
            .from('categories_level3')
            .select('*')
            .eq('id', level3CategoryId)
            .single()

        if (level3Error) {
            console.error('Error fetching level3 category:', level3Error)
            throw level3Error
        }

        // products 테이블에서 해당 레벨3 카테고리 ID와 일치하는 상품들 가져오기
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', level3CategoryId)
            .eq('status', 'forsale')
            .order('created_at', { ascending: false })

        if (productsError) {
            console.error('Error fetching products by level3 category:', productsError)
            throw productsError
        }

        console.log('Found products for level3 category:', products) // 디버깅용

        return {
            products: products?.map(product => ({
                ...product,
                image: product.image_urls?.[0] || '/placeholder-image.jpg'
            })) || [],
            categoryName: level3Category.name
        }
    } catch (error) {
        console.error('Error in getProductsByLevel3Category:', error)
        // 에러 발생 시 빈 배열 반환
        return {
            products: [],
            categoryName: '카테고리'
        }
    }
}