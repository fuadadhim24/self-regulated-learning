const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

import { authorizedFetch, getAccessToken } from "./auth"

// --- PUBLIC ROUTES ---

export async function register(firstName: string, lastName: string, email: string, username: string, password: string) {
    return fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, username, password }),
    })
}

export async function login(username: string, password: string) {
    return fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
}

// --- AUTHENTICATED ROUTES (use authorizedFetch) ---

export async function searchUserByUsername(username: string) {
    return authorizedFetch(`${API_URL}/username/${username}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
}

export async function searchUserById(userId: string) {
    const response = await authorizedFetch(`${API_URL}/users/id/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
        throw new Error(`Error fetching user: ${response.status} ${response.statusText}`)
    }

    return response.json()
}

export async function getCurrentUser() {
    const token = getAccessToken()
    if (!token) throw new Error("No access token")

    const payload = JSON.parse(atob(token.split(".")[1]))
    const userId = payload.sub

    return searchUserById(userId)
}

export async function updateProfile(userData: {
    first_name: string
    last_name: string
    email: string
    username: string
}) {
    return authorizedFetch(`${API_URL}/update-user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    })
}

export async function updatePassword(currentPassword: string, newPassword: string) {
    return authorizedFetch(`${API_URL}/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    })
}

export async function getBoard() {
    return authorizedFetch(`${API_URL}/board`)
}

export async function updateBoard(boardId: string, lists: any[]) {
    return authorizedFetch(`${API_URL}/update-board`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId, lists }),
    }).then((res) => res.json())
}

export async function createBoard(name: string) {
    return authorizedFetch(`${API_URL}/create-board`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    })
}

export async function searchBoards(query: string) {
    return authorizedFetch(`${API_URL}/search-boards?q=${encodeURIComponent(query)}`)
}

export async function getProgressReport() {
    return authorizedFetch(`${API_URL}/progress-report`)
}

export async function getCourses() {
    return authorizedFetch(`${API_URL}/courses`)
}

export async function deleteCourse(courseId: string) {
    return authorizedFetch(`${API_URL}/courses/${courseId}`, { method: "DELETE" })
}

export async function addCourse(course: any) {
    return authorizedFetch(`${API_URL}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
    })
}

export async function getBoardByUser(userId: string) {
    return authorizedFetch(`${API_URL}/board/${userId}`)
}

export async function getAllUsers() {
    return authorizedFetch(`${API_URL}/users`)
}

export async function getUserByUsername(username: string) {
    return authorizedFetch(`${API_URL}/users/username/${username}`)
}

export async function getAllLearningStrategies() {
    return authorizedFetch(`${API_URL}/learningstrats`)
}

export async function getLearningStrategy(id: string) {
    return authorizedFetch(`${API_URL}/learningstrats/${id}`)
}

export async function addLearningStrategy(strategy: { name: string; description?: string }) {
    return authorizedFetch(`${API_URL}/learningstrats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            learning_strat_name: strategy.name,
            description: strategy.description,
        }),
    })
}

export async function updateLearningStrategy(id: string, strategy: { name: string; description?: string }) {
    return authorizedFetch(`${API_URL}/learningstrats/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            learning_strat_name: strategy.name,
            description: strategy.description,
        }),
    })
}

export async function deleteLearningStrategy(id: string) {
    return authorizedFetch(`${API_URL}/learningstrats/${id}`, {
        method: "DELETE",
    })
}

export async function updateLinks(id: string, links: string[]) {
    return authorizedFetch(`${API_URL}/api/cards/${id}/links`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links }),
    })
}

export async function logout() {
    return authorizedFetch(`${API_URL}/api/logout`, {
        method: "POST",
    })
}

// New function to get all logs
export async function getAllLogs() {
    return authorizedFetch(`${API_URL}/api/logs`)
}

export async function requestReset(email: string) {
    return fetch(`${API_URL}/api/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    })
}

export async function resetPassword(token: string, newPassword: string) {
    return fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
    })
}
