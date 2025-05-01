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
import { AlertCircle, User, Lock, Loader2, CheckCircle2, UserRound, AtSign } from "lucide-react"
import { getCurrentUser, updateProfile, updatePassword } from "@/utils/api"

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<{
        first_name: string
        last_name: string
        email: string
        username: string
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

                const userData = await getCurrentUser()
                setUser(userData)
                setFormData({
                    firstName: userData.first_name,
                    lastName: userData.last_name,
                    email: userData.email,
                    username: userData.username,
                })
            } catch (error) {
                console.error("Error fetching user:", error)
                router.push("/login")
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [router])

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
            const response = await updateProfile({
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                username: formData.username,
            })

            if (response.ok) {
                setSuccess("Profile updated successfully")
                // Update the user state with new data
                const userData = await response.json()
                setUser(userData)
            } else {
                const errorData = await response.json()
                setError(errorData.message || "Failed to update profile")
            }
        } catch (err) {
            setError("An error occurred while updating your profile")
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
            const response = await updatePassword(passwordData.currentPassword, passwordData.newPassword)

            if (response.ok) {
                setPasswordSuccess("Password updated successfully")
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                })
            } else {
                const errorData = await response.json()
                setPasswordError(errorData.message || "Failed to update password")
            }
        } catch (err) {
            setPasswordError("An error occurred while updating your password")
        } finally {
            setChangingPassword(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container max-w-4xl py-10 px-4 md:px-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                        <p className="text-muted-foreground">Manage your account settings and preferences</p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="password">Password</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-6">
                            <Card>
                                <form onSubmit={handleProfileUpdate}>
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>Update your personal details</CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {error && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{error}</AlertDescription>
                                            </Alert>
                                        )}

                                        {success && (
                                            <Alert className="bg-green-50 text-green-800 border-green-200">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <AlertDescription>{success}</AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <div className="relative">
                                                    <UserRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="firstName"
                                                        name="firstName"
                                                        placeholder="First name"
                                                        className="pl-9"
                                                        value={formData.firstName}
                                                        onChange={handleInputChange}
                                                        disabled={updating}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <div className="relative">
                                                    <UserRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="lastName"
                                                        name="lastName"
                                                        placeholder="Last name"
                                                        className="pl-9"
                                                        value={formData.lastName}
                                                        onChange={handleInputChange}
                                                        disabled={updating}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="Email address"
                                                    className="pl-9"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    disabled={updating}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="username"
                                                    name="username"
                                                    placeholder="Username"
                                                    className="pl-9"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    disabled={updating}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter>
                                        <Button type="submit" disabled={updating}>
                                            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {updating ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="password" className="space-y-6">
                            <Card>
                                <form onSubmit={handlePasswordUpdate}>
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>Update your password to keep your account secure</CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {passwordError && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{passwordError}</AlertDescription>
                                            </Alert>
                                        )}

                                        {passwordSuccess && (
                                            <Alert className="bg-green-50 text-green-800 border-green-200">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <AlertDescription>{passwordSuccess}</AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="currentPassword"
                                                    name="currentPassword"
                                                    type="password"
                                                    placeholder="Enter your current password"
                                                    className="pl-9"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    disabled={changingPassword}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="newPassword"
                                                    name="newPassword"
                                                    type="password"
                                                    placeholder="Enter your new password"
                                                    className="pl-9"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    disabled={changingPassword}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    placeholder="Confirm your new password"
                                                    className="pl-9"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    disabled={changingPassword}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter>
                                        <Button type="submit" disabled={changingPassword}>
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
