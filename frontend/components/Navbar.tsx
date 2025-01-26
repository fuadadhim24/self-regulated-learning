import { useState } from 'react';
import { User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();

    // Mock user data (replace with actual user data from your auth system)
    const user = {
        fullName: 'John Doe',
        email: 'john@example.com',
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0">
                            <img className="h-8 w-8" src="/srl-icon.png" alt="SRL" />
                        </Link>
                    </div>

                    {/* Account Button */}
                    <div className="flex items-center">
                        <div className="ml-3 relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                <User className="h-8 w-8" />
                            </button>
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
