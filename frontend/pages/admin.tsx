"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { BookOpen, GraduationCap, Lightbulb, Users, Bell, Search, Menu } from "lucide-react"
import CoursesList from "@/components/Admin/CoursesList"
import LearningStrategiesList from "@/components/Admin/LearningStrategiesList"
import UsersList from "@/components/Admin/UsersList"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { getCurrentUser } from "@/utils/api"
import { useRouter } from "next/router"
import Navbar from "@/components/Navbar"

type Section = "courses" | "learningStrategies" | "users"

export default function AdminDashboard() {
    const [selectedSection, setSelectedSection] = useState<Section>("courses")
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
            <Navbar
                variant="admin"
                title="Learning Admin"
                showSearch={true}
                showNotifications={true}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Desktop */}
                <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
                    <div className="flex h-14 items-center border-b px-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Learning Admin
                        </h2>
                    </div>
                    <nav className="flex-1 p-4 space-y-2">
                        <NavItem title="Courses" icon={BookOpen} value="courses" active={selectedSection === "courses"} />
                        <NavItem
                            title="Learning Strategies"
                            icon={Lightbulb}
                            value="learningStrategies"
                            active={selectedSection === "learningStrategies"}
                        />
                        <NavItem title="Users & Boards" icon={Users} value="users" active={selectedSection === "users"} />
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6">
                    <div className="mx-auto max-w-5xl">
                        {selectedSection === "courses" && <CoursesList />}
                        {selectedSection === "learningStrategies" && <LearningStrategiesList />}
                        {selectedSection === "users" && <UsersList />}
                    </div>
                </main>
            </div>
        </div>
    )
}

