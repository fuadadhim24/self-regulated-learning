"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import CoursesList from "@/components/Admin/CoursesList"
import LearningStrategiesList from "@/components/Admin/LearningStrategiesList"
import UsersList from "@/components/Admin/UsersList"
import LogsList from "@/components/Admin/LogsList"
import { userAPI } from "@/utils/apiClient"
import { useRouter } from "next/router"
import Navbar, { AdminSection } from "@/components/Navbar"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
    const { toast } = useToast();
    const [selectedSection, setSelectedSection] = useState<AdminSection>("courses")
    const [user, setUser] = useState<{
        first_name: string
        last_name: string
        email: string
        username: string
        is_admin: boolean
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
                    const userData = await userAPI.getCurrentUser()
                    console.log("Admin user data:", userData)

                    if (!userData.is_admin) {
                        toast({
                            title: "Access Denied",
                            description: "You don't have admin privileges.",
                            variant: "destructive"
                        })
                        router.push("/board")
                        return
                    }
                    setUser(userData)
                } catch (error: any) {
                    console.error("Error fetching user data:", error)
                    toast({ title: "Error", description: "Error fetching user data. Please login again.", variant: "destructive" })
                    router.push("/login")
                } finally {
                    setLoading(false)
                }
            } catch (error: any) {
                console.error("Authentication error:", error)
                toast({ title: "Error", description: error.message || "Authentication error", variant: "destructive" })
                setError(error.message || "Authentication error")
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [router, toast])

    // Redirect to login if there's an error and we're not loading
    useEffect(() => {
        if (!loading && error) {
            router.push("/login")
        }
    }, [loading, error, router])

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

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header with Navigation */}
            <Navbar
                variant="admin"
                title="Learning Admin"
                showSearch={true}
                showNotifications={true}
                selectedSection={selectedSection}
                setSelectedSection={setSelectedSection}
            />

            {/* Main Content */}
            <main className="flex-1 p-6 min-h-0 pb-12">
                <div className="mx-auto max-w-5xl mb-12">
                    {selectedSection === "courses" && <CoursesList />}
                    {selectedSection === "learningStrategies" && <LearningStrategiesList />}
                    {selectedSection === "users" && <UsersList />}
                    {selectedSection === "logs" && <LogsList />}
                </div>
            </main>
        </div>
    )
}
