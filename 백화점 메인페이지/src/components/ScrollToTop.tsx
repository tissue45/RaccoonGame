import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // 여러 방법으로 스크롤을 맨 위로 이동
    const scrollToTop = () => {
      // 방법 1: window.scrollTo
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

      // 방법 2: document.documentElement.scrollTop
      document.documentElement.scrollTop = 0

      // 방법 3: document.body.scrollTop (구형 브라우저 대응)
      document.body.scrollTop = 0
    }

    // 즉시 실행
    scrollToTop()

    // 약간의 지연 후 다시 실행 (DOM 렌더링 완료 후)
    setTimeout(scrollToTop, 0)
    setTimeout(scrollToTop, 100)
  }, [pathname])

  return null
}

export default ScrollToTop