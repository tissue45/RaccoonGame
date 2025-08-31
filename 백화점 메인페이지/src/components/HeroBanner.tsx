import React, { useState, useEffect } from 'react'

const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoplayInterval, setAutoplayInterval] = useState<NodeJS.Timeout | null>(null)

  const slides = [
    {
      image: 'https://image.thehyundai.com/HM/HM006/20250821/095846/pc_mainrolling_12.jpg',
      title: 'PREMIUM COLLECTION',
      description: '프리미엄 컬렉션'
    },
    {
      image: 'https://image.thehyundai.com/HM/HM039/20250728/135825/ban20250728140328.jpg',
      title: 'PREMIUM FALL 2025',
      description: '프리미엄 가을 컬렉션'
    },
    {
      image: 'https://image.thehyundai.com/HM/HM039/20250728/080540/ban20250728122629.jpg',
      title: "MEN'S LUXURY",
      description: '세련된 남성을 위한 럭셔리 컬렉션'
    },
    {
      image: 'https://image.thehyundai.com/HM/HM039/20250728/080540/ban20250728122537.jpg',
      title: 'PREMIUM STORE',
      description: '프리미엄 쇼핑의 새로운 경험'
    },
    {
      image: 'https://image.thehyundai.com/HM/HM039/20250818/110611/ban20250818134628.jpg',
      title: 'KIDS COLLECTION',
      description: '사랑스러운 아이들을 위한 특별한 컬렉션'
    }
  ]

  const showSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    const next = (currentSlide + 1) % slides.length
    showSlide(next)
  }

  const previousSlide = () => {
    const prev = (currentSlide - 1 + slides.length) % slides.length
    showSlide(prev)
  }

  const startAutoplay = () => {
    const interval = setInterval(nextSlide, 4000)
    setAutoplayInterval(interval)
  }

  const stopAutoplay = () => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval)
      setAutoplayInterval(null)
    }
  }

  useEffect(() => {
    startAutoplay()
    return () => stopAutoplay()
  }, [currentSlide])

  return (
    <section className="relative w-full h-[500px] overflow-hidden" onMouseEnter={stopAutoplay} onMouseLeave={startAutoplay}>
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-20">
              <h2 className="text-5xl font-bold mb-4 tracking-wide">{slide.title}</h2>
              <p className="text-xl font-light">{slide.description}</p>
            </div>
          </div>
        ))}

        {/* Navigation */}
        <button 
          className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-40 text-white text-2xl font-bold rounded-full flex items-center justify-center transition-all duration-300"
          onClick={previousSlide}
        >
          ‹
        </button>
        <button 
          className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-40 text-white text-2xl font-bold rounded-full flex items-center justify-center transition-all duration-300"
          onClick={nextSlide}
        >
          ›
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              onClick={() => showSlide(index)}
            ></span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroBanner