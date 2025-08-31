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
            console.error('Error in getNewProducts:', error)
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

        return data || []
    } catch (error) {
        console.error('Error in getAllCategories:', error)
        return []
    }
}

// 계층형 카테고리 가져오기
export const getCategoriesHierarchy = async (): Promise<any[]> => {
    try {
        // 레벨1 카테고리들 가져오기
        const { data: level1Data, error: level1Error } = await supabase
            .from('categories')
            .select('*')
            .eq('level', 1)
            .order('name')

        if (level1Error) {
            console.error('Error fetching level1 categories:', level1Error)
            return []
        }

        // 레벨2 카테고리들 가져오기
        const { data: level2Data, error: level2Error } = await supabase
            .from('categories')
            .select('*')
            .eq('level', 2)
            .order('name')

        if (level2Error) {
            console.error('Error fetching level2 categories:', level2Error)
            return []
        }

        // 레벨3 카테고리들 가져오기
        const { data: level3Data, error: level3Error } = await supabase
            .from('categories')
            .select('*')
            .eq('level', 3)
            .order('name')

        if (level3Error) {
            console.error('Error fetching level3 categories:', level3Error)
            return []
        }

        // 계층 구조로 매핑
        return level1Data.map(level1 => ({
            ...level1,
            subcategories: level2Data
                .filter(level2 => level2.parent_id === level1.id)
                .map(level2 => ({
                    ...level2,
                    subcategories: level3Data.filter(level3 => level3.parent_id === level2.id)
                }))
        }))
    } catch (error) {
        console.error('Error in getCategoriesHierarchy:', error)
        return []
    }
}

// 상품 검색
export const searchProducts = async (query: string): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'forsale')
            .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
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
        const { data: category, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .single()

        if (error) {
            console.error('Error fetching category by id:', error)
            return null
        }

        return {
            id: category.id,
            name: category.name,
            description: category.description,
            level: category.level,
            parent_id: category.parent_id,
            created_at: category.created_at,
            updated_at: category.updated_at
        }
    } catch (error) {
        console.error('Error in getCategoryById:', error)
        return null
    }
}

// 카테고리별 상품 가져오기
export const getProductsByLevel3Category = async (level3CategoryId: number): Promise<{products: Product[], categoryName: string}> => {
    try {
        console.log('Fetching products for level3 category ID:', level3CategoryId)
        
        // categories 테이블에서 레벨3 카테고리 정보 가져오기
        const { data: level3Category, error: level3Error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', level3CategoryId)
            .eq('level', 3)
            .single()

        if (level3Error) {
            console.error('Error fetching level3 category:', level3Error)
            throw level3Error
        }

        console.log('Found level3 category:', level3Category)

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

        console.log('Found products:', products)

        return {
            products: products?.map(product => ({
                ...product,
                image: product.image_urls?.[0] || '/placeholder-image.jpg'
            })) || [],
            categoryName: level3Category.name
        }
    } catch (error) {
        console.error('Error in getProductsByLevel3Category:', error)
        return {
            products: [],
            categoryName: '카테고리'
        }
    }
}
