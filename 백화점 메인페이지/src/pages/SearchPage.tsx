import React from 'react'
import SearchComponent from '../components/SearchComponent'

const SearchPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">
        <SearchComponent />
      </main>
    </div>
  )
}

export default SearchPage
