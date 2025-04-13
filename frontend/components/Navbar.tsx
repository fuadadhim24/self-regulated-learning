"use client"

import { useState, useEffect } from "react"
import { User, LogOut, Settings, Bell, Menu, X, GraduationCap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { getCurrentUser } from "@/utils/api"

interface NavbarProps {
    variant?: "default" | "admin"
    title?: string
    showSearch?: boolean
    showNotifications?: boolean
    showProfile?: boolean
    customLinks?: React.ReactNode
}

const Navbar = ({
    variant = "default",
    title = "SRL Planner",
    showSearch = false,
    showNotifications = false,
    showProfile = true,
    customLinks
}: NavbarProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<{
        first_name: string;
        last_name: string;
        email: string;
        username: string;
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) {
                    router.push("/login")
                    return
                }

                const userData = await getCurrentUser(token)
                setUser(userData)
            } catch (error) {
                console.error("Error fetching user:", error)
                router.push("/login")
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("token")
        router.push("/login")
    }

    if (loading) {
        return (
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex-shrink-0 flex items-center">
                                <span className="ml-2 text-xl font-semibold text-gray-800">{title}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    if (!user) {
        return null
    }

    const userFullName = `${user.first_name} ${user.last_name}`

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-[95%] mx-auto px-2 sm:px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Desktop Navigation */}
                    <div className="flex items-center">
                        <Link href={variant === "admin" ? "/admin" : "/"} className="flex-shrink-0 flex items-center">
                            {variant === "admin" ? (
                                <GraduationCap className="h-6 w-6 mr-2" />
                            ) : null}
                            <span className="text-xl font-semibold text-gray-800">{title}</span>
                        </Link>
                        <div className="hidden md:block ml-4">
                            {customLinks}
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
                    <div className="hidden md:flex items-center space-x-2">
                        {showNotifications && (
                            <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <Bell className="h-5 w-5" />
                            </button>
                        )}
                        {showSearch && (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full bg-gray-100 rounded-md py-1 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {/* User dropdown */}
                        {showProfile && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        <User className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 hidden lg:block">{userFullName}</span>
                                </button>
                                {isDropdownOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{userFullName}</p>
                                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        {/* <Link
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
                                        </Link> */}
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
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-200">
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="flex items-center px-3">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    <User className="h-6 w-6 text-gray-500" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800">{userFullName}</div>
                                <div className="text-sm font-medium text-gray-500">{user.email}</div>
                            </div>
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

