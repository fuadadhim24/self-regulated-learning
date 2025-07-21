// API Request and Response Types

// Auth Types
export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    token: string
    user: User
    role: string
}

export interface RegisterRequest {
    firstName: string
    lastName: string
    email: string
    username: string
    password: string
}

export interface RegisterResponse {
    message: string
    user: User
}

export interface RefreshTokenResponse {
    access_token: string
}

// User Types
export interface User {
    _id: string
    first_name: string
    last_name: string
    email: string
    username: string
    role: string
    is_admin: boolean
    createdAt: string
    updatedAt: string
}

export interface UpdateProfileRequest {
    first_name: string
    last_name: string
    email: string
    username: string
}

export interface UpdatePasswordRequest {
    current_password: string
    new_password: string
}

export interface UpdatePasswordResponse {
    message: string
}

// Board Types
export interface Board {
    id: string
    name: string
    user_id: string
    lists: List[]
    createdAt: string
    updatedAt: string
}

export interface List {
    _id: string
    title: string
    cards: Card[]
    order: number
}

export interface Card {
    _id: string
    title: string
    sub_title: string
    description?: string
    difficulty: "easy" | "medium" | "hard" | "expert"
    priority: "low" | "medium" | "high" | "critical"
    learning_strategy?: string
    status: "not_started" | "in_progress" | "completed"
    archived: boolean
    deleted: boolean
    checklists?: Checklist[]
    links?: Link[]
    rating?: number
    notes?: string
    pre_test_grade?: string
    post_test_grade?: string
    course_code: string
    course_name: string
    material: string
    created_at: string
    updated_at: string
    column_movements: ColumnMovement[]
}

export interface Checklist {
    _id: string
    title: string
    items: ChecklistItem[]
}

export interface ChecklistItem {
    _id: string
    text: string
    completed: boolean
}

export interface Link {
    _id: string
    url: string
    title?: string
}

export interface ColumnMovement {
    _id: string
    fromColumn: string
    toColumn: string
    timestamp: string
}

export interface UpdateBoardRequest {
    boardId: string
    lists: List[]
}

export interface CreateBoardRequest {
    name: string
}

// Course Types
export interface Course {
    _id: string
    course_code: string
    course_name: string
    createdAt: string
    updatedAt: string
}

export interface CreateCourseRequest {
    course_code: string
    course_name: string
}

export interface UpdateCourseRequest {
    course_code: string
    course_name: string
}

// Learning Strategy Types
export interface LearningStrategy {
    _id: string
    learning_strat_name: string
    description?: string
    createdAt: string
    updatedAt: string
}

export interface CreateLearningStrategyRequest {
    learning_strat_name: string
    description?: string | null
}

export interface UpdateLearningStrategyRequest {
    learning_strat_name: string
    description?: string | null
}

// Attachment Types
export interface Attachment {
    _id: string
    original_filename: string
    stored_filename: string
    file_size: number
    mime_type: string
    card_id: string
    board_id: string
    uploaded_by: string
    created_at: string
}

export interface UploadFileRequest {
    file: File
    board_id: string
    card_id: string
}

export interface UploadFileResponse {
    attachment: Attachment
    message: string
}

// Study Session Types
export interface StudySession {
    _id: string
    card_id: string
    user_id: string
    start_time: string
    end_time?: string
    total_study_time_minutes: number
    created_at: string
    updated_at: string
}

export interface StartSessionRequest {
    card_id: string
}

export interface EndSessionRequest {
    session_id: string
}

export interface ActiveSessionResponse {
    is_active: boolean
    start_time?: string
    session_id?: string
}

export interface CardStudySessionsResponse {
    sessions: StudySession[]
    total_study_time_minutes: number
}

// Card Movement Types
export interface CardMovement {
    _id: string
    card_id: string
    from_list_id: string
    to_list_id: string
    board_id: string
    user_id: string
    created_at: string
}

export interface CreateCardMovementRequest {
    card_id: string
    from_list_id: string
    to_list_id: string
    board_id: string | null
}

// Log Types
export interface Log {
    _id: string
    user_id: string
    username: string
    action_type: "login" | "logout" | "create" | "update" | "delete"
    description: string
    created_at: string
}

// Error Types
export interface ApiError {
    error: string
    message: string
    status: number
}

export interface ValidationError {
    field: string
    message: string
}

// Pagination Types
export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

// Generic API Response
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

// Form Data Types
export interface FormData {
    [key: string]: any
}

// Search Types
export interface SearchRequest {
    query: string
    page?: number
    limit?: number
}

export interface SearchResponse<T> {
    results: T[]
    total: number
    page: number
    limit: number
} 