"use client"

import React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { User, LogOut, Bell, Menu, X, GraduationCap, BookOpen, Lightbulb, Users, ClockIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { getCurrentUser, logout } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"

export type AdminSection = "courses" | "learningStrategies" | "users" | "logs"

interface NavbarProps {
    variant?: "default" | "admin"
    title?: string
    showSearch?: boolean
    showNotifications?: boolean
    showProfile?: boolean
    customLinks?: React.ReactNode
    selectedSection?: AdminSection
    setSelectedSection?: (section: AdminSection) => void
}

const Navbar = ({
    variant = "default",
    title = "GAMATUTOR.ID",
    showProfile = true,
    customLinks,
    selectedSection,
    setSelectedSection,
}: NavbarProps) => {
    const { toast } = useToast();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<{
        first_name: string
        last_name: string
        email: string
        username: string
        role?: string
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
                const userData = await getCurrentUser()
                setUser(userData)
            } catch (error) {
                toast({ title: "Error", description: "Error fetching user. Please login again.", variant: "destructive" })
                router.push("/login")
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [router])
    const handleLogout = async () => {
        try {
            await logout() // call your API logout
        } catch (error) {
            toast({ title: "Error", description: "Error during logout.", variant: "destructive" })
        } finally {
            localStorage.removeItem("token")
            router.push("/login")
        }
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
        <nav className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-b border-indigo-200 dark:border-indigo-800 sticky top-0 z-50 shadow-sm">
            <div className="max-w-[95%] mx-auto px-2 sm:px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Desktop Navigation */}
                    <div className="flex items-center">
                        <Link href={variant === "admin" ? "/admin" : "/"} className="flex-shrink-0 flex items-center">
                            {variant === "admin" ? (
                                <Image
                                    src="/logogamatutor.png"
                                    alt="GAMATUTOR Logo"
                                    width={32}
                                    height={32}
                                    className="mr-2"
                                />
                            ) : (
                                <Image
                                    src="/logogamatutor.png"
                                    alt="GAMATUTOR Logo"
                                    width={32}
                                    height={32}
                                    className="mr-2"
                                />
                            )}
                            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                {title}
                            </span>
                        </Link>

                        {/* Admin Navigation Menu - Desktop */}
                        {variant === "admin" && setSelectedSection && (
                            <div className="hidden md:flex ml-6 space-x-2">
                                <button
                                    onClick={() => setSelectedSection("courses")}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSection === "courses"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span>Courses</span>
                                </button>
                                <button
                                    onClick={() => setSelectedSection("learningStrategies")}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSection === "learningStrategies"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    <Lightbulb className="h-4 w-4" />
                                    <span>Learning Strategies</span>
                                </button>
                                <button
                                    onClick={() => setSelectedSection("users")}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSection === "users"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    <Users className="h-4 w-4" />
                                    <span>Users & Boards</span>
                                </button>
                                <button
                                    onClick={() => setSelectedSection("logs")}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSection === "logs"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    <ClockIcon className="h-4 w-4" />
                                    <span>System Logs</span>
                                </button>
                            </div>
                        )}

                        <div className="hidden md:block ml-4">{customLinks}</div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                        >
                            <span className="sr-only">{isMobileMenuOpen ? "Close menu" : "Open menu"}</span>
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Right side icons */}
                    <div className="hidden md:flex items-center space-x-2">

                        {/* User dropdown */}
                        {showProfile && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden text-white">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden lg:block">
                                        {userFullName}
                                    </span>
                                </button>
                                {isDropdownOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-indigo-200 dark:border-indigo-800">
                                        <div className="px-4 py-3 border-b border-indigo-100 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-t-lg">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{userFullName}</p>
                                            <p className="text-sm text-indigo-600 dark:text-indigo-400 truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center"
                                        >
                                            <User className="mr-2 h-4 w-4 text-indigo-500" />
                                            Your Profile
                                        </Link>
                                        {user.role === "user" && (
                                            <Link
                                                href="/board"
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center"
                                            >
                                                <GraduationCap className="mr-2 h-4 w-4 text-indigo-500" />
                                                Your Board
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
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
                <div className="md:hidden bg-white dark:bg-slate-800 border-b border-indigo-200 dark:border-indigo-800">
                    {/* Admin Navigation Menu - Mobile */}
                    {variant === "admin" && setSelectedSection && (
                        <div className="px-2 pt-2 pb-3 space-y-1 border-b border-indigo-100 dark:border-indigo-800/50">
                            <button
                                onClick={() => {
                                    setSelectedSection("courses");
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`flex w-full items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors ${selectedSection === "courses"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted"
                                    }`}
                            >
                                <BookOpen className="h-5 w-5" />
                                <span>Courses</span>
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedSection("learningStrategies");
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`flex w-full items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors ${selectedSection === "learningStrategies"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted"
                                    }`}
                            >
                                <Lightbulb className="h-5 w-5" />
                                <span>Learning Strategies</span>
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedSection("users");
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`flex w-full items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors ${selectedSection === "users"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted"
                                    }`}
                            >
                                <Users className="h-5 w-5" />
                                <span>Users & Boards</span>
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedSection("logs");
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`flex w-full items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors ${selectedSection === "logs"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted"
                                    }`}
                            >
                                <ClockIcon className="h-5 w-5" />
                                <span>System Logs</span>
                            </button>
                        </div>
                    )}

                    <div className="pt-4 pb-3 border-t border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center px-3">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden text-white">
                                    <User className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800 dark:text-gray-200">{userFullName}</div>
                                <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{user.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 px-2 space-y-1">
                            <Link
                                href="/profile"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400"
                            >
                                Your Profile
                            </Link>
                            {user.role === "user" && (
                                <Link
                                    href="/board"
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center"
                                >
                                    <GraduationCap className="mr-2 h-4 w-4 text-indigo-500" />
                                    Your Board
                                </Link>
                            )}
                            <Link
                                href="/settings"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400"
                            >
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
