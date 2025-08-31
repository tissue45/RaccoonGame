import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface SidebarProps {
  currentPage?: string
  onPersonalInfoClick?: (menuItem: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPersonalInfoClick }) => {
  const location = useLocation()

  const sidebarMenus = [
    {
      title: '주문현황',
      items: [
        { 
          label: '주문접수/배송조회', 
          link: '/order-tracking',
          active: location.pathname === '/order-tracking'
        }
      ]
    },
    {
      title: '쇼핑통장',
      items: [
        { 
          label: '쿠폰', 
          link: '/coupon',
          active: location.pathname === '/coupon'
        }
      ]
    },
    {
      title: '쇼핑백',
      items: [
        { 
          label: '찜', 
          link: '/wishlist',
          active: location.pathname === '/wishlist'
        },
        { 
          label: '최근 본 상품', 
          link: '/recent',
          active: location.pathname === '/recent'
        }
      ]
    },
         {
       title: '나의 정보',
       items: [
         { 
           label: '회원정보변경', 
           link: '#',
           active: false,
           onClick: () => {
             if (onPersonalInfoClick) {
               onPersonalInfoClick('회원정보변경')
             } else {
               // onPersonalInfoClick이 없으면 마이페이지로 이동
               window.location.href = '/mypage'
             }
           }
         }
       ]
     }
  ]

  return (
    <div className="bg-white rounded-lg p-8 h-fit shadow-lg w-64 flex-shrink-0 relative z-10">
      <div className="text-left mb-8 pb-5 border-b-2 border-gray-800">
        <h3 className="text-2xl font-bold text-gray-800 m-0">PREMIUM</h3>
      </div>

      <nav className="block">
        {sidebarMenus.map((menu, index) => (
          <div key={index} className="mb-8">
            <h4 className="text-base font-semibold text-gray-800 m-0 mb-4">{menu.title}</h4>
            <ul className="list-none p-0 m-0">
                             {menu.items.map((item, itemIndex) => (
                 <li key={itemIndex} className="mb-1">
                   {item.onClick ? (
                     <button
                       onClick={item.onClick}
                       className={`text-sm text-gray-600 py-3 px-4 block w-full text-left transition-all duration-300 rounded-md select-none relative z-10 hover:text-gray-800 hover:bg-gray-50 ${
                         item.active ? 'text-gray-800 bg-gray-100 font-medium' : ''
                       }`}
                     >
                       {item.label}
                     </button>
                   ) : (
                     <Link
                       to={item.link}
                       className={`text-sm text-gray-600 py-3 px-4 block transition-all duration-300 rounded-md select-none relative z-10 hover:text-gray-800 hover:bg-gray-50 ${
                         item.active ? 'text-gray-800 bg-gray-100 font-medium' : ''
                       }`}
                     >
                       {item.label}
                     </Link>
                   )}
                 </li>
               ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
