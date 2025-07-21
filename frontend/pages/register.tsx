"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import Player from "@/components/LottiePlayer"
import { authAPI } from "@/utils/apiClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, AtSign, GraduationCap, Loader2, LockKeyhole, User, UserRound } from "lucide-react"

export default function Register() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await authAPI.register({
                firstName,
                lastName,
                email,
                username,
                password
            })
            router.push("/login?registered=true")
        } catch (err: any) {
            setError(err.message || "Registration failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const isFormValid = firstName && lastName && email && username && password

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-muted/50 to-muted p-4 sm:p-8">
            <div className="absolute top-8 left-8 flex items-center gap-2">
                <Image
                    src="/logogamatutor.png"
                    alt="GAMATUTOR Logo"
                    width={32}
                    height={32}
                />
                <span className="font-bold text-xl">GAMATUTOR.ID</span>
            </div>

            <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Left side - Animation */}
                <div className="landscape only w-full lg:w-1/2 flex flex-col items-center">
                    <div className="relative w-full max-w-md">
                        <Player
                            src="https://assets5.lottiefiles.com/packages/lf20_jcikwtux.json"
                            className="w-full"
                            loop
                            autoplay
                        />
                    </div>
                    <div className="text-center mt-4 space-y-2">
                        <h2 className="text-2xl font-bold">Join Our Learning Community</h2>
                        <p className="text-muted-foreground max-w-md">
                            Create an account to start your educational journey and access personalized learning resources.
                        </p>
                    </div>
                </div>

                {/* Right side - Register Form */}
                <div className="w-full lg:w-1/2 max-w-md">
                    <Card className="border-muted/60 shadow-lg">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
                            <CardDescription className="text-center">Enter your information to register</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                {error && (
                                    <Alert variant="destructive" className="text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <div className="relative">
                                            <UserRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="firstName"
                                                placeholder="First name"
                                                className="pl-9"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                disabled={loading}
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
                                                placeholder="Last name"
                                                className="pl-9"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                disabled={loading}
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
                                            type="email"
                                            placeholder="your.email@example.com"
                                            className="pl-9"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
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
                                            placeholder="Choose a username"
                                            className="pl-9"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Create a password"
                                            className="pl-9"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-4">
                                <Button type="submit" className="w-full" disabled={loading || !isFormValid}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {loading ? "Creating Account..." : "Create Account"}
                                </Button>

                                <div className="text-center text-sm">
                                    Already have an account?{" "}
                                    <Link href="/login" className="text-primary font-medium hover:underline">
                                        Sign in
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}

