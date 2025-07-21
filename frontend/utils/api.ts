// Legacy API functions - keeping for backward compatibility
// New components should use the centralized apiClient from apiClient.ts

import { apiClient, authAPI, userAPI, boardAPI, courseAPI, learningStrategyAPI, attachmentAPI, studySessionAPI, logAPI } from "./apiClient"
import { getAccessToken, setAccessToken, clearAccessToken } from "./auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Auth functions
export async function login(username: string, password: string) {
    try {
        const data = await authAPI.login(username, password)
        // Return a mock Response object to maintain compatibility
        return {
            ok: true,
            json: async () => data
        } as Response
    } catch (error: any) {
        // Return a mock Response object for errors
        return {
            ok: false,
            json: async () => ({ message: error.message || "Login failed" })
        } as Response
    }
}

export async function logout() {
    return authAPI.logout()
}

export async function register(firstName: string, lastName: string, email: string, username: string, password: string) {
    return authAPI.register({
        firstName,
        lastName,
        email,
        username,
        password
    })
}

// User functions
export async function getCurrentUser() {
    const token = getAccessToken()
    if (!token) {
        throw new Error("No token found")
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const userId = payload.sub
        return userAPI.getUserById(userId)
    } catch (error) {
        setAccessToken(null) // Clear invalid token
        throw new Error("Invalid token format")
    }
}

export async function searchUserByUsername(username: string) {
    return userAPI.getUserByUsername(username)
}

export async function searchUserById(userId: string) {
    return userAPI.getUserById(userId)
}

export async function updateProfile(userData: {
    first_name: string
    last_name: string
    email: string
    username: string
}) {
    return userAPI.updateProfile(userData)
}

export async function updatePassword(passwordData: {
    current_password: string
    new_password: string
}) {
    return userAPI.updatePassword(passwordData)
}

export async function getAllUsers() {
    return userAPI.getAllUsers()
}

export async function getUserByUsername(username: string) {
    return userAPI.getUserByUsername(username)
}

// Board functions
export async function getBoard() {
    return boardAPI.getBoard()
}

export async function updateBoard(boardId: string, lists: any[]) {
    return boardAPI.updateBoard(boardId, lists)
}

export async function createBoard(name: string) {
    return boardAPI.createBoard(name)
}

export async function searchBoards(query: string) {
    return boardAPI.searchBoards(query)
}

export async function getBoardByUser(userId: string) {
    return boardAPI.getBoardByUser(userId)
}

// Course functions
export async function getCourses() {
    return courseAPI.getCourses()
}

export async function addCourse(courseData: {
    course_code: string
    course_name: string
}) {
    return courseAPI.addCourse(courseData)
}

export async function updateCourse(courseCode: string, courseData: {
    course_code: string
    course_name: string
}) {
    return courseAPI.updateCourse(courseCode, courseData)
}

export async function deleteCourse(courseCode: string) {
    return courseAPI.deleteCourse(courseCode)
}

// Learning Strategy functions
export async function getAllLearningStrategies() {
    return learningStrategyAPI.getAllStrategies()
}

export async function addLearningStrategy(strategyData: {
    learning_strat_name: string
    description: string | null
}) {
    return learningStrategyAPI.addStrategy(strategyData)
}

export async function updateLearningStrategy(strategyId: string, strategyData: {
    learning_strat_name: string
    description: string | null
}) {
    return learningStrategyAPI.updateStrategy(strategyId, strategyData)
}

export async function deleteLearningStrategy(strategyId: string) {
    return learningStrategyAPI.deleteStrategy(strategyId)
}

// Attachment functions
export async function getCardAttachments(cardId: string) {
    return attachmentAPI.getCardAttachments(cardId)
}

export async function uploadFile(formData: FormData) {
    return attachmentAPI.uploadFile(formData)
}

export async function deleteFile(attachmentId: string) {
    return attachmentAPI.deleteFile(attachmentId)
}

export async function downloadFile(attachmentId: string, filename: string) {
    return attachmentAPI.downloadFile(attachmentId, filename)
}

// Study Session functions
export async function getCardStudySessions(cardId: string) {
    return studySessionAPI.getCardSessions(cardId)
}

export async function getActiveStudySession(cardId: string) {
    return studySessionAPI.getActiveSession(cardId)
}

export async function startStudySession(cardId: string) {
    return studySessionAPI.startSession(cardId)
}

export async function endStudySession(sessionId: string) {
    return studySessionAPI.endSession(sessionId)
}

// Log functions
export async function getAllLogs() {
    return logAPI.getAllLogs()
}

// Card Movement functions - commented out as cardMovementAPI is not implemented
// export async function createCardMovement(movementData: {
//     card_id: string
//     from_list_id: string
//     to_list_id: string
//     board_id: string | null
// }) {
//     return cardMovementAPI.createMovement(movementData)
// }

// export async function getCardMovements(cardId: string) {
//     return cardMovementAPI.getCardMovements(cardId)
// }

// Password reset functions
export async function requestReset(email: string) {
    return apiClient.post("/api/request-reset", { email })
}

export async function resetPassword(token: string, password: string) {
    return apiClient.post("/api/reset-password", { token, password })
}

// Utility function for token handling
export function getTokenFromStorage(): string | null {
    try {
        return localStorage.getItem("token")
    } catch (error) {
        return null
    }
}

// Export the centralized client for new components
export { apiClient } from "./apiClient"
