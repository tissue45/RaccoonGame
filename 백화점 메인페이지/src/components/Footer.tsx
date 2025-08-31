import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-50 text-gray-600 py-10 px-0 border-t border-gray-200 text-xs">
      <div className="max-w-7xl mx-auto px-5">
        {/* 상단 링크 섹션 */}
        <div className="flex justify-between items-center pb-5 border-b border-gray-200 mb-8">
          <div className="flex gap-5 items-center">
            <Link to="/company" className="text-gray-600 no-underline text-xs transition-colors duration-300 hover:text-black">회사소개</Link>
            <Link to="/recruit" className="text-gray-600 no-underline text-xs transition-colors duration-300 hover:text-black">채용정보</Link>
            <Link to="/agreement" className="text-gray-600 no-underline text-xs transition-colors duration-300 hover:text-black">이용약관</Link>
            <Link to="/privacy" className="text-gray-600 no-underline text-xs transition-colors duration-300 hover:text-black">개인정보처리방침</Link>
            <Link to="/youth" className="text-gray-600 no-underline text-xs transition-colors duration-300 hover:text-black">청소년보호정책</Link>
            <span className="text-gray-600 text-xs ml-5">FAMILY SITE</span>
          </div>
          <div className="flex gap-4 items-center">
            <a href="#" className="w-8 h-8 flex items-center justify-center no-underline text-gray-400 transition-all duration-300 hover:text-gray-700 hover:scale-110 rounded">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 flex items-center justify-center no-underline text-gray-400 transition-all duration-300 hover:text-gray-700 hover:scale-110 rounded">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 flex items-center justify-center no-underline text-gray-400 transition-all duration-300 hover:text-gray-700 hover:scale-110 rounded">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 flex items-center justify-center no-underline text-gray-400 transition-all duration-300 hover:text-gray-700 hover:scale-110 rounded">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* 회사 정보 섹션 */}
        <div className="mb-8">
          <div className="flex gap-10 items-start">
            <div className="flex-shrink-0">
              <div className="flex items-baseline font-bold">
                <span className="text-2xl text-black tracking-tight">PREMIUM</span>
                <span className="text-lg text-gray-600">.COM</span>
              </div>
            </div>
            
            <div className="flex-1 text-left">
              <p className="my-1 leading-relaxed text-gray-600 text-xs">㈜프리미엄백화점 대표이사 : 최윤아 · 사업자등록번호 : 165-81-00001 · 통신판매업신고 : 제01-1441호</p>
              <p className="my-1 leading-relaxed text-gray-600 text-xs">개인정보보호책임자 : 박소희(privacy@ehyundai.com) · 주소 : 서울시 강남구 테헤란로 517 아셈타워 27층 · 대표번호 : 1661-8930</p>
              <p className="my-1 leading-relaxed text-gray-600 text-xs">팩스번호 : 02-6001-1113 · 이메일 : customer@ehyundai.com · 호스팅서비스 : ㈜프리미엄백화점</p>
              <p className="my-1 leading-relaxed text-gray-600 text-xs">COPYRIGHT © 2025 PREMIUM DEPARTMENT STORE. ALL RIGHTS RESERVED.</p>
            </div>
          </div>
        </div>

        {/* 하단 인증 마크 */}
        <div className="border-t border-gray-200 pt-5">
          <div className="flex justify-center gap-10 flex-wrap">
            <div className="flex items-center gap-2.5 text-left">
              <span className="inline-block py-1 px-2 bg-gray-100 border border-gray-300 text-xs font-bold text-gray-700 rounded min-w-[60px] text-center">KOLSA</span>
              <span className="text-xs text-gray-600 leading-tight">한국온라인쇼핑협회<br/>정회원사 확인하기</span>
            </div>
            <div className="flex items-center gap-2.5 text-left">
              <span className="inline-block py-1 px-2 bg-gray-100 border border-gray-300 text-xs font-bold text-gray-700 rounded min-w-[60px] text-center">SGI</span>
              <span className="text-xs text-gray-600 leading-tight">서울보증보험 소비자피해<br/>보상보험 서비스 가입사실 확인</span>
            </div>
            <div className="flex items-center gap-2.5 text-left">
              <span className="inline-block py-1 px-2 bg-gray-100 border border-gray-300 text-xs font-bold text-gray-700 rounded min-w-[60px] text-center">에스크로</span>
              <span className="text-xs text-gray-600 leading-tight">구매안전서비스<br/>가입사실 확인</span>
            </div>
            <div className="flex items-center gap-2.5 text-left">
              <span className="inline-block py-1 px-2 bg-gray-100 border border-gray-300 text-xs font-bold text-gray-700 rounded min-w-[60px] text-center">개인정보보호</span>
              <span className="text-xs text-gray-600 leading-tight">개인정보보호 우수 웹사이트<br/>개인정보처리시스템 인증</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer