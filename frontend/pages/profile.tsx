"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, User, Lock, Loader2, CheckCircle2, UserRound, AtSign, ArrowLeft } from "lucide-react"
import { userAPI } from "@/utils/apiClient"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
    const router = useRouter()
    const { toast } = useToast();
    const [user, setUser] = useState<{
        first_name: string
        last_name: string
        email: string
        username: string
        role: string
    } | null>(null)

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) {
                    router.push("/login")
                    return
                }

                const userData = await userAPI.getCurrentUser() as {
                    first_name: string
                    last_name: string
                    email: string
                    username: string
                    role: string
                }

                setUser(userData)
                setFormData({
                    firstName: userData.first_name,
                    lastName: userData.last_name,
                    email: userData.email,
                    username: userData.username,
                })
            } catch (error: any) {
                console.error("Error fetching user data:", error)
                toast({ title: "Error", description: "Error fetching user data. Please try again.", variant: "destructive" })
                router.push("/login")
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [router, toast])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        setError(null)
        setSuccess(null)

        try {
            const userData = await userAPI.updateProfile({
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                username: formData.username,
            }) as {
                first_name: string
                last_name: string
                email: string
                username: string
                role: string
            }

            setSuccess("Profile updated successfully")
            setUser(userData)
        } catch (err: any) {
            setError(err.message || "Failed to update profile")
        } finally {
            setUpdating(false)
        }
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setChangingPassword(true)
        setPasswordError(null)
        setPasswordSuccess(null)

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match")
            setChangingPassword(false)
            return
        }

        try {
            await userAPI.updatePassword({
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword
            })

            setPasswordSuccess("Password updated successfully")
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
        } catch (err: any) {
            setPasswordError(err.message || "Failed to update password")
        } finally {
            setChangingPassword(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 flex flex-col">
            <Navbar />
            <main className="flex-1 container max-w-4xl py-10 px-4 md:px-6 mx-auto">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Profile Settings
                        </h1>
                        <p className="text-indigo-600 dark:text-indigo-400">Manage your account settings and preferences</p>
                    </div>

                    <Button
                        variant="outline"
                        className="flex items-center gap-2 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        onClick={() => {
                            if (user.role === "admin") {
                                router.push("/admin")
                            } else {
                                router.push("/board")
                            }
                        }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {user.role === "admin" ? "Go back to admin page" : "Go back to your board"}
                    </Button>
                    <Separator className="border-indigo-200 dark:border-indigo-800" />

                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-indigo-200 dark:border-indigo-800">
                            <TabsTrigger
                                value="profile"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:border-none data-[state=inactive]:text-indigo-600 data-[state=inactive]:dark:text-indigo-400"
                            >
                                Profile
                            </TabsTrigger>
                            <TabsTrigger
                                value="password"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:border-none data-[state=inactive]:text-indigo-600 data-[state=inactive]:dark:text-indigo-400"
                            >
                                Password
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-6">
                            <Card className="border-indigo-200 dark:border-indigo-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
                                <form onSubmit={handleProfileUpdate}>
                                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-b border-indigo-200 dark:border-indigo-800">
                                        <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                            Personal Information
                                        </CardTitle>
                                        <CardDescription className="text-indigo-600 dark:text-indigo-400">
                                            Update your personal details
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4 pt-6">
                                        {error && (
                                            <Alert
                                                variant="destructive"
                                                className="border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                                            >
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{error}</AlertDescription>
                                            </Alert>
                                        )}

                                        {success && (
                                            <Alert className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/30">
                                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                <AlertDescription>{success}</AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="firstName"
                                                    className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                                                >
                                                    First Name
                                                </Label>
                                                <div className="relative">
                                                    <UserRound className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                                    <Input
                                                        id="firstName"
                                                        name="firstName"
                                                        placeholder="First name"
                                                        className="pl-9 border-indigo-300 dark:border-indigo-700 focus:border-indigo-500 focus:ring-indigo-500 bg-white/80 dark:bg-slate-800/80"
                                                        value={formData.firstName}
                                                        onChange={handleInputChange}
                                                        disabled={updating}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="lastName"
                                                    className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                                                >
                                                    Last Name
                                                </Label>
                                                <div className="relative">
                                                    <UserRound className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                                    <Input
                                                        id="lastName"
                                                        name="lastName"
                                                        placeholder="Last name"
                                                        className="pl-9 border-indigo-300 dark:border-indigo-700 focus:border-indigo-500 focus:ring-indigo-500 bg-white/80 dark:bg-slate-800/80"
                                                        value={formData.lastName}
                                                        onChange={handleInputChange}
                                                        disabled={updating}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                                            >
                                                Email
                                            </Label>
                                            <div className="relative">
                                                <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="Email address"
                                                    className="pl-9 border-indigo-300 dark:border-indigo-700 focus:border-indigo-500 focus:ring-indigo-500 bg-white/80 dark:bg-slate-800/80"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    disabled={updating}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="username"
                                                className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                                            >
                                                Username
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                                <Input
                                                    id="username"
                                                    name="username"
                                                    placeholder="Username"
                                                    className="pl-9 border-indigo-300 dark:border-indigo-700 focus:border-indigo-500 focus:ring-indigo-500 bg-white/80 dark:bg-slate-800/80"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    disabled={updating}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-t border-indigo-200 dark:border-indigo-800 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={updating}
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border border-indigo-400 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                                        >
                                            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {updating ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="password" className="space-y-6">
                            <Card className="border-indigo-200 dark:border-indigo-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
                                <form onSubmit={handlePasswordUpdate}>
                                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-b border-indigo-200 dark:border-indigo-800">
                                        <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                            Change Password
                                        </CardTitle>
                                        <CardDescription className="text-indigo-600 dark:text-indigo-400">
                                            Update your password to keep your account secure
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4 pt-6">
                                        {passwordError && (
                                            <Alert
                                                variant="destructive"
                                                className="border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                                            >
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{passwordError}</AlertDescription>
                                            </Alert>
                                        )}

                                        {passwordSuccess && (
                                            <Alert className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/30">
                                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                <AlertDescription>{passwordSuccess}</AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="currentPassword"
                                                className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                                            >
                                                Current Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                                <Input
                                                    id="currentPassword"
                                                    name="currentPassword"
                                                    type="password"
                                                    placeholder="Enter your current password"
                                                    className="pl-9 border-indigo-300 dark:border-indigo-700 focus:border-indigo-500 focus:ring-indigo-500 bg-white/80 dark:bg-slate-800/80"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    disabled={changingPassword}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="newPassword"
                                                className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                                            >
                                                New Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                                <Input
                                                    id="newPassword"
                                                    name="newPassword"
                                                    type="password"
                                                    placeholder="Enter your new password"
                                                    className="pl-9 border-indigo-300 dark:border-indigo-700 focus:border-indigo-500 focus:ring-indigo-500 bg-white/80 dark:bg-slate-800/80"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    disabled={changingPassword}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="confirmPassword"
                                                className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                                            >
                                                Confirm New Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                                <Input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    placeholder="Confirm your new password"
                                                    className="pl-9 border-indigo-300 dark:border-indigo-700 focus:border-indigo-500 focus:ring-indigo-500 bg-white/80 dark:bg-slate-800/80"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    disabled={changingPassword}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-t border-indigo-200 dark:border-indigo-800 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={changingPassword}
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border border-indigo-400 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                                        >
                                            {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {changingPassword ? "Updating..." : "Update Password"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}
