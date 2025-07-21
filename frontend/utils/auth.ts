import { toast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

let accessToken: string | null = null

// Centralized token management
export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    if (!accessToken) {
        accessToken = localStorage.getItem("token")
    }
    return accessToken
}

export function setAccessToken(token: string | null) {
    accessToken = token
    if (token) {
        localStorage.setItem("token", token)
    } else {
        localStorage.removeItem("token")
    }
}

export function clearAccessToken() {
    accessToken = null
    localStorage.removeItem("token")
}

export function loadAccessTokenFromStorage() {
    const token = localStorage.getItem("token")
    if (token) {
        accessToken = token
    }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
    const token = getAccessToken()
    if (!token) return false

    try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const currentTime = Date.now() / 1000
        return payload.exp > currentTime
    } catch {
        return false
    }
}

// Get user ID from token
export function getUserIdFromToken(): string | null {
    const token = getAccessToken()
    if (!token) return null

    try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        return payload.sub
    } catch {
        return null
    }
}

// Refresh token functionality
export async function refreshToken(): Promise<string | null> {
    try {
        const response = await fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            clearAccessToken()
            return null
        }

        const data = await response.json()
        setAccessToken(data.access_token)
        return data.access_token
    } catch (error) {
        clearAccessToken()
        return null
    }
}

// Enhanced authorized fetch with automatic token refresh and error handling
export async function authorizedFetch(
    input: RequestInfo,
    init: RequestInit = {},
    retry = true
): Promise<Response> {
    const token = getAccessToken()

    if (!token) {
        throw new Error("No access token available")
    }

    // Add authorization header
    init.headers = {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
    }

    const response = await fetch(input, { ...init, credentials: 'include' })

    // Handle 401 Unauthorized with token refresh
    if (response.status === 401 && retry) {
        try {
            const newToken = await refreshToken()
            if (newToken) {
                // Retry with new token
                init.headers = {
                    ...(init.headers || {}),
                    Authorization: `Bearer ${newToken}`,
                }
                return await fetch(input, { ...init, credentials: 'include' })
            } else {
                clearAccessToken()
                throw new Error("Session expired. Please log in again.")
            }
        } catch (error) {
            clearAccessToken()
            throw new Error("Authentication failed. Please log in again.")
        }
    }

    return response
}

// Utility to handle authentication errors consistently
export function handleAuthError(error: any, router?: any) {
    const message = error.message || "Authentication error"

    if (message.includes("token") || message.includes("auth") || message.includes("session")) {
        clearAccessToken()
        toast({
            title: "Authentication Error",
            description: "Please log in again.",
            variant: "destructive"
        })

        if (router && typeof window !== 'undefined') {
            router.push("/login")
        }
    } else {
        toast({
            title: "Error",
            description: message,
            variant: "destructive"
        })
    }
}

// Hook for components to check authentication status
export function useAuth() {
    const checkAuth = () => {
        if (!isAuthenticated()) {
            clearAccessToken()
            return false
        }
        return true
    }

    const logout = () => {
        clearAccessToken()
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
    }

    return {
        isAuthenticated: checkAuth,
        getToken: getAccessToken,
        logout,
        getUserId: getUserIdFromToken
    }
}