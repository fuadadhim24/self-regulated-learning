"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, AtSign, GraduationCap, Loader2 } from "lucide-react"
import { apiClient } from "@/utils/apiClient"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            await apiClient.post("/api/request-reset", { email })
            setSuccess("Password reset link has been sent to your email")
        } catch (err: any) {
            setError(err.message || "Failed to send reset link")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
            <div className="w-full lg:w-1/2 max-w-md">
                <Card className="border-muted/60 shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                        <CardDescription className="text-center">Enter your email to receive a password reset link</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            {success && (
                                <Alert className="text-sm">
                                    <AlertDescription>
                                        {success}
                                    </AlertDescription>
                                </Alert>
                            )}

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
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full" disabled={loading || !email}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>

                            <div className="text-center text-sm">
                                Remember your password?{" "}
                                <Link href="/login" className="text-primary font-medium hover:underline">
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
} 