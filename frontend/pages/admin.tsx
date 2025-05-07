"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { BookOpen, GraduationCap, Lightbulb, Users, ClockIcon, Loader2 } from "lucide-react"
import CoursesList from "@/components/Admin/CoursesList"
import LearningStrategiesList from "@/components/Admin/LearningStrategiesList"
import UsersList from "@/components/Admin/UsersList"
import LogsList from "@/components/Admin/LogsList"
import { getCurrentUser } from "@/utils/api"
import { useRouter } from "next/router"
import Navbar from "@/components/Navbar"

type Section = "courses" | "learningStrategies" | "users" | "logs"

export default function AdminDashboard() {
    const [selectedSection, setSelectedSection] = useState<Section>("courses")
    const [user, setUser] = useState<{
        first_name: string
        last_name: string
        email: string
        username: string
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true)
                setError(null)

                // Check if we're in the browser
                if (typeof window === 'undefined') return

                const token = localStorage.getItem("token")
                if (!token) {
                    setError("No authentication token found")
                    return
                }

                try {
                    const userData = await getCurrentUser()
                    setUser(userData)
                } catch (error: any) {
                    console.error("Error fetching user:", error)
                    // If token is invalid, clear it
                    localStorage.removeItem("token")
                    setError(error.message || "Failed to fetch user data")
                }
            } catch (error: any) {
                console.error("Error in auth check:", error)
                setError(error.message || "Authentication error")
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    // Redirect to login if there's an error and we're not loading
    useEffect(() => {
        if (!loading && error) {
            router.push("/login")
        }
    }, [loading, error, router])

    const NavItem = ({
        title,
        icon: Icon,
        value,
        active,
    }: {
        title: string
        icon: React.ElementType
        value: Section
        active: boolean
    }) => (
        <button
            onClick={() => setSelectedSection(value)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{title}</span>
        </button>
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar variant="admin" title="Learning Admin" showProfile={false} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading admin dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    const userFullName = `${user.first_name} ${user.last_name}`
    const userInitials = `${user.first_name[0]}${user.last_name[0]}`

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <Navbar variant="admin" title="Learning Admin" showSearch={true} showNotifications={true} />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Desktop */}
                <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
                    <nav className="flex-1 p-4 space-y-2">
                        <NavItem title="Courses" icon={BookOpen} value="courses" active={selectedSection === "courses"} />
                        <NavItem
                            title="Learning Strategies"
                            icon={Lightbulb}
                            value="learningStrategies"
                            active={selectedSection === "learningStrategies"}
                        />
                        <NavItem title="Users & Boards" icon={Users} value="users" active={selectedSection === "users"} />
                        <NavItem title="System Logs" icon={ClockIcon} value="logs" active={selectedSection === "logs"} />
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6">
                    <div className="mx-auto max-w-5xl">
                        {selectedSection === "courses" && <CoursesList />}
                        {selectedSection === "learningStrategies" && <LearningStrategiesList />}
                        {selectedSection === "users" && <UsersList />}
                        {selectedSection === "logs" && <LogsList />}
                    </div>
                </main>
            </div>
        </div>
    )
}
