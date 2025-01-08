import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Star, Plus, Search, User } from 'lucide-react'
import { searchUserById } from '@/utils/api'

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    // const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
    const router = useRouter()

    // useEffect(() => {
    //     const fetchUser = async () => {
    //         const token = localStorage.getItem('token');
    //         if (token) {
    //             try {
    //                 // Decode the JWT to get the user ID from the 'sub' field
    //                 const decoded: { sub: string } = jwtDecode(token);
    //                 console.log('Decoded token:', decoded);

    //                 // Fetch user data from the backend using the 'sub' field as the user ID
    //                 const response = await searchUserById(token, decoded.sub);
    //                 if (response.ok) {
    //                     const userData = await response.json();

    //                     // Set user data in state
    //                     setUser({
    //                         fullName: `${userData.first_name} ${userData.last_name}`,
    //                         email: userData.user_email,
    //                     });
    //                 } else {
    //                     console.error('Failed to fetch user data:', response.statusText);
    //                     setUser(null); // Clear user data if fetch fails
    //                 }
    //             } catch (error) {
    //                 console.error('Error fetching user data:', error);
    //                 setUser(null); // Clear user data on error
    //             }
    //         }
    //     };

    //     fetchUser();
    // }, []);

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
        localStorage.removeItem('token')
        router.push('/login')
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
                            {isDropdownOpen && user && (
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
    );
};

export default Navbar;