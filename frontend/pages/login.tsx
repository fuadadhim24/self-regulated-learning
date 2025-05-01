"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import Player from "@/components/LottiePlayer"
import { login } from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, GraduationCap, Loader2, LockKeyhole, User } from "lucide-react"
import { setAccessToken } from "@/utils/auth"

export default function Login() {
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
            const response = await login(username, password)

            if (response.ok) {
                const data = await response.json()
                setAccessToken(data.token)

                if (data.role === "admin") {
                    router.push("/admin")
                } else {
                    router.push("/board")
                }
            } else {
                const errorData = await response.json().catch(() => null)
                setError(errorData?.message || "Invalid username or password")
            }
        } catch (err) {
            setError("Connection error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-muted/50 to-muted pt-4 sm:pt-8 px-4">
            <div className="absolute top-8 left-8 flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">GAMATUTOR.ID</span>
            </div>

            <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Left side - Animation (shown only in landscape orientation) */}
                <div className="landscape-only w-full lg:w-1/2 flex flex-col items-center">
                    <div className="relative w-full max-w-md">
                        <Player
                            src="https://assets7.lottiefiles.com/packages/lf20_87uabjh2.json"
                            className="w-full h-full"
                            loop
                            autoplay
                        />
                    </div>
                    <div className="text-center mt-4 space-y-2">
                        <h2 className="text-2xl font-bold">Welcome Back!</h2>
                        <p className="text-muted-foreground max-w-md">
                            Log in to access your personalized learning experience and continue your educational journey.
                        </p>
                    </div>
                </div>

                {/* Right side - Login Form */}
                <div className="w-full lg:w-1/2 max-w-md">
                    <Card className="border-muted/60 shadow-lg">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
                            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                {error && (
                                    <Alert variant="destructive" className="text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="username"
                                            placeholder="Enter your username"
                                            className="pl-9"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            className="pl-9"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-4">
                                <Button type="submit" className="w-full" disabled={loading || !username || !password}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {loading ? "Signing in..." : "Sign In"}
                                </Button>

                                <div className="text-center text-sm">
                                    Don't have an account?{" "}
                                    <Link href="/register" className="text-primary font-medium hover:underline">
                                        Create an account
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

