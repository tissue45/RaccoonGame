import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider, useWishlistContext } from './context/WishlistContext'
import { RecentViewProvider } from './context/RecentViewContext'
import { CouponProvider } from './context/CouponContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Toast from './components/Toast'
import HomePage from './pages/HomePage'
import WomenPage from './pages/WomenPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CategoryPage from './pages/CategoryPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaymentFailPage from './pages/PaymentFailPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import FindIdPage from './pages/FindIdPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import TestPage from './pages/TestPage'
import SearchPage from './pages/SearchPage'

import MyPage from './pages/MyPage'
import WishlistPage from './pages/WishlistPage'
import OrderTrackingPage from './pages/OrderTracking'
import CouponPage from './pages/CouponPage'
// 문의 관련 페이지 import 추가
import InquiryPage from './pages/InquiryPage'
import InquiryHistoryPage from './pages/InquiryHistoryPage'
import InquiryDetailPage from './pages/InquiryDetailPage'
import RecentViewPage from './pages/RecentViewPage'

import { UserProvider } from './context/UserContext'

// 헤더를 숨길 페이지들을 정의
const hideHeaderPaths = ['/login', '/signup', '/find-id', '/forgot-password', '/reset-password']

// 조건부 헤더 렌더링을 위한 컴포넌트
const ConditionalHeader: React.FC = () => {
  const location = useLocation()
  const shouldHideHeader = hideHeaderPaths.includes(location.pathname)
  
  return shouldHideHeader ? null : <Header />
}

// Toast 컴포넌트를 WishlistProvider 내부로 이동
const AppContent: React.FC = () => {
  const { toastMessage, showToast, hideToast } = useWishlistContext()
  
  return (
    <Router>
      <ScrollToTop />
      <div className="w-full min-h-screen m-0 p-0">
        <ConditionalHeader />
        <main className="w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/women" element={<WomenPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/products/:categoryId" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/fail" element={<PaymentFailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/find-id" element={<FindIdPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/recent" element={<RecentViewPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/order-tracking" element={<OrderTrackingPage />} />
            <Route path="/coupon" element={<CouponPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/search" element={<SearchPage />} />
            {/* 문의 관련 라우트 추가 */}
            <Route path="/inquiry" element={<InquiryPage />} />
            <Route path="/inquiry-history" element={<InquiryHistoryPage />} />
            <Route path="/inquiry/:id" element={<InquiryDetailPage />} />
          </Routes>
        </main>
        <Footer />
        <Toast
          message={toastMessage}
          isVisible={showToast}
          onClose={hideToast}
          duration={3000}
        />
      </div>
    </Router>
  )
}

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <WishlistProvider>
          <RecentViewProvider>
            <CouponProvider>
              <AppContent />
            </CouponProvider>
          </RecentViewProvider>
        </WishlistProvider>
      </CartProvider>
    </UserProvider>
  )
}

export default App