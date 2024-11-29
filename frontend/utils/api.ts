const API_URL = 'http://localhost:5000'

export async function register(username: string, password: string) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
    return response
}

export async function login(username: string, password: string) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
    return response
}

export async function getBoard(token: string) {
    const response = await fetch(`${API_URL}/board`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return response
}

export async function updateBoard(token: string, lists: any[]) {
    const response = await fetch(`${API_URL}/update-board`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lists }),
    })
    return response
}

