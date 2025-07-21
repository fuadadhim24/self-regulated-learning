import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import { useToast } from "./use-toast"
import { apiClient, createApiClientWithRouter } from "@/utils/apiClient"
import { isAuthenticated, clearAccessToken } from "@/utils/auth"

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
    enabled?: boolean
    dependencies?: any[]
}

interface UseApiState<T> {
    data: T | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

// Generic data fetching hook
export function useApi<T>(
    apiCall: () => Promise<T>,
    options: UseApiOptions<T> = {}
): UseApiState<T> {
    const { onSuccess, onError, enabled = true, dependencies = [] } = options
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    const router = useRouter()

    const fetchData = useCallback(async () => {
        if (!enabled || !isAuthenticated()) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            const result = await apiCall()
            setData(result)
            onSuccess?.(result)
        } catch (err: any) {
            const errorMessage = err.message || "An error occurred"
            setError(errorMessage)
            onError?.(err)

            // Show toast for user feedback
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }, [apiCall, enabled, onSuccess, onError, toast])

    useEffect(() => {
        fetchData()
    }, [fetchData, ...dependencies])

    return {
        data,
        loading,
        error,
        refetch: fetchData
    }
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options: {
        onSuccess?: (data: TData) => void
        onError?: (error: Error) => void
    } = {}
) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    const router = useRouter()

    const mutate = useCallback(async (variables: TVariables) => {
        if (!isAuthenticated()) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            const result = await mutationFn(variables)
            options.onSuccess?.(result)
            return result
        } catch (err: any) {
            const errorMessage = err.message || "An error occurred"
            setError(errorMessage)
            options.onError?.(err)

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            })
            throw err
        } finally {
            setLoading(false)
        }
    }, [mutationFn, options, toast])

    return {
        mutate,
        loading,
        error
    }
}

// Specific hooks for common API operations
export function useCurrentUser() {
    return useApi(() => apiClient.get("/users/me"))
}

export function useBoard() {
    return useApi(() => apiClient.get("/board"))
}

export function useCourses() {
    return useApi(() => apiClient.get("/courses"))
}

export function useLearningStrategies() {
    return useApi(() => apiClient.get("/learning-strategies"))
}

export function useUsers() {
    return useApi(() => apiClient.get("/users"))
}

export function useLogs() {
    return useApi(() => apiClient.get("/logs"))
}

export function useCardAttachments(cardId: string) {
    return useApi(
        () => apiClient.get(`/api/attachments/card/${cardId}`),
        { enabled: !!cardId, dependencies: [cardId] }
    )
}

export function useStudySessions(cardId: string) {
    return useApi(
        () => apiClient.get(`/api/study-sessions/card/${cardId}`),
        { enabled: !!cardId, dependencies: [cardId] }
    )
}

export function useActiveStudySession(cardId: string) {
    return useApi(
        () => apiClient.get(`/api/study-sessions/active/${cardId}`),
        { enabled: !!cardId, dependencies: [cardId] }
    )
}

// Mutation hooks
export function useUpdateBoard() {
    return useMutation(
        ({ boardId, lists }: { boardId: string; lists: any[] }) =>
            apiClient.post("/update-board", { boardId, lists })
    )
}

export function useAddCourse() {
    return useMutation(
        (courseData: any) => apiClient.post("/courses", courseData)
    )
}

export function useUpdateCourse() {
    return useMutation(
        ({ courseCode, courseData }: { courseCode: string; courseData: any }) =>
            apiClient.put(`/courses/${courseCode}`, courseData)
    )
}

export function useDeleteCourse() {
    return useMutation(
        (courseCode: string) => apiClient.delete(`/courses/${courseCode}`)
    )
}

export function useAddLearningStrategy() {
    return useMutation(
        (strategyData: any) => apiClient.post("/learning-strategies", strategyData)
    )
}

export function useUpdateLearningStrategy() {
    return useMutation(
        ({ strategyId, strategyData }: { strategyId: string; strategyData: any }) =>
            apiClient.put(`/learning-strategies/${strategyId}`, strategyData)
    )
}

export function useDeleteLearningStrategy() {
    return useMutation(
        (strategyId: string) => apiClient.delete(`/learning-strategies/${strategyId}`)
    )
}

export function useUploadFile() {
    return useMutation(
        (formData: FormData) => apiClient.upload("/api/attachments/upload", formData)
    )
}

export function useDeleteFile() {
    return useMutation(
        (attachmentId: string) => apiClient.delete(`/api/attachments/${attachmentId}`)
    )
}

export function useStartStudySession() {
    return useMutation(
        (cardId: string) => apiClient.post("/api/study-sessions/start", { card_id: cardId })
    )
}

export function useEndStudySession() {
    return useMutation(
        (sessionId: string) => apiClient.post("/api/study-sessions/end", { session_id: sessionId })
    )
}

// Authentication hook
export function useAuth() {
    const [isAuth, setIsAuth] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isAuthenticated()
            setIsAuth(authenticated)
            setLoading(false)

            if (!authenticated) {
                clearAccessToken()
                router.push("/login")
            }
        }

        checkAuth()
    }, [router])

    const logout = useCallback(async () => {
        try {
            await apiClient.post("/api/logout")
        } catch (error) {
            // Ignore logout errors
        } finally {
            clearAccessToken()
            router.push("/login")
        }
    }, [router])

    return {
        isAuthenticated: isAuth,
        loading,
        logout
    }
} 