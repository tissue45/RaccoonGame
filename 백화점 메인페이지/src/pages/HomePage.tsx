import React from 'react'
import { Link } from 'react-router-dom'
import HeroBanner from '../components/HeroBanner'
import CategorySection from '../components/CategorySection'
import WeeklyFocus from '../components/WeeklyFocus'

const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      <HeroBanner />
      <CategorySection />
      <WeeklyFocus />
    </div>
  )
}

export default HomePage