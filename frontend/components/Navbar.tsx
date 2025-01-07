import { useState, useEffect } from 'react'
import { jwtDecode} from 'jwt-decode'
import Link from 'next/link'
import { Star, Plus, Search, User } from 'lucide-react'

interface DecodedToken {
    
}

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Mock user data (replace with actual user data from your auth system)
    const user = {
        fullName: 'John Doe',
        email: 'john@example.com'
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // Implement search functionality
        console.log('Searching for:', searchQuery)
    }

    const handleLogout = () => {
        // Implement logout functionality
        console.log('Logging out')
    }

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0">
                            <img className="h-8 w-8" src="/srl-icon.png" alt="SRL" />
                        </Link>
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/starred-boards" className="text-gray-600 hover:text-gray-900">
                                <Star className="inline-block mr-1" size={18} />
                                Starred Boards
                            </Link>
                            <button className="text-gray-600 hover:text-gray-900">
                                <Plus className="inline-block mr-1" size={18} />
                                New Board
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <form onSubmit={handleSearch} className="mr-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search boards"
                                    className="bg-gray-100 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>
                        </form>
                        <div className="ml-3 relative">
                            <div>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center text-gray-600 hover:text-gray-900 focus:outline-none"
                                >
                                    <User className="h-8 w-8" />
                                </button>
                            </div>
                            {isDropdownOpen && (
                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                                    <div className="px-4 py-2 text-sm text-gray-700">
                                        <p className="font-medium">{user.fullName}</p>
                                        <p className="text-gray-500">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar

