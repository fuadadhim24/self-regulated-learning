"use client"

import { useState } from "react"
import { User, LogOut, Settings, Bell, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const router = useRouter()

    // Mock user data (replace with actual user data from your auth system)
    const user = {
        fullName: "John Doe",
        email: "john@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        router.push("/login")
    }

    // const navItems = [
    //     { name: "Dashboard", href: "/" },
    //     { name: "Tasks", href: "/tasks" },
    //     { name: "Calendar", href: "/calendar" },
    //     { name: "Analytics", href: "/analytics" },
    // ]

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Desktop Navigation */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            {/* <img className="h-8 w-auto" src="/srl-icon.png" alt="SRL" /> */}
                            <span className="ml-2 text-xl font-semibold text-gray-800">SRL Planner</span>
                        </Link>
                        <div className="hidden md:block ml-10">
                            {/* <div className="flex space-x-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === item.href
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                            } transition-colors duration-200`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div> */}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">{isMobileMenuOpen ? "Close menu" : "Open menu"}</span>
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Right side icons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <Bell className="h-5 w-5" />
                        </button>
                        <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <Settings className="h-5 w-5" />
                        </button>

                        {/* User dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar || "/placeholder.svg"}
                                            alt={user.fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-5 w-5 text-gray-500" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.fullName}</span>
                            </button>
                            {isDropdownOpen && (
                                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Your Profile
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-200">
                    {/* <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === item.href
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div> */}
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="flex items-center px-5">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar || "/placeholder.svg"}
                                            alt={user.fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-6 w-6 text-gray-500" />
                                    )}
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800">{user.fullName}</div>
                                <div className="text-sm font-medium text-gray-500">{user.email}</div>
                            </div>
                            <button className="ml-auto p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <Bell className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mt-3 px-2 space-y-1">
                            <Link
                                href="/profile"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            >
                                Your Profile
                            </Link>
                            <Link
                                href="/settings"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            >
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar

