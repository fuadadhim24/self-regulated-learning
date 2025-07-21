import { authorizedFetch, handleAuthError, clearAccessToken } from "./auth"
import { toast } from "@/hooks/use-toast"
import type {
    User,
    Board,
    Course,
    LearningStrategy,
    Log,
    CardMovement,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    UpdateProfileRequest,
    UpdatePasswordRequest,
    CreateCourseRequest,
    UpdateCourseRequest,
    CreateLearningStrategyRequest,
    UpdateLearningStrategyRequest,
    CreateCardMovementRequest,
    ApiResponse
} from "@/types/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Centralized API client with error handling
class ApiClient {
    private baseURL: string

    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    // Generic request method with error handling
    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        router?: any
    ): Promise<T> {
        try {
            const url = `${this.baseURL}${endpoint}`
            const response = await authorizedFetch(url, options)

            if (!response.ok) {
                const errorText = await response.text()
                let errorMessage: string

                try {
                    const errorData = JSON.parse(errorText)
                    errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`
                } catch {
                    errorMessage = errorText || `HTTP ${response.status}`
                }

                throw new Error(errorMessage)
            }

            // Handle empty responses
            const contentType = response.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
                return await response.json()
            }

            return {} as T
        } catch (error: any) {
            handleAuthError(error, router)
            throw error
        }
    }

    // GET request
    async get<T>(endpoint: string, router?: any): Promise<T> {
        return this.request<T>(endpoint, { method: "GET" }, router)
    }

    // POST request
    async post<T>(endpoint: string, data?: any, router?: any): Promise<T> {
        const options: RequestInit = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }

        if (data) {
            options.body = JSON.stringify(data)
        }

        return this.request<T>(endpoint, options, router)
    }

    // PUT request
    async put<T>(endpoint: string, data?: any, router?: any): Promise<T> {
        const options: RequestInit = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        }

        if (data) {
            options.body = JSON.stringify(data)
        }

        return this.request<T>(endpoint, options, router)
    }

    // DELETE request
    async delete<T>(endpoint: string, router?: any): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE" }, router)
    }

    // File upload
    async upload<T>(endpoint: string, formData: FormData, router?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: formData,
        }, router)
    }

    // Download file
    async download(endpoint: string, filename: string, router?: any): Promise<void> {
        try {
            const url = `${this.baseURL}${endpoint}`
            const response = await authorizedFetch(url, { method: "GET" })

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`)
            }

            const blob = await response.blob()
            const url2 = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url2
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url2)
            document.body.removeChild(a)
        } catch (error: any) {
            handleAuthError(error, router)
            throw error
        }
    }
}

// Create singleton instance
export const apiClient = new ApiClient(API_URL)

// Create a separate API client for auth endpoints that don't require tokens
class AuthApiClient {
    private baseURL: string

    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    // Generic request method without authentication
    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        router?: any
    ): Promise<T> {
        try {
            const url = `${this.baseURL}${endpoint}`
            const response = await fetch(url, { ...options, credentials: 'include' })

            if (!response.ok) {
                const errorText = await response.text()
                let errorMessage: string

                try {
                    const errorData = JSON.parse(errorText)
                    errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`
                } catch {
                    errorMessage = errorText || `HTTP ${response.status}`
                }

                throw new Error(errorMessage)
            }

            // Handle empty responses
            const contentType = response.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
                return await response.json()
            }

            return {} as T
        } catch (error: any) {
            throw error
        }
    }

    // POST request
    async post<T>(endpoint: string, data?: any, router?: any): Promise<T> {
        const options: RequestInit = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }

        if (data) {
            options.body = JSON.stringify(data)
        }

        return this.request<T>(endpoint, options, router)
    }
}

// Create auth API client instance
export const authApiClient = new AuthApiClient(API_URL)

// Auth API methods (don't require authentication)
export const authAPI = {
    login: (username: string, password: string): Promise<LoginResponse> =>
        authApiClient.post("/api/login", { username, password }),

    logout: (): Promise<ApiResponse> =>
        apiClient.post("/api/logout"),

    refresh: (): Promise<ApiResponse> =>
        authApiClient.post("/api/refresh"),

    register: (data: RegisterRequest): Promise<RegisterResponse> =>
        authApiClient.post("/api/register", data),
}

// User API methods
export const userAPI = {
    getCurrentUser: (): Promise<User> =>
        apiClient.get("/users/me"),

    getUserById: (userId: string): Promise<User> =>
        apiClient.get(`/users/id/${userId}`),

    getUserByUsername: (username: string): Promise<User> =>
        apiClient.get(`/users/username/${encodeURIComponent(username)}`),

    updateProfile: (userData: UpdateProfileRequest): Promise<User> =>
        apiClient.put("/update-user", userData),

    updatePassword: (passwordData: UpdatePasswordRequest): Promise<ApiResponse> =>
        apiClient.put("/update-password", passwordData),

    getAllUsers: (): Promise<User[]> =>
        apiClient.get("/users"),

    makeUserAdmin: (userId: string): Promise<ApiResponse> =>
        apiClient.put(`/users/${userId}/make-admin`),
}

// Board API methods
export const boardAPI = {
    getBoard: (): Promise<Board> =>
        apiClient.get("/board"),

    updateBoard: (boardId: string, lists: any[]): Promise<ApiResponse> =>
        apiClient.post("/update-board", { boardId, lists }),

    createBoard: (name: string): Promise<Board> =>
        apiClient.post("/create-board", { name }),

    searchBoards: (query: string): Promise<Board[]> =>
        apiClient.get(`/search-boards?q=${encodeURIComponent(query)}`),

    getBoardByUser: (userId: string): Promise<Board> =>
        apiClient.get(`/board/${userId}`),

    getProgressReport: (): Promise<any> =>
        apiClient.get("/progress-report"),
}

// Course API methods
export const courseAPI = {
    getCourses: (): Promise<Course[]> =>
        apiClient.get("/courses"),

    addCourse: (courseData: CreateCourseRequest): Promise<Course> =>
        apiClient.post("/courses", courseData),

    updateCourse: (courseCode: string, courseData: UpdateCourseRequest): Promise<Course> =>
        apiClient.put(`/courses/${courseCode}`, courseData),

    deleteCourse: (courseCode: string): Promise<ApiResponse> =>
        apiClient.delete(`/courses/${courseCode}`),
}

// Learning Strategy API methods
export const learningStrategyAPI = {
    getAllStrategies: (): Promise<LearningStrategy[]> =>
        apiClient.get("/learningstrats"),

    addStrategy: (strategyData: CreateLearningStrategyRequest): Promise<LearningStrategy> =>
        apiClient.post("/learningstrats", strategyData),

    updateStrategy: (strategyId: string, strategyData: UpdateLearningStrategyRequest): Promise<LearningStrategy> =>
        apiClient.put(`/learningstrats/${strategyId}`, strategyData),

    deleteStrategy: (strategyId: string): Promise<ApiResponse> =>
        apiClient.delete(`/learningstrats/${strategyId}`),
}

// Attachment API methods
export const attachmentAPI = {
    getCardAttachments: (cardId: string): Promise<any[]> =>
        apiClient.get(`/api/attachments/card/${cardId}`),

    uploadFile: (formData: FormData): Promise<any> =>
        apiClient.upload("/api/attachments/upload", formData),

    deleteFile: (attachmentId: string): Promise<ApiResponse> =>
        apiClient.delete(`/api/attachments/${attachmentId}`),

    downloadFile: (attachmentId: string, filename: string): Promise<void> =>
        apiClient.download(`/api/attachments/download/${attachmentId}`, filename),
}

// Study Session API methods
export const studySessionAPI = {
    getCardSessions: (cardId: string): Promise<any[]> =>
        apiClient.get(`/api/study-sessions/card/${cardId}`),

    getActiveSession: (cardId: string): Promise<any> =>
        apiClient.get(`/api/study-sessions/active/${cardId}`),

    startSession: (cardId: string): Promise<any> =>
        apiClient.post("/api/study-sessions/start", { card_id: cardId }),

    endSession: (sessionId: string): Promise<any> =>
        apiClient.post("/api/study-sessions/end", { session_id: sessionId }),
}

// Log API methods
export const logAPI = {
    getAllLogs: (): Promise<Log[]> =>
        apiClient.get("/api/logs"),
}

// Utility function for components to use with router
export function createApiClientWithRouter(router: any) {
    return {
        auth: {
            login: (username: string, password: string) =>
                apiClient.post("/api/login", { username, password }, router),
            logout: () =>
                apiClient.post("/api/logout", undefined, router),
        },
        user: {
            getCurrentUser: () =>
                apiClient.get("/users/me", router),
            updateProfile: (userData: UpdateProfileRequest) =>
                apiClient.put("/update-user", userData, router),
        },
        board: {
            getBoard: () =>
                apiClient.get("/board", router),
            updateBoard: (boardId: string, lists: any[]) =>
                apiClient.post("/update-board", { boardId, lists }, router),
        },
        // Add other APIs as needed
    }
} 