import { Product } from '../types'

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: '시그니처 캐시미어 코트',
    price: 890000,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600',
    category: '여성패션/코트',
    brand: 'MAX MARA',
    description: '이탈리아 최고급 캐시미어 원단으로 제작된 시그니처 코트입니다. 클래식한 실루엣과 완벽한 핏으로 어떤 스타일링에도 우아함을 더해줍니다.'
  },
  {
    id: '2',
    name: '프리미엄 실크 블라우스',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
    category: 'women',
    brand: 'THEORY',
    description: '100% 실크 소재의 프리미엄 블라우스입니다. 부드러운 터치감과 우아한 드레이프가 특징이며, 비즈니스와 캐주얼 모두에 완벽합니다.'
  },
  {
    id: '3',
    name: '이탈리안 레더 핸드백',
    price: 1250000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
    category: 'bags',
    brand: 'BOTTEGA VENETA',
    description: '이탈리아 장인이 수작업으로 제작한 프리미엄 레더 핸드백입니다. 시그니처 인트레치아토 위빙 기법으로 제작되어 독특한 텍스처를 자랑합니다.'
  },
  {
    id: '4',
    name: '울 블렌드 테일러드 재킷',
    price: 650000,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
    category: 'women',
    brand: 'ACNE STUDIOS',
    description: '고급 울 블렌드 소재의 테일러드 재킷입니다. 미니멀한 디자인과 완벽한 핏으로 모던한 여성의 스타일을 완성합니다.'
  },
  {
    id: '5',
    name: '스위스 오토매틱 시계',
    price: 2800000,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600',
    category: 'accessories',
    brand: 'OMEGA',
    description: '스위스 정밀 기계식 무브먼트를 탑재한 럭셔리 시계입니다. 클래식한 디자인과 뛰어난 내구성으로 평생 착용할 수 있는 타임피스입니다.'
  },
  {
    id: '6',
    name: '프렌치 퍼퓨머리 향수',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
    category: 'beauty',
    brand: 'DIPTYQUE',
    description: '파리의 전통 퍼퓨머리에서 제작한 니치 향수입니다. 독특하고 세련된 향조로 당신만의 시그니처 향을 만들어줍니다.'
  }
]

export const getProductById = (id: string): Product | undefined => {
  return sampleProducts.find(product => product.id === id)
}